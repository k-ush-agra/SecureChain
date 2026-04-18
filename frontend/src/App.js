import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [role, setRole] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Patient Login State
  const [password, setPassword] = useState('');
  const [patientId, setPatientId] = useState('');
  const [accessCode, setAccessCode] = useState('');

  // Doctor Action State
  const [report, setReport] = useState('');
  const [records, setRecords] = useState([]);
  const [hash, setHash] = useState('');
  const [code, setCode] = useState('');

  // Toast System State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    setRole(null);
    setLoggedIn(false);
    setRecords([]);
    setPatientId('');
    setAccessCode('');
    setPassword('');
    setHash('');
    setCode('');
  };

  // API Call Wrapper
  const apiCall = async (action, successMsg) => {
    setLoading(true);
    try {
      await action();
      if (successMsg) showToast(successMsg, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || "An error occurred", 'error');
    } finally {
      setLoading(false);
    }
  };

  const login = () => apiCall(async () => {
    const res = await axios.post('http://localhost:3000/login', { 
      role: "patient", 
      password, 
      patientId 
    });
    setLoggedIn(true);
    setPatientId(res.data.patientId);
    setAccessCode(res.data.accessCode);
    loadMyReports(res.data.patientId); 
  }, "Logged in successfully!");

  const registerPatient = () => apiCall(async () => {
    await axios.post('http://localhost:3000/register', { patientId, password });
    setPatientId(''); setPassword('');
  }, "Patient registered successfully!");

  const setCodeFirstTime = () => apiCall(async () => {
    await axios.post('http://localhost:3000/set-code', { patientId, accessCode });
  }, "Access code set successfully!");

  const addReport = () => apiCall(async () => {
    await axios.post('http://localhost:3000/add', { patientId, report });
    setReport('');
    loadPatients(); 
  }, "Medical report encrypted & uploaded!");

  const loadPatients = async () => {
    try {
      const res = await axios.get('http://localhost:3000/doctor-view');
      setRecords(res.data);
    } catch (err) {
      showToast("Failed to load patients", "error");
    }
  };

  const accessReport = () => apiCall(async () => {
    const res = await axios.post('http://localhost:3000/doctor-access', { hash, accessCode: code });
    showToast(`Decrypted Report: ${res.data.report}`, 'success');
    setCode(''); // Clear code after use for security
  });

  const deleteReport = () => apiCall(async () => {
    await axios.post('http://localhost:3000/delete', { hash, accessCode: code });
    setHash('');
    setCode('');
    loadPatients(); 
  }, "Report deleted successfully!");

  const loadMyReports = async (id = patientId) => {
    try {
      const res = await axios.get(`http://localhost:3000/patient/${id}`);
      setRecords(res.data);
    } catch (err) {
      showToast("Failed to load your reports", "error");
    }
  };

  // Auto-load patients when doctor logs in
  useEffect(() => {
    if (role === 'doctor' && loggedIn) {
      loadPatients();
    }
  }, [role, loggedIn]);

  // ===== RENDER HELPERS ===== //
  const Header = () => (
    <div className="navbar">
      <h2>🩺 SecureChain</h2>
      {role && (
        <div>
          <span style={{ marginRight: '15px' }}>
            Portal: <b>{role === 'doctor' ? 'Doctor' : 'Patient'}</b>
          </span>
          <button className="logout-btn" style={{ width: 'auto', padding: '8px 15px', marginTop: 0 }} onClick={handleLogout}>
            Exit
          </button>
        </div>
      )}
    </div>
  );

  const ToastComponent = () => (
    toast && (
      <div className="toast-container">
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      </div>
    )
  );

  // ===== SCREENS ===== //
  if (!role) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Select Your Portal</h2>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>Choose your role to securely access the blockchain-inspired network.</p>
          <button onClick={() => { setRole("doctor"); setLoggedIn(true); }}>
            👨‍⚕️ Doctor Access (No Login)
          </button>
          <button onClick={() => setRole("patient")} style={{ background: 'transparent', border: '2px solid #00c6ff' }}>
            🧑‍🦱 Patient Access
          </button>
        </div>
        <ToastComponent />
      </>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <Header />
        <div className="container">
          <h2 style={{ textAlign: 'center' }}>Patient Login</h2>
          <input placeholder="Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={login} disabled={loading || !password}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </div>
        <ToastComponent />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {role === "doctor" ? (
        <div className="dashboard-container">
          <h2 style={{ marginBottom: '5px' }}>Doctor Dashboard</h2>
          <p style={{ color: '#aaa', marginTop: 0 }}>Manage records, encrypt data, and assign patient access.</p>

          <div className="grid">
            <div className="card">
              <h3>1. Register Patient</h3>
              <input placeholder="New Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
              <input type="password" placeholder="Assign Password" value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={registerPatient} disabled={loading || !patientId || !password}>Register Patient</button>
            </div>

            <div className="card">
              <h3>2. Add Medical Report</h3>
              <input placeholder="Target Patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
              <textarea placeholder="Type diagnosis or medical report here..." value={report} onChange={e => setReport(e.target.value)} />
              <button onClick={addReport} disabled={loading || !patientId || !report}>Encrypt & Upload</button>
            </div>

            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>3. Global Patient Directory</h3>
                <button onClick={loadPatients} style={{ width: 'auto', padding: '5px 15px', marginTop: 0 }}>Refresh List</button>
              </div>
              {records.length === 0 ? <p style={{ color: '#888' }}>No records found. Click refresh.</p> : (
                <ul>
                  {records.map((r, i) => (
                    <li key={i}>
                      <span><b>ID:</b> {r.patientId}</span>
                      <span className={`badge ${r.hash ? "success" : "warning"}`}>
                        {r.hash ? "Report Active" : "No Report"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card" style={{ gridColumn: 'span 2' }}>
              <h3>4. Decrypt / Delete Record</h3>
              <div style={{ display: 'flex', gap: '15px' }}>
                
                <select value={hash} onChange={e => setHash(e.target.value)}>
                  <option value="" disabled>-- Select a Patient Record --</option>
                  {records.filter(r => r.hash).map((r, i) => (
                    <option key={i} value={r.hash}>Patient ID: {r.patientId}</option>
                  ))}
                </select>

                <input placeholder="Patient Access Code" value={code} type="password" onChange={e => setCode(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={accessReport} disabled={loading || !hash || !code}>Decrypt & View</button>
                <button className="logout-btn" onClick={deleteReport} disabled={loading || !hash || !code}>Delete Record</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2>Your Health Vault</h2>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <p style={{ margin: 0 }}><b>Security Status:</b> {accessCode ? '✅ Access Code Active' : '⚠️ Action Required'}</p>
          </div>

          {!accessCode && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>Set Your Security Pin</h3>
              <p style={{ fontSize: '0.9rem', color: '#aaa' }}>This code is required by your doctor to unlock your records.</p>
              <input type="password" placeholder="Create Access Code" onChange={e => setAccessCode(e.target.value)} />
              <button onClick={setCodeFirstTime} disabled={loading || !accessCode}>Lock in Code</button>
            </div>
          )}

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>My Decrypted Reports</h3>
              <button onClick={() => loadMyReports()} style={{ width: 'auto', padding: '5px 15px', marginTop: 0 }}>Refresh</button>
            </div>
            
            {records.length === 0 ? <p style={{ color: '#888' }}>No reports found.</p> : (
              <ul>
                {records.map((r, i) => (
                  <li key={i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: '#00c6ff', fontSize: '0.8rem', wordBreak: 'break-all' }}>Hash: {r.hash}</div>
                    <div>📝 {r.report}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      <ToastComponent />
    </>
  );
}

export default App;