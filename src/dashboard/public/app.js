//
//  app.js
//  SmartPrinter-MockServer Frontend Controller
//

let printers = [];
let jobs = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchPrinters();
  fetchJobs();
  setupSSE();
});

async function fetchPrinters() {
  try {
    const res = await fetch('/api/printers');
    printers = await res.json();
    renderPrinters();
    if (printers.length > 0) {
      document.getElementById('networkIp').textContent = `Wi-Fi IP: ${printers[0].ip}`;
      document.getElementById('printersCount').textContent = `${printers.length} Online`;
    }
  } catch (err) {
    console.error('Error fetching printers:', err);
  }
}

async function fetchJobs() {
  try {
    const res = await fetch('/api/jobs');
    jobs = await res.json();
    renderJobs();
  } catch (err) {
    console.error('Error fetching jobs:', err);
  }
}

function renderPrinters() {
  const container = document.getElementById('printersGrid');
  container.innerHTML = printers.map(p => {
    const brandClass = `brand-${p.brand.toLowerCase()}`;
    const isOnline = p.state === 'idle' && p.reasons === 'none';
    const statusText = isOnline ? 'ONLINE (Ready)' : `ALERT: ${p.reasons.toUpperCase()}`;
    const statusClass = isOnline ? 'status-online' : 'status-warning';

    return `
      <div class="printer-card" id="card-${p.id}">
        <div class="card-top">
          <span class="brand-badge ${brandClass}">${p.brand}</span>
          <span class="status-indicator ${statusClass}">
            <span class="pulse-dot" style="${isOnline ? '' : 'background: #f59e0b; box-shadow: 0 0 10px #f59e0b;'}"></span>
            ${statusText}
          </span>
        </div>
        <div class="printer-name">${p.name}</div>
        <div class="printer-endpoint">${p.endpoint}</div>
        <div class="features-row">
          <span class="feature-pill">Port ${p.port}</span>
          <span class="feature-pill">${p.color ? 'Color & Photo' : 'Monochrome'}</span>
          <span class="feature-pill">${p.duplex ? 'Auto-Duplex' : 'Single-Sided'}</span>
          <span class="feature-pill">AirPrint + IPP</span>
        </div>
        <div class="simulation-controls">
          <button class="btn-sim" onclick="simulateState('${p.id}', 'idle', 'none')">Ready</button>
          <button class="btn-sim" onclick="simulateState('${p.id}', 'stopped', 'media-empty')">Out of Paper</button>
          <button class="btn-sim" onclick="simulateState('${p.id}', 'processing', 'toner-low')">Toner Low</button>
          <button class="btn-sim" onclick="simulateState('${p.id}', 'stopped', 'door-open')">Door Open</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderJobs() {
  const tbody = document.getElementById('jobsTableBody');
  document.getElementById('jobsCount').textContent = `${jobs.length} Jobs Received`;

  if (jobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No print jobs received yet. Connect from iOS and tap Print!</td></tr>`;
    return;
  }

  tbody.innerHTML = jobs.map(j => `
    <tr>
      <td><strong>#${j.id}</strong></td>
      <td>${j.printerName}</td>
      <td><strong>${j.name}</strong></td>
      <td><code>${j.clientIP}</code></td>
      <td><span class="feature-pill">${j.userAgent.slice(0, 30)}</span></td>
      <td><span class="badge badge-accent">${j.format}</span></td>
      <td>${j.sizeFormatted}</td>
      <td>${j.timeFormatted}</td>
      <td>
        <a href="/api/jobs/${j.id}/file" target="_blank" class="btn-action">View Document</a>
      </td>
    </tr>
  `).join('');
}

async function simulateState(printerId, state, reasons) {
  try {
    await fetch(`/api/printers/${printerId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, reasons, accepting: (reasons === 'none') })
    });
    logTerminal(`[Simulator] ${printerId} status changed to ${state} (${reasons})`, 'warn');
    fetchPrinters();
  } catch (err) {
    console.error('Error simulating state:', err);
  }
}

function setupSSE() {
  const eventSource = new EventSource('/api/stream');

  eventSource.addEventListener('new-job', (e) => {
    const job = JSON.parse(e.data);
    jobs.unshift(job);
    renderJobs();
    logTerminal(`[PRINT JOB #${job.id}] Received "${job.name}" (${job.format}, ${job.sizeFormatted}) from ${job.clientIP} on ${job.printerName}`, 'job');
  });

  eventSource.addEventListener('state-changed', (e) => {
    fetchPrinters();
  });
}

function logTerminal(message, type = 'info') {
  const box = document.getElementById('terminalBox');
  const time = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.className = `log-line ${type}`;
  div.textContent = `[${time}] ${message}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function clearLogs() {
  document.getElementById('terminalBox').innerHTML = '';
}

