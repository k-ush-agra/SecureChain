const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB = 'db.json';
const USERS_DB = 'users.json';

const DOCTOR = { username: "doctor", password: "1234" };

if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify([]));
if (!fs.existsSync(USERS_DB)) fs.writeFileSync(USERS_DB, JSON.stringify([]));


app.post('/register', (req, res) => {
    const { name, password } = req.body;

    let users = JSON.parse(fs.readFileSync(USERS_DB));

    // Generate a unique patient ID (e.g., P-12345)
    let patientId;
    let isUnique = false;
    while (!isUnique) {
        patientId = "P-" + Math.floor(10000 + Math.random() * 90000);
        if (!users.find(u => u.patientId === patientId)) {
            isUnique = true;
        }
    }

    users.push({ patientId, name, password, accessCode: null });

    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

    res.json({ message: "Registered successfully", patientId });
});


// =========================
// 🔐 LOGIN
app.post('/login', (req, res) => {
    const { role, username, password, patientId } = req.body;

    if (role === "doctor") {
        if (username === DOCTOR.username && password === DOCTOR.password) {
            return res.json({ role: "doctor" });
        }
        return res.status(401).json({ message: "Invalid doctor login" });
    }

    let users = JSON.parse(fs.readFileSync(USERS_DB));
    const user = users.find(u => u.patientId === patientId && u.password === password);

    if (!user) return res.status(401).json({ message: "Invalid patient login" });

    res.json({ role: "patient", patientId, accessCode: user.accessCode });
});


// =========================
// 🔑 SET ACCESS CODE (PATIENT FIRST TIME ONLY)
app.post('/set-code', (req, res) => {
    const { patientId, accessCode } = req.body;

    let users = JSON.parse(fs.readFileSync(USERS_DB));
    let user = users.find(u => u.patientId === patientId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.accessCode) {
        return res.status(400).json({ message: "Already set" });
    }

    user.accessCode = accessCode;

    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

    res.json({ message: "Code set" });
});


// =========================
// ➕ ADD REPORT
app.post('/add', (req, res) => {
    const { patientId, report } = req.body;

    const users = JSON.parse(fs.readFileSync(USERS_DB));
    if (!users.find(u => u.patientId === patientId)) {
        return res.status(400).json({ message: "Patient not registered" });
    }

    let data = JSON.parse(fs.readFileSync(DB));
    let existingRec = data.find(r => r.patientId === patientId);

    let finalReport = report;
    if (existingRec) {
        // Append new diagnosis to existing report
        const oldReport = Buffer.from(existingRec.encrypted, 'base64').toString('utf-8');
        finalReport = `${oldReport}\n---\n${report}`;
        
        // Update the existing record
        const encrypted = Buffer.from(finalReport).toString('base64');
        const hash = crypto.createHash('sha256').update(patientId + encrypted + Date.now()).digest('hex');
        
        existingRec.encrypted = encrypted;
        existingRec.hash = hash;
        
        fs.writeFileSync(DB, JSON.stringify(data, null, 2));
        return res.json({ hash, message: "Report updated" });
    } else {
        // Create new record
        const encrypted = Buffer.from(finalReport).toString('base64');
        const hash = crypto.createHash('sha256').update(patientId + encrypted + Date.now()).digest('hex');
        
        data.push({ patientId, encrypted, hash });
        fs.writeFileSync(DB, JSON.stringify(data, null, 2));
        return res.json({ hash, message: "Report created" });
    }
});


// =========================
// 📋 DOCTOR VIEW ALL PATIENTS
app.get('/doctor-view', (req, res) => {
    const users = JSON.parse(fs.readFileSync(USERS_DB));
    const records = JSON.parse(fs.readFileSync(DB));

    // Combine all patient records. If a patient has multiple reports, show all.
    // If a patient has no reports, show them once with hash: null.
    const result = [];
    
    users.forEach(u => {
        const patientRecords = records.filter(r => r.patientId === u.patientId);
        if (patientRecords.length === 0) {
            result.push({ patientId: u.patientId, name: u.name || "N/A", hash: null });
        } else {
            patientRecords.forEach(rec => {
                result.push({ patientId: u.patientId, name: u.name || "N/A", hash: rec.hash });
            });
        }
    });

    res.json(result);
});


// =========================
// 📖 PATIENT VIEW
app.get('/patient/:id', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB));

    const recs = data
        .filter(r => r.patientId === req.params.id)
        .map(r => ({
            hash: r.hash,
            report: Buffer.from(r.encrypted, 'base64').toString('utf-8')
        }));

    res.json(recs);
});


// =========================
// 🔐 DOCTOR ACCESS
app.post('/doctor-access', (req, res) => {
    const { hash, accessCode } = req.body;

    const users = JSON.parse(fs.readFileSync(USERS_DB));
    const records = JSON.parse(fs.readFileSync(DB));

    const rec = records.find(r => r.hash === hash);
    if (!rec) return res.status(404).json({ message: "Not found" });

    const user = users.find(u => u.patientId === rec.patientId);

    if (!user || user.accessCode !== accessCode) {
        return res.status(403).json({ message: "Access denied" });
    }

    res.json({
        report: Buffer.from(rec.encrypted, 'base64').toString('utf-8')
    });
});


// =========================
// 🗑 DELETE
app.post('/delete', (req, res) => {
    const { hash, accessCode } = req.body;

    let users = JSON.parse(fs.readFileSync(USERS_DB));
    let records = JSON.parse(fs.readFileSync(DB));

    const rec = records.find(r => r.hash === hash);
    const user = users.find(u => u.patientId === rec.patientId);

    if (!user || user.accessCode !== accessCode) {
        return res.status(403).json({ message: "Wrong code" });
    }

    records = records.filter(r => r.hash !== hash);

    fs.writeFileSync(DB, JSON.stringify(records, null, 2));

    res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));