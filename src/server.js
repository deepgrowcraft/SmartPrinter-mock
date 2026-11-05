//
//  server.js
//  SmartPrinter-MockServer
//  Main Entrypoint for Virtual Multi-Brand AirPrint & IPP Server Farm
//

const os = require('os');
const printerProfiles = require('./config/printerProfiles');
const IPPServerInstance = require('./ipp/ippServer');
const bonjourAdvertiser = require('./mdns/bonjourAdvertiser');
const DashboardServer = require('./dashboard/dashboardServer');

function getLocalIPAddress() {
  const ifaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const a of addrs) {
      if (a.family === 'IPv4' && !a.internal) {
        return a.address;
      }
    }
  }
  return '127.0.0.1';
}

async function main() {
  const args = process.argv.slice(2);
  const hostIP = getLocalIPAddress();
  const dashboardPort = 3000;

  // Filter profiles based on CLI args
  let selectedProfiles = Object.values(printerProfiles);
  const brandArg = args.find(a => a.startsWith('--brand='));
  if (brandArg) {
    const brand = brandArg.split('=')[1].toLowerCase();
    selectedProfiles = selectedProfiles.filter(p => p.brand.toLowerCase() === brand || p.id.includes(brand));
    if (selectedProfiles.length === 0) {
      console.warn(`No profiles found for brand '${brand}'. Starting all profiles.`);
      selectedProfiles = Object.values(printerProfiles);
    }
  }

  console.log(`\n=============================================================`);
  console.log(`🖨️  SMART PRINTER — VIRTUAL MULTI-BRAND PRINTER FARM`);
  console.log(`   Host Wi-Fi IP: ${hostIP}`);
  console.log(`   Printers Fleet: ${selectedProfiles.length} Devices Online`);
  console.log(`=============================================================\n`);

  const activeServers = [];

  // 1. Start IPP HTTP server instances
  for (const profile of selectedProfiles) {
    const instance = new IPPServerInstance(profile, hostIP);
    try {
      await instance.start();
      activeServers.push(instance);
    } catch (err) {
      console.error(`Failed to start ${profile.name}:`, err.message);
    }
  }

  // 2. Broadcast mDNS Bonjour records for Apple AirPrint discovery
  console.log('\n[mDNS] Publishing Apple AirPrint (_ipp._tcp) Bonjour records...');
  for (const profile of selectedProfiles) {
    bonjourAdvertiser.advertisePrinter(profile, hostIP);
  }

  // 3. Start Web Dashboard
  const dashboard = new DashboardServer(dashboardPort, hostIP, selectedProfiles);
  await dashboard.start();

  console.log(`✨ All virtual printers are now broadcasting on Wi-Fi!`);
  console.log(`📱 Both SmartPrinterApp and Market Apps will discover these devices automatically.`);
  console.log(`💡 Press Ctrl+C to stop the server farm.\n`);

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n[Shutdown] Unpublishing Bonjour records & closing servers...');
    await bonjourAdvertiser.unpublishAll();
    for (const s of activeServers) {
      await s.stop();
    }
    await dashboard.stop();
    console.log('[Shutdown] Server farm stopped.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
