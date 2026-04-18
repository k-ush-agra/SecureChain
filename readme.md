# 🩺 SecureChain — Privacy-Centric Healthcare Record System

> Because medical data shouldn’t be treated like a group chat message.

---

## 🚀 Overview

**SecureChain** is a role-based healthcare system that ensures **patient-controlled access to medical records**.

Built with a focus on:

* 🔐 Privacy
* 🧠 Access Control
* ⚡ Simplicity
* 🎯 Demonstration-ready functionality

Unlike traditional systems, **doctors cannot access patient data without explicit consent** — enforced via a patient-generated access code.

---

## 🧠 Core Idea

> “The patient owns the data. The system enforces it.”

* Reports are **stored in encrypted form**
* Each patient sets a **personal access code**
* Doctors can:

  * View metadata (patient list, hashes)
  * But NOT the report without permission

---

## 🏗️ Architecture

```
Frontend (React + CSS)
        ↓
Backend (Node.js + Express)
        ↓
Storage (JSON files)
```

* No database complexity
* Fully local & demo-friendly
* Clean separation of roles

---

## 👨‍⚕️ Doctor Capabilities

* Register new patients
* Upload encrypted medical reports
* View all registered patients
* See report availability (via hash)
* Decrypt report **only with patient access code**
* Delete report with authentication

---

## 👤 Patient Capabilities

* Secure login
* Set access code (first-time only)
* View personal reports (no ID re-entry)
* Maintain full control over data access

---

## 🔐 Security Model

| Feature        | Implementation               |
| -------------- | ---------------------------- |
| Encryption     | Base64 encoding (demo-level) |
| Access Control | Patient-defined access code  |
| Authentication | Role-based login             |
| Data Isolation | Patient-specific filtering   |

> Yes, it's simplified. No, your professor doesn’t expect hospital-grade HIPAA compliance.

---

## 📁 Project Structure

```
securechain/
│
├── backend/
│   ├── server.js
│   ├── db.json
│   └── users.json
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
│
└── README.md
```

Backend logic: 
Frontend UI: 
Styling: 

---

## ⚙️ Installation & Setup

### 🔹 Backend

```bash
cd backend
npm install
node server.js
```

---

### 🔹 Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🎬 Demo Flow

### 🧪 Step-by-step

1. Doctor registers a patient
2. Patient logs in
3. Patient sets access code (first time only)
4. Doctor uploads report
5. Patient views report
6. Doctor attempts access → requires code
7. Patient shares code → doctor decrypts

---

## 🎨 UI Highlights

* Glassmorphism design
* Animated transitions
* Dashboard-based layout
* Toast notifications
* Responsive structure

---

## 🔮 Future Enhancements

* 🔐 AES Encryption
* 🌐 Database (MongoDB / Firebase)
* 🔑 JWT Authentication
* 📱 Mobile version
* ☁️ Deployment (Vercel + Render)

---

## 🧑‍💻 Author

Built with caffeine, confusion, and eventual clarity.

---

## 💬 Final Note

> This project doesn’t try to solve healthcare.
> It tries to show how **control over data should work**.

And honestly… it does a pretty decent job.