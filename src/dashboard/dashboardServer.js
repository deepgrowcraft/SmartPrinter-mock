//
//  dashboardServer.js
//  SmartPrinter-MockServer
//  Web Monitoring Dashboard & REST API
//

const express = require('express');
const path = require('path');
const fs = require('fs');
const jobStore = require('../state/jobStore');
const printerProfiles = require('../config/printerProfiles');

class DashboardServer {
  constructor(port, hostIP, activePrinters) {
    this.port = port || 3000;
    this.hostIP = hostIP;
    this.activePrinters = activePrinters;
    this.app = express();
    this.server = null;
    this.sseClients = [];

    this.setupRoutes();
    this.setupEvents();
  }

  setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    // API: Get all active virtual printers
    this.app.get('/api/printers', (req, res) => {
      const list = this.activePrinters.map(p => {
        const state = jobStore.getPrinterState(p.id);
        return {
          id: p.id,
          brand: p.brand,
          name: p.name,
          model: p.model,
          port: p.port,
          color: p.color,
          duplex: p.duplex,
          ip: this.hostIP,
          endpoint: `ipp://${this.hostIP}:${p.port}/ipp/print`,
          state: state.state,
          reasons: state.reasons,
          accepting: state.accepting
        };
      });
      res.json(list);
    });

    // API: Get all captured print jobs
    this.app.get('/api/jobs', (req, res) => {
      res.json(jobStore.getAllJobs());
    });

    // API: Download or preview a printed job file
    this.app.get('/api/jobs/:id/file', (req, res) => {
      const job = jobStore.getJobById(req.params.id);
      if (!job || !fs.existsSync(job.filePath)) {
        return res.status(404).send('Job file not found');
      }

      if (job.format === 'PDF') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${job.fileName}"`);
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${job.fileName}"`);
      }
      fs.createReadStream(job.filePath).pipe(res);
    });

    // API: Hardware Error Simulator
    this.app.post('/api/printers/:id/simulate', (req, res) => {
      const { id } = req.params;
      const { state, reasons, accepting } = req.body;
      
      jobStore.setPrinterState(id, state || 'idle', reasons || 'none', accepting !== false);
      res.json({ success: true, printerId: id, state, reasons });
    });

    // API: Server-Sent Events (SSE) for live push updates
    this.app.get('/api/stream', (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      this.sseClients.push(res);

      req.on('close', () => {
        this.sseClients = this.sseClients.filter(c => c !== res);
      });
    });
  }

  setupEvents() {
    jobStore.on('new-job', (job) => {
      this.broadcastSSE('new-job', job);
    });

    jobStore.on('state-changed', (info) => {
      this.broadcastSSE('state-changed', info);
    });
  }

  broadcastSSE(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(payload);
      } catch (err) {
        // client disconnected
      }
    }
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        console.log(`\n======================================================`);
        console.log(`📊 LIVE MONITORING DASHBOARD: http://${this.hostIP}:${this.port}`);
        console.log(`   Localhost: http://localhost:${this.port}`);
        console.log(`======================================================\n`);
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
}

module.exports = DashboardServer;
