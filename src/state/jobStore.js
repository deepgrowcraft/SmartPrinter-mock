//
//  jobStore.js
//  SmartPrinter-MockServer
//  In-memory job tracking, disk storage, and real-time event bus
//

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class JobStore extends EventEmitter {
  constructor() {
    super();
    this.jobs = [];
    this.printerStates = {}; // id -> { state: 'idle', reasons: 'none', accepting: true }
    this.jobsDir = path.join(__dirname, '../../jobs');
    
    if (!fs.existsSync(this.jobsDir)) {
      fs.mkdirSync(this.jobsDir, { recursive: true });
    }
  }

  initPrinterState(printerId) {
    if (!this.printerStates[printerId]) {
      this.printerStates[printerId] = {
        state: 'idle',
        reasons: 'none',
        accepting: true
      };
    }
  }

  getPrinterState(printerId) {
    this.initPrinterState(printerId);
    return this.printerStates[printerId];
  }

  setPrinterState(printerId, state, reasons = 'none', accepting = true) {
    this.initPrinterState(printerId);
    this.printerStates[printerId] = { state, reasons, accepting };
    this.emit('state-changed', { printerId, ...this.printerStates[printerId] });
  }

  addJob(printerProfile, jobMeta, documentBuffer) {
    const jobId = this.jobs.length + 1;
    const timestamp = new Date();
    
    // Determine file extension from magic bytes
    let ext = 'bin';
    if (documentBuffer && documentBuffer.length >= 4) {
      const header4 = documentBuffer.slice(0, 4).toString();
      if (header4.startsWith('%PDF')) {
        ext = 'pdf';
      } else if (header4.startsWith('UNIR')) {
        ext = 'urf';
      } else if (documentBuffer[0] === 0xff && documentBuffer[1] === 0xd8) {
        ext = 'jpg';
      } else if (header4.startsWith('%!PS')) {
        ext = 'ps';
      }
    }

    const safeTitle = (jobMeta.jobName || 'Untitled')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .slice(0, 30);
    const fileName = `job_${jobId}_${printerProfile.id}_${safeTitle}.${ext}`;
    const filePath = path.join(this.jobsDir, fileName);

    if (documentBuffer && documentBuffer.length > 0) {
      try {
        fs.writeFileSync(filePath, documentBuffer);
      } catch (err) {
        console.error('[JobStore] Error saving job file:', err);
      }
    }

    const job = {
      id: jobId,
      printerId: printerProfile.id,
      printerName: printerProfile.name,
      printerBrand: printerProfile.brand,
      name: jobMeta.jobName || 'Untitled Document',
      clientIP: jobMeta.clientIP || 'Unknown IP',
      userAgent: jobMeta.userAgent || 'Unknown Client',
      userName: jobMeta.userName || 'Anonymous',
      copies: jobMeta.copies || 1,
      format: ext.toUpperCase(),
      sizeBytes: documentBuffer ? documentBuffer.length : 0,
      sizeFormatted: this.formatBytes(documentBuffer ? documentBuffer.length : 0),
      fileName: fileName,
      filePath: filePath,
      timestamp: timestamp,
      timeFormatted: timestamp.toLocaleTimeString() + ' ' + timestamp.toLocaleDateString(),
      status: 'completed'
    };

    this.jobs.unshift(job); // newest first
    this.emit('new-job', job);
    return job;
  }

  getAllJobs() {
    return this.jobs;
  }

  getJobById(id) {
    return this.jobs.find(j => j.id === parseInt(id, 10));
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

module.exports = new JobStore();
