# 🛡️ ClassGuard: Full AI & Developer Master Context

ClassGuard is a high-security attendance system designed by **Meraj Alam** to eliminate classroom cheating. This document provides the complete context for AI assistants to understand the system architecture, security logic, and data flow.

---

## 🏗️ 1. System Architecture
The project follows a standard **MVC-ish Node.js pattern** using Express and Sequelize.

### File Structure Map
```text
/
├── server.js               # Entry point, initializes Express & Socket.io
├── public/                 # Frontend Assets
│   ├── index.html          # Main UI (Glassmorphism design)
│   ├── css/style.css       # Premium Dark/Light UI styles
│   └── js/app.js           # Frontend Logic & Socket Handling
├── src/
│   ├── controllers/        # Logical "Brain" of the system
│   │   ├── adminController.js      # Session & Export logic
│   │   ├── attendanceController.js # CRITICAL: Attendance validation
│   │   └── authController.js       # JWT Authentication
│   ├── middleware/         # Auth & Role protection
│   ├── models/             # Database Schemas (Sequelize)
│   ├── routes/             # API Endpoint definitions
│   ├── services/           # Helper services (QR generation)
│   ├── sockets/            # Socket.io event handlers
│   └── utils/              # Shared utilities (IP Normalization)
└── PROJECT_GUIDE.md        # This Context Document
```

---

## 🧠 2. The Core Security Pipeline
ClassGuard's value lies in its **Anti-Cheating Firewall**. When a student scans a QR code, the system performs a "Security Handshake":

| Layer | Component | Logic | Purpose |
| :--- | :--- | :--- | :--- |
| **1** | **Stateful QR** | `qrService.js` | Tokens refresh every **4s**. Only current/previous tokens work. | Prevents photo-sharing via WhatsApp. |
| **2** | **Session Check** | `Session` Model | Validates if `isActive: true`. | Prevents attendance on expired classes. |
| **3** | **Network Lock** | `ipUtils.js` | **(REMOVED)** This layer has been removed to prioritize speed and student accessibility. | Previously ensured classroom presence via WiFi. |
| **4** | **Device Lock** | FingerprintJS | Checks `deviceFingerprint` for duplicates in the session. | Prevents one student from marking for multiple friends. |

---

## 📡 3. API & WebSocket Documentation

### REST API Endpoints
*   **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
*   **Admin:**
    *   `POST /api/admin/session` (Starts a new session & captures Admin IP)
    *   `PUT /api/admin/session/:id/stop` (Ends session)
    *   `GET /api/admin/session/:id/attendance` (Live list)
    *   `GET /api/admin/session/:id/export` (Generates Excel)
*   **Attendance:**
    *   `POST /api/attendance/mark` (The main secure endpoint)

### WebSocket Events (`Socket.IO`)
*   `join-session` / `leave-session`: Admins join a room based on Session ID.
*   `new-qr`: Server emits a new dynamic QR data URL every 7s.
*   `attendance-marked`: Emitted to Admin when a student successfully checks in.

---

## 📊 4. Database Schema (Sequelize)
*   **User:** `id`, `name`, `email`, `password`, `role` (admin/student), `studentId`.
*   **Session:** `id`, `adminId`, `isActive`, `validGatewayIp`, `sessionStartTime`, `sessionEndTime`.
*   **Attendance:** `id`, `sessionId`, `studentId`, `ipAddress`, `deviceFingerprint`, `timestamp`.
*   **Log:** `id`, `action` (e.g., PROXY_ATTEMPT_BLOCKED), `details`, `ipAddress`.

---

## 🛠️ 5. Critical Implementation Rules for AI
1.  **IP Normalization:** Always use `normalizeIp` from `src/utils/ipUtils.js`. Node.js often sees IPv4 as `::ffff:127.0.0.1`. This utility strips the prefix for accurate comparison.
2.  **QR State:** QR tokens are **not** in the database. They live in a `Map` in `qrService.js`. If the server restarts, all active QR codes on projector screens become invalid.
3.  **UI Consistency:** The frontend uses **Glassmorphism**. When adding elements to `index.html`, use `.glass-panel` and standard CSS variables defined in `style.css`.
4.  **Security First:** Never suggest removing a validation layer (like the IP check) without explicitly warning about the security risk.
