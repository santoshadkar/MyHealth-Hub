import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://myhealth-hub-vyvc.onrender.com/api' : 'http://localhost:8000/api')).replace(/\/+$/, '');

export default function App() {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [hitlApprovals, setHitlApprovals] = useState([]);
  
  const [chatState, setChatState] = useState({ messages: [] });
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'patient') {
      const pid = user.patient_id || 'P-1001';
      fetchPatientData(pid);
      fetchDocuments(pid);
      fetchAppointments(pid);
    }
    fetchHitlPending();
  }, [user]);

  const fetchPatientData = async (patientId) => {
    try {
      const res = await fetch(`${API_BASE}/patient/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data);
      }
    } catch (err) {
      console.log("Error loading patient", err);
    }
  };

  const fetchDocuments = async (patientId) => {
    try {
      const pid = patientId || (user?.patient_id) || 'P-1001';
      const res = await fetch(`${API_BASE}/rag/documents?patient_id=${pid}`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.log("Error loading documents", err);
    }
  };

  const fetchAppointments = async (patientId) => {
    try {
      const pid = patientId || (user?.patient_id) || 'P-1001';
      const res = await fetch(`${API_BASE}/appointments?patient_id=${pid}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.log("Error loading appointments", err);
    }
  };

  const fetchHitlPending = async () => {
    try {
      const res = await fetch(`${API_BASE}/hitl/pending`);
      const data = await res.json();
      setHitlApprovals(data.pending_approvals || []);
    } catch (err) {
      console.log("Error loading HITL approvals", err);
    }
  };

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

  const handleSignIn = async ({ email, password }) => {
    try {
      const res = await fetchWithRetry(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        return { error: 'Server response error. Please try again in a moment.' };
      }
      if (!res.ok) {
        return { error: data.detail || 'Invalid email or password' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error("SignIn Exception:", err);
      return { error: `Connection error: ${err.message || 'Unable to connect to server'}` };
    }
  };

  const handleRegister = async (regData) => {
    try {
      const res = await fetchWithRetry(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        return { error: 'Server response error. Please try again in a moment.' };
      }
      if (!res.ok) {
        return { error: data.detail || 'Registration failed' };
      }
      setUser(data.user);
      if (data.patient) setPatient(data.patient);
      return { success: true };
    } catch (err) {
      console.error("Register Exception:", err);
      return { error: `Connection error: ${err.message || 'Unable to connect to server'}` };
    }
  };

  const handleDemoLogin = (roleType) => {
    if (roleType === 'patient') {
      setUser({
        email: "aarav@example.com",
        role: "patient",
        name: "Aarav Sharma",
        patient_id: "P-1001"
      });
    } else {
      setUser({
        email: "ananya@myhealth.com",
        role: "doctor",
        name: "Dr. Ananya Adkar",
        specialty: "General Physician",
        doctor_id: "doc-101"
      });
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setPatient(null);
  };

  const handleAddVitals = async (vitalsData) => {
    const pid = user?.patient_id || 'P-1001';
    try {
      await fetch(`${API_BASE}/patient/${pid}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsData)
      });
      fetchPatientData(pid);
    } catch (err) {
      console.error("Add vitals error", err);
    }
  };

  const handleAddDocument = async (docData) => {
    const pid = user?.patient_id || 'P-1001';
    try {
      await fetch(`${API_BASE}/rag/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: pid, ...docData })
      });
      fetchDocuments(pid);
    } catch (err) {
      console.error("Add document error", err);
    }
  };

  const handleSendMessage = async (messageText) => {
    setIsChatLoading(true);
    const userMsg = { id: Date.now().toString(), sender: "user", content: messageText };
    setChatState(prev => ({ messages: [...prev.messages, userMsg] }));

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: user?.patient_id || "P-1001",
          user_role: user?.role || "patient",
          message: messageText
        })
      });
      const data = await res.json();
      setChatState(prev => ({
        messages: [...prev.messages, ...(data.messages || [])]
      }));
      fetchHitlPending();
    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRequestRefill = (medName) => {
    handleSendMessage(`Please order medication refill for ${medName}`);
  };

  const handleProcessApproval = async (approvalId, action) => {
    try {
      await fetch(`${API_BASE}/hitl/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_id: approvalId, action })
      });
      fetchHitlPending();
      if (user?.patient_id) fetchPatientData(user.patient_id);
    } catch (err) {
      console.error("Process approval error", err);
    }
  };

  const handleTriggerLabWebhook = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/webhooks/lab-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (user?.patient_id) fetchDocuments(user.patient_id);
      return data;
    } catch (err) {
      console.error("Webhook error", err);
      return { status: "error" };
    }
  };

  if (!user) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        onRegister={handleRegister}
        onDemoLogin={handleDemoLogin}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col space-y-4 pb-10">
      <Header
        user={user}
        onSignOut={handleSignOut}
        hitlCount={hitlApprovals.length}
      />

      <main className="flex-1 px-4 max-w-7xl w-full mx-auto">
        {user.role === 'patient' ? (
          patient ? (
            <PatientDashboard
              patient={patient}
              documents={documents}
              appointments={appointments}
              onAddVitals={handleAddVitals}
              onAddDocument={handleAddDocument}
              onSendMessage={handleSendMessage}
              chatState={chatState}
              isChatLoading={isChatLoading}
              onRequestRefill={handleRequestRefill}
            />
          ) : (
            <div className="text-center p-12 glass-panel">Loading your patient record...</div>
          )
        ) : (
          <DoctorDashboard
            doctorUser={user}
            hitlApprovals={hitlApprovals}
            onProcessApproval={handleProcessApproval}
            appointments={appointments}
            onTriggerLabWebhook={handleTriggerLabWebhook}
          />
        )}
      </main>
    </div>
  );
}
