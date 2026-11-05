//
//  ippServer.js
//  SmartPrinter-MockServer
//  HTTP/IPP Server Instance for a Printer Profile
//

const http = require('http');
const ipp = require('ipp');
const ippResponseBuilder = require('./ippResponseBuilder');
const jobStore = require('../state/jobStore');

class IPPServerInstance {
  constructor(profile, hostIP) {
    this.profile = profile;
    this.hostIP = hostIP;
    this.server = null;
    this.port = profile.port;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on('error', (err) => {
        console.error(`[${this.profile.brand}] Error on port ${this.port}:`, err.message);
        reject(err);
      });

      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`[${this.profile.brand}] ${this.profile.name} listening on port ${this.port}`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  handleRequest(req, res) {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'AirPrint Client';

    // IPP uses POST method for all RPC operations
    if (req.method === 'POST') {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      
      req.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        this.processIPPMessage(bodyBuffer, req, res, clientIP, userAgent);
      });
    } else {
      // Friendly Web status check if someone visits http://<ip>:<port>/ in a browser
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="font-family: system-ui, sans-serif; background: #0c0e14; color: #fff; padding: 40px;">
            <h2>🖨️ ${this.profile.name}</h2>
            <p style="color: #10b981;">● Status: ONLINE (Ready for AirPrint & IPP)</p>
            <p>Brand: <strong>${this.profile.brand}</strong></p>
            <p>Model: <strong>${this.profile.model}</strong></p>
            <p>Port: <strong>${this.port}</strong></p>
            <p>IPP Endpoint: <code>ipp://${this.hostIP}:${this.port}/ipp/print</code></p>
          </body>
        </html>
      `);
    }
  }

  processIPPMessage(buffer, req, res, clientIP, userAgent) {
    let parsed;
    try {
      parsed = ipp.parse(buffer);
    } catch (err) {
      console.error(`[${this.profile.brand}] Failed to parse IPP buffer from ${clientIP}:`, err.message);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad IPP Request');
      return;
    }

    const operation = parsed.operation;
    const opAttrs = parsed['operation-attributes-tag'] || {};
    const stateInfo = jobStore.getPrinterState(this.profile.id);

    console.log(`[${this.profile.brand}] [${clientIP}] Operation: ${operation} | User-Agent: ${userAgent}`);

    let responseObj;

    switch (operation) {
      case 'Get-Printer-Attributes': {
        responseObj = ippResponseBuilder.buildPrinterAttributesResponse(
          parsed,
          this.profile,
          stateInfo,
          this.hostIP
        );
        break;
      }

      case 'Validate-Job': {
        if (!stateInfo.accepting) {
          responseObj = ippResponseBuilder.buildErrorResponse(
            parsed,
            'server-error-not-accepting-jobs',
            'Printer is not accepting jobs'
          );
        } else {
          responseObj = ippResponseBuilder.buildValidateJobResponse(parsed);
        }
        break;
      }

      case 'Print-Job':
      case 'Send-Document': {
        const jobName = opAttrs['job-name'] || 'Document';
        const docFormat = opAttrs['document-format'] || 'application/octet-stream';
        const copies = parsed['job-attributes-tag'] ? parsed['job-attributes-tag']['copies'] : 1;
        const userName = opAttrs['requesting-user-name'] || 'iOS User';
        const documentBuffer = parsed.data;

        console.log(`\n========================================`);
        console.log(`📥 NEW PRINT JOB RECEIVED ON ${this.profile.name}`);
        console.log(`   Job Name: ${jobName}`);
        console.log(`   Client IP: ${clientIP}`);
        console.log(`   Format: ${docFormat}`);
        console.log(`   Payload Size: ${documentBuffer ? documentBuffer.length : 0} bytes`);
        console.log(`   App / User Agent: ${userAgent}`);
        console.log(`========================================\n`);

        const job = jobStore.addJob(
          this.profile,
          {
            jobName,
            clientIP,
            userAgent,
            userName,
            copies
          },
          documentBuffer
        );

        responseObj = ippResponseBuilder.buildPrintJobResponse(
          parsed,
          job,
          this.hostIP,
          this.port
        );
        break;
      }

      case 'Get-Job-Attributes': {
        const jobId = opAttrs['job-id'] || 1;
        const job = jobStore.getJobById(jobId);
        responseObj = ippResponseBuilder.buildGetJobAttributesResponse(parsed, job);
        break;
      }

      default: {
        // Return OK for unrecognized benign operations
        responseObj = ippResponseBuilder.buildValidateJobResponse(parsed);
        break;
      }
    }

    try {
      const responseBuffer = ipp.serialize(responseObj);
      res.writeHead(200, {
        'Content-Type': 'application/ipp',
        'Content-Length': responseBuffer.length
      });
      res.end(responseBuffer);
    } catch (err) {
      console.error(`[${this.profile.brand}] Error serializing IPP response:`, err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
}

module.exports = IPPServerInstance;

