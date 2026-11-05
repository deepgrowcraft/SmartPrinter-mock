//
//  bonjourAdvertiser.js
//  SmartPrinter-MockServer
//  Bonjour / Zeroconf mDNS advertisement for Apple AirPrint discovery
//

const { Bonjour } = require('bonjour-service');

class BonjourAdvertiser {
  constructor() {
    this.bonjour = new Bonjour();
    this.publishedServices = [];
  }

  advertisePrinter(profile, hostIP) {
    try {
      const service = this.bonjour.publish({
        name: profile.name,
        type: 'ipp',
        subtypes: ['_universal._sub._ipp._tcp'],
        port: profile.port,
        host: `${profile.id}.local`,
        txt: profile.txt
      });

      this.publishedServices.push(service);

      service.on('up', () => {
        console.log(`[mDNS Bonjour] Advertised '${profile.name}' on _ipp._tcp:${profile.port}`);
      });

      service.on('error', (err) => {
        console.error(`[mDNS Bonjour] Error advertising '${profile.name}':`, err.message);
      });

      return service;
    } catch (err) {
      console.error(`[mDNS Bonjour] Exception publishing '${profile.name}':`, err.message);
      return null;
    }
  }

  unpublishAll() {
    return new Promise((resolve) => {
      this.bonjour.unpublishAll(() => {
        this.bonjour.destroy();
        this.publishedServices = [];
        resolve();
      });
    });
  }
}

module.exports = new BonjourAdvertiser();
