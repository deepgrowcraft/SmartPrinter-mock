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
    
    // Catch global bonjour errors (such as socket collisions)
    if (this.bonjour && typeof this.bonjour.on === 'function') {
      this.bonjour.on('error', (err) => {
        console.warn(`[mDNS Bonjour Global Warning] ${err.message}`);
      });
    }
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
        if (err.message && err.message.includes('already in use')) {
          console.warn(`[mDNS Bonjour Notice] '${profile.name}' is already broadcasting or cached.`);
        } else {
          console.error(`[mDNS Bonjour] Error advertising '${profile.name}':`, err.message);
        }
      });

      return service;
    } catch (err) {
      console.error(`[mDNS Bonjour] Exception publishing '${profile.name}':`, err.message);
      return null;
    }
  }

  unpublishAll() {
    return new Promise((resolve) => {
      try {
        this.bonjour.unpublishAll(() => {
          try {
            this.bonjour.destroy();
          } catch (e) {}
          this.publishedServices = [];
          resolve();
        });
      } catch (err) {
        this.publishedServices = [];
        resolve();
      }
    });
  }
}

module.exports = new BonjourAdvertiser();
