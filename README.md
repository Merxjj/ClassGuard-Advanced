# ClassGuard Smart Attendance System

**🚀 Live Demo:** [https://sad-pumas-draw.loca.lt](https://sad-pumas-draw.loca.lt)

ClassGuard is an advanced, secure attendance tracking platform designed to eliminate classroom cheating. It combines dynamic QR codes, live WebSockets, physical network boundaries, and rigorous device-fingerprinting. 

Developed by **Meraj Alam**.

---

## 🔄 The System Workflow

### 1. The Professor's Dashboard (Admin)
- **Session Creation**: The Admin (Professor) logs into their dashboard and clicks **"Start Attendance Session"**. 
- **Dynamic Projection**: The system instantly generates a highly secure, fullscreen-capable QR Code and projects it onto the classroom screen.
- **Stateful Shifting**: To prevent students from taking a photograph and texting it to their friends, the server dynamically regenerates and flashes a new QR Code entirely in the background every few seconds.

### 2. The Student Check-In (Client)
- **Scanning Context**: Students open the web application on their mobile phones.
- **Secure Web-Camera**: They point their phone camera at the projector. The system strictly requests Camera permissions using an elegant UI overlay.
- **Immediate Feedback**: Within milliseconds of scanning, the encrypted code transmits to the server. If successful, the student is greeted with a ✅ Success screen and their camera powers down.

### 3. The Security Firewall (Back-End)
When a student scans the QR code, the ClassGuard backend executes strict validation before counting them as "Present":
- **The Protocol Verification**: Is the QR code the actively shifting correct code? If it is even 2 seconds too old, it is rejected.
- **The Network Router Check (IP-Bound)**: It mathematically analyzes the Cloud Proxy headers to discover the student's true local Wi-Fi router. If the student is sitting in their dorm room instead of connected to the University/Classroom Wi-Fi, the request is immediately caught and blocked.
- **The Physical Device Lock**: The system captures a digital fingerprint of the physical mobile phone. If "Student A" marks their attendance, logs out, and hands their phone to "Student B" to cheat, the system mathematically recognizes the overlapping hardware chip and throws a massive **Red Penalty Screen**, aggressively locking the device!

### 4. Real-Time Tracking & Export
- **Live Updating**: As the firewall validates students, their names and IDs instantly pop up in real-time on the Professor's dashboard via `Socket.IO` web-sockets.
- **Finalizing**: At the end of class, the Professor clicks "Stop Session" (freezing any late attempts).
- **Exporting**: With one click of the "Export Excel" button, the system bundles the timestamps, names, and IDs into an organized `.xlsx` spreadsheet which automatically downloads to the Professor's computer.

---

## 🛠️ Technology Stack
- **Frontend**: Vanilla HTML/JS, Glassmorphism CSS, HTML5-QRCode
- **Backend Environment**: Node.js, Express.js
- **Network Engine**: Socket.IO (Real-time TCP streams)
- **Database Architecture**: Sequelize ORM managing PostgreSQL (Cloud) / SQLite (Local)
- **Security Logic**: Express-Rate-Limit, BCrypt, Hardware Device Fingerprinting

---
*© 2026 Developed by Meraj Alam. All Rights Reserved.*
