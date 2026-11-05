# Smart Printer — Virtual Multi-Brand AirPrint & IPP Server Farm

A production-grade, multi-brand virtual printer simulator built with **Node.js, Bonjour (mDNS), and IPP (Internet Printing Protocol - RFC 8010/8011)**.

It behaves **exactly like real physical wireless printers** on your local Wi-Fi network, allowing you to test:
1. **Your Own SmartPrinterApp iOS Project**.
2. **Third-Party App Store Market Apps** (HP Smart, Canon PRINT, Epson iPrint, Brother iPrint&Scan, Smart Printer, AirPrint apps).
3. **Native Apple AirPrint** (Print directly from iPhone/iPad Safari, Photos, Mail, or Files).

---

## 🖨️ Supported Virtual Printer Fleet

| Brand | Model Name | Type | Port | Features |
| :--- | :--- | :--- | :--- | :--- |
| **HP** | `HP LaserJet Pro MFP 4101fdw` | Fast Office Laser | `8631` | Monochrome, Auto-Duplex, A4/Letter |
| **HP** | `HP ENVY Inspire 7955e` | Photo Inkjet | `8632` | High-Resolution Color, 4x6" Photos, Duplex |
| **Canon** | `Canon PIXMA G7020 Series` | MegaTank All-In-One | `8633` | Color Inkjet, Auto-Duplex, High Yield |
| **Epson** | `Epson EcoTank ET-4850` | SuperTank All-In-One | `8634` | Color, ADF, Legal/A4 |
| **Brother** | `Brother MFC-L3770CDW` | Digital Color Laser | `8635` | Color Laser, Duplex, Network IPP |
| **Xerox** | `Xerox VersaLink C405` | Enterprise Multifunction | `8636` | High-Volume Office Color |

---

## 🚀 Quick Start

### 1. Start All Brands Simultaneously
```bash
cd /Users/apple/Desktop/Projects/SmartPrinter/SmartPrinter-MockServer
npm start
```

### 2. Start a Specific Brand Only
```bash
npm run hp       # Starts HP LaserJet & HP Envy only
npm run canon    # Starts Canon PIXMA only
npm run epson    # Starts Epson EcoTank only
npm run brother  # Starts Brother MFC only
```

---

## 📊 Live Web Monitoring Dashboard

Open in your browser:
- **`http://localhost:3000`** (on your Mac)
- **`http://<your-mac-ip>:3000`** (e.g. `http://192.168.1.11:3000` from any device on your Wi-Fi)

### Dashboard Capabilities:
- **Printers Fleet Overview**: See active online status, port numbers, and mDNS broadcast state.
- **Live Handshake Feed**: Real-time terminal log of incoming Bonjour mDNS probes, attribute queries, and print jobs.
- **Captured Print Jobs**: View received documents, see page count, copies, client IP, app name, and **1-click preview/download of the actual printed PDF**!
- **Hardware Error Simulator**: Simulate "Out of Paper", "Toner Low", "Door Open", or "Offline" to test how iOS apps handle error alerts.

---

## 📱 How to Test

### Test 1: With Our SmartPrinterApp iOS Project
1. Run `SmartPrinterApp` on your iPhone or iOS Simulator.
2. Ensure iPhone is connected to the same Wi-Fi network as your Mac.
3. Tap **"Connect Printer"**:
   - The radar sonar animation will immediately discover the virtual printers (`HP LaserJet Pro MFP 4101fdw`, `Canon PIXMA G7020`, etc.).
   - Tap any printer to connect.
   - Tap **"Print Test Page"** or print any photo/document.
   - The job will appear instantly in your terminal and Web Dashboard!

### Test 2: With Native iOS AirPrint (Safari, Photos, Files)
1. Open any photo or webpage on your iPhone.
2. Tap the iOS **Share button** ➔ **Print**.
3. Tap **"Select Printer"**:
   - iOS will discover all 6 virtual printers under "Printers Nearby".
4. Tap **Print**:
   - iOS will transmit the raster / PDF stream to your Mac.
   - The server saves the file into `jobs/` and logs the completion!

### Test 3: With App Store Market Apps
1. Open any competitor printer app on your iPhone.
2. Scan for local printers on Wi-Fi:
   - Because this mock server responds with standard RFC 8010/8011 IPP attributes and Apple `image/urf` / `application/pdf` formats, market apps will treat it as genuine hardware!
