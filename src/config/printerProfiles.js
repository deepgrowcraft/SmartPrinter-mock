//
//  printerProfiles.js
//  SmartPrinter-MockServer
//  Comprehensive profiles for top printer brands
//

module.exports = {
  'hp-laserjet': {
    id: 'hp-laserjet',
    brand: 'HP',
    name: 'HP LaserJet Pro MFP 4101fdw',
    model: 'HP LaserJet Pro MFP 4101fdw',
    description: 'High-speed monochrome office laser printer with duplexing',
    port: 8631,
    color: false,
    duplex: true,
    scan: true,
    uuid: '4305e94b-4835-4f76-805c-3f2d019f3f22',
    note: 'Office Floor 2 - Fast Laser',
    media: ['iso_a4_210x297mm', 'na_letter_8.5x11in', 'na_legal_8.5x14in'],
    defaultMedia: 'iso_a4_210x297mm',
    txt: {
      txtvers: '1',
      qtotal: '1',
      rp: 'ipp/print',
      ty: 'HP LaserJet Pro MFP 4101fdw',
      product: '(HP LaserJet Pro MFP 4101fdw)',
      note: 'Office Floor 2 - Wi-Fi 5G',
      pdl: 'application/pdf,image/urf,image/jpeg,application/postscript',
      URF: 'W8,SRGB24,CP1,RS600',
      Color: 'F',
      Duplex: 'T',
      Scan: 'T',
      UUID: '4305e94b-4835-4f76-805c-3f2d019f3f22',
      priority: '10'
    }
  },

  'hp-envy': {
    id: 'hp-envy',
    brand: 'HP',
    name: 'HP ENVY Inspire 7955e',
    model: 'HP ENVY Inspire 7955e Series',
    description: 'Wireless all-in-one color photo printer',
    port: 8632,
    color: true,
    duplex: true,
    scan: true,
    uuid: '7b2a9e14-6814-4a25-91df-4b7194f1c911',
    note: 'Creative Studio - Photo Lab',
    media: ['iso_a4_210x297mm', 'na_letter_8.5x11in', 'na_index-4x6_4x6in', 'na_5x7_5x7in'],
    defaultMedia: 'iso_a4_210x297mm',
    txt: {
      txtvers: '1',
      qtotal: '1',
      rp: 'ipp/print',
      ty: 'HP ENVY Inspire 7955e Series',
      product: '(HP ENVY Inspire 7955e Series)',
      note: 'Creative Studio - Photo Lab',
      pdl: 'application/pdf,image/urf,image/jpeg',
      URF: 'W8,SRGB24,CP1,RS600,DM1',
      Color: 'T',
      Duplex: 'T',
      Scan: 'T',
      UUID: '7b2a9e14-6814-4a25-91df-4b7194f1c911',
      priority: '20'
    }
  },

  'canon-pixma': {
    id: 'canon-pixma',
    brand: 'Canon',
    name: 'Canon PIXMA G7020 Series',
    model: 'Canon PIXMA G7020 All-in-One MegaTank',
    description: 'High-yield MegaTank color inkjet with auto-duplex',
    port: 8633,
    color: true,
    duplex: true,
    scan: true,
    uuid: '9c5812d8-21f4-4110-8bfe-30fae24484aa',
    note: 'Home Office - Canon MegaTank',
    media: ['iso_a4_210x297mm', 'na_letter_8.5x11in', 'na_index-4x6_4x6in'],
    defaultMedia: 'iso_a4_210x297mm',
    txt: {
      txtvers: '1',
      qtotal: '1',
      rp: 'ipp/print',
      ty: 'Canon PIXMA G7020 Series',
      product: '(Canon PIXMA G7020 Series)',
      note: 'Home Office - Canon MegaTank',
      pdl: 'application/pdf,image/urf,image/jpeg',
      URF: 'W8,SRGB24,CP1,RS600',
      Color: 'T',
      Duplex: 'T',
      Scan: 'T',
      UUID: '9c5812d8-21f4-4110-8bfe-30fae24484aa',
      priority: '30'
    }
  },

  'epson-ecotank': {
    id: 'epson-ecotank',
    brand: 'Epson',
    name: 'Epson EcoTank ET-4850',
    model: 'Epson EcoTank ET-4850 Series',
    description: 'Cartridge-Free Supertank color printer with fax & ADF',
    port: 8634,
    color: true,
    duplex: true,
    scan: true,
    uuid: '1e4a6d77-3801-4478-9a3d-82d415b637ee',
    note: 'Main Floor - EcoTank SuperTank',
    media: ['iso_a4_210x297mm', 'na_letter_8.5x11in', 'na_legal_8.5x14in'],
    defaultMedia: 'iso_a4_210x297mm',
    txt: {
      txtvers: '1',
      qtotal: '1',
      rp: 'ipp/print',
      ty: 'Epson EcoTank ET-4850 Series',
      product: '(Epson EcoTank ET-4850 Series)',
      note: 'Main Floor - EcoTank SuperTank',
      pdl: 'application/pdf,image/urf,image/jpeg',
      URF: 'W8,SRGB24,CP1,RS600',
      Color: 'T',
      Duplex: 'T',
      Scan: 'T',
      UUID: '1e4a6d77-3801-4478-9a3d-82d415b637ee',
      priority: '40'
    }
  },

  'brother-mfc': {
    id: 'brother-mfc',
    brand: 'Brother',
    name: 'Brother MFC-L3770CDW',
    model: 'Brother MFC-L3770CDW Digital Color',
    description: 'High-performance wireless digital color all-in-one with NFC',
    port: 8635,
    color: true,
    duplex: true,
    scan: true,
    uuid: 'f2d65910-1845-4299-b14e-7d63e9f45601',
    note: 'Marketing Dept - Brother Color',
    media: ['iso_a4_210x297mm', 'na_letter_8.5x11in', 'na_legal_8.5x14in'],
    defaultMedia: 'iso_a4_210x297mm',
    txt: {
      txtvers: '1',
      qtotal: '1',
      rp: 'ipp/print',
      ty: 'Brother MFC-L3770CDW',
      product: '(Brother MFC-L3770CDW)',
      note: 'Marketing Dept - Brother Color',
      pdl: 'application/pdf,image/urf,image/jpeg,application/postscript',
      URF: 'W8,SRGB24,CP1,RS600',
      Color: 'T',
      Duplex: 'T',
      Scan: 'T',
      UUID: 'f2d65910-1845-4299-b14e-7d63e9f45601',
      priority: '50'
    }
  },

  'xerox-versalink': {
    id: 'xerox-versalink',
    brand: 'Xerox',
    name: 'Xerox VersaLink C405',
    model: 'Xerox VersaLink C405 Color Multifunction',
    description: 'Enterprise ConnectKey technology color multifunction printer',
    port: 8636,
    color: true,
    duplex: true,
    scan: true,
    uuid: 'e713a055-7281-4355-89b1-591d848123c8',
    note: 'Corporate Hub - Xerox VersaLink',
    media: ['iso_a4_210x297mm', 'na_letter_8.5x11in', 'na_legal_8.5x14in'],
    defaultMedia: 'iso_a4_210x297mm',
    txt: {
      txtvers: '1',
      qtotal: '1',
      rp: 'ipp/print',
      ty: 'Xerox VersaLink C405',
      product: '(Xerox VersaLink C405)',
      note: 'Corporate Hub - Xerox VersaLink',
      pdl: 'application/pdf,image/urf,image/jpeg,application/postscript',
      URF: 'W8,SRGB24,CP1,RS600',
      Color: 'T',
      Duplex: 'T',
      Scan: 'T',
      UUID: 'e713a055-7281-4355-89b1-591d848123c8',
      priority: '60'
    }
  }
};
