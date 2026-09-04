import React, { useState, useEffect } from 'react';
import { Activity, Heart, Droplets, Calendar, Pill, Plus, Upload, Send, Bot, User, Sparkles, PhoneCall, MapPin, Stethoscope, Building2, ExternalLink } from 'lucide-react';
import FitbitWidget from './FitbitWidget';
import HealthAnalyticsChart from './HealthAnalyticsChart';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function PatientDashboard({ patient, documents, appointments, onAddVitals, onAddDocument, onSendMessage, chatState, isChatLoading, onRequestRefill }) {
  const [fastingSugar, setFastingSugar] = useState(142);
  const [ppSugar, setPpSugar] = useState(198);
  const [systolicBp, setSystolicBp] = useState(130);
  const [diastolicBp, setDiastolicBp] = useState(85);
  const [spo2, setSpo2] = useState(98);
  const [pulseRate, setPulseRate] = useState(78);
  const [showVitalsForm, setShowVitalsForm] = useState(false);

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);

  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [fitbitData, setFitbitData] = useState(patient.fitbit_telemetry || null);

  useEffect(() => {
    fetch(`${API_BASE}/nearby-facilities`)
      .then(res => res.json())
      .then(data => setNearbyFacilities(data.facilities || []))
      .catch(err => console.log(err));

    fetch(`${API_BASE}/doctor-profile`)
      .then(res => res.json())
      .then(data => setDoctorProfile(data.doctor))
      .catch(err => console.log(err));

    fetch(`${API_BASE}/patient/${patient.id || 'P-1001'}/analytics`)
      .then(res => res.json())
      .then(data => {
        setAnalyticsData(data);
        if (data.fitbit_telemetry) setFitbitData(data.fitbit_telemetry);
      })
      .catch(err => console.log(err));
  }, [patient.id]);

  const handleFitbitSync = async () => {
    try {
      const res = await fetch(`${API_BASE}/fitbit/sync/${patient.id || 'P-1001'}`, { method: 'POST' });
      const json = await res.json();
      if (json.fitbit_telemetry) {
        setFitbitData(json.fitbit_telemetry);
        // Refresh analytics
        const aRes = await fetch(`${API_BASE}/patient/${patient.id || 'P-1001'}/analytics`);
        const aJson = await aRes.json();
        setAnalyticsData(aJson);
      }
    } catch (e) {
      console.log(e);
    }
  };


  const latestVitals = patient.vitals_history?.[0] || {
    fasting_sugar: 142, pp_sugar: 198, systolic_bp: 130, diastolic_bp: 85, spo2: 98, pulse_rate: 78
  };

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    onAddVitals({
      fasting_sugar: parseFloat(fastingSugar),
      pp_sugar: parseFloat(ppSugar),
      systolic_bp: parseInt(systolicBp),
      diastolic_bp: parseInt(diastolicBp),
      spo2: parseInt(spo2),
      pulse_rate: parseInt(pulseRate)
    });
    setShowVitalsForm(false);
  };

  const handleDocSubmit = (e) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    onAddDocument({ title: docTitle, content: docContent, category: "Blood Report" });
    setDocTitle('');
    setDocContent('');
    setShowDocModal(false);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Patient Profile & AI Check-up Recommendation Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-emerald font-mono">Patient Profile</span>
              <span className="text-xs font-mono text-slate-400">ID: {patient.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">{patient.name}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Age {patient.age} • {patient.gender} • Address: {patient.address}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {patient.medical_history?.map((h, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
                  🩺 {h}
                </span>
              ))}
              {patient.allergies?.map((a, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium">
                  ⚠️ {a}
                </span>
              ))}
            </div>
          </div>

          {/* AI Recommended Next Check-up Card */}
          <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 max-w-md w-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider font-mono">
                <Calendar className="w-4 h-4 text-amber-400" /> AI Suggested Next Check-ups
              </div>
              <span className="badge badge-amber text-[10px]">Auto-Calculated</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" /> Fasting Blood Sugar
                </span>
                <span className="text-amber-300 font-bold font-mono">In 7 Days (Elevated: 142 mg/dL)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Oxygen (SpO2) Level
                </span>
                <span className="text-emerald-300 font-bold font-mono">In 30 Days (Normal: 98%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact & Attending Doctor Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergency Contact Card */}
        <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-rose-400 tracking-wider">In Case of Emergency (ICE)</div>
              <div className="font-bold text-sm text-slate-100">{patient.emergency_contact?.name || 'Mary Doe'} ({patient.emergency_contact?.relationship || 'Spouse'})</div>
              <div className="text-xs text-slate-400 font-mono">{patient.emergency_contact?.phone || '+1 (555) 999-8877'}</div>
            </div>
          </div>
          <a
            href={`tel:${patient.emergency_contact?.phone || '+15559998877'}`}
            className="px-4 py-2 rounded-xl bg-rose-500 text-slate-950 font-bold text-xs hover:bg-rose-400 transition-all flex items-center gap-1"
          >
            Call ICE
          </a>
        </div>

        {/* Primary Attending Doctor Card */}
        {doctorProfile && (
          <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">Primary Attending Physician</div>
                <div className="font-bold text-sm text-slate-100">{doctorProfile.name}</div>
                <div className="text-xs text-slate-400">{doctorProfile.specialty} • {doctorProfile.phone}</div>
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-400">
              <div>{doctorProfile.clinic_name}</div>
              <div className="text-emerald-400 font-semibold">{doctorProfile.operating_hours}</div>
            </div>
          </div>
        )}
      </div>

      {/* Vitals Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Fasting Blood Sugar</span>
            <Droplets className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{latestVitals.fasting_sugar} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
          <div className="text-[11px] text-amber-400 font-medium">⚠️ Slightly Elevated (Ref: 70-100)</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Post-Prandial Sugar</span>
            <Droplets className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{latestVitals.pp_sugar} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
          <div className="text-[11px] text-amber-400 font-medium">⚠️ High (Ref: &lt; 140)</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Oxygen Saturation (SpO2)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{latestVitals.spo2}%</div>
          <div className="text-[11px] text-emerald-400 font-medium">✅ Optimal Range (95-100%)</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Pulse Rate & BP</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300">{latestVitals.pulse_rate} <span className="text-xs font-normal text-slate-400">bpm</span></div>
          <div className="text-[11px] text-slate-400 font-mono">BP: {latestVitals.systolic_bp}/{latestVitals.diastolic_bp} mmHg</div>
        </div>
      </div>

      {/* Fitbit Wearable Telemetry Integration */}
      <FitbitWidget telemetry={fitbitData} onSync={handleFitbitSync} isDoctor={false} />

      {/* Health Graphical Analytics & Trend Visualization */}
      <HealthAnalyticsChart analyticsData={analyticsData} />

      {/* Main Content Grid: Medications, RAG Vault, Nearby Pharmacies & AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Medications & Refill Manager */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-400" /> Active Medications & Refill Orders
              </h3>
              <button
                onClick={() => setShowVitalsForm(!showVitalsForm)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Record New Vitals
              </button>
            </div>

            {/* Vitals Form */}
            {showVitalsForm && (
              <form onSubmit={handleVitalsSubmit} className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Fasting Sugar (mg/dL)</label>
                  <input type="number" value={fastingSugar} onChange={(e) => setFastingSugar(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Post-Prandial Sugar (mg/dL)</label>
                  <input type="number" value={ppSugar} onChange={(e) => setPpSugar(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Oxygen SpO2 (%)</label>
                  <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pulse Rate (bpm)</label>
                  <input type="number" value={pulseRate} onChange={(e) => setPulseRate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Systolic BP (mmHg)</label>
                  <input type="number" value={systolicBp} onChange={(e) => setSystolicBp(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100" required />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Diastolic BP (mmHg)</label>
                  <input type="number" value={diastolicBp} onChange={(e) => setDiastolicBp(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-slate-100" required />
                </div>
                <div className="col-span-2 md:col-span-3 flex justify-end pt-1">
                  <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all">Save Readings</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.medications?.map((m) => (
                <div key={m.id} className="glass-card p-4 rounded-xl border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-slate-100">{m.name}</h4>
                      {m.pills_remaining <= 7 ? (
                        <span className="badge badge-amber">Refill Needed</span>
                      ) : (
                        <span className="badge badge-emerald">Active Supply</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{m.frequency} • {m.dosage}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Prescribed by {m.prescribed_by}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">
                      Supply: <strong className={m.pills_remaining <= 7 ? "text-amber-400" : "text-emerald-400"}>{m.pills_remaining}</strong> / {m.total_pills} pills left
                    </span>
                    <button
                      onClick={() => onRequestRefill(m.name)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-md hover:opacity-90 transition-all"
                    >
                      Request Refill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Pharmacies & Diagnostic Labs */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" /> Nearby Pharmacies & Diagnostic Labs
              </h3>
              <span className="badge badge-cyan text-[10px]">Location Services Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nearbyFacilities.map((fac) => (
                <div key={fac.id} className="glass-card p-4 rounded-xl border border-white/10 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="badge badge-emerald text-[9px]">{fac.type}</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">★ {fac.rating}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-200">{fac.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {fac.address}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-semibold">{fac.distance} • {fac.open_status}</span>
                    <a href={`tel:${fac.phone}`} className="text-cyan-300 font-bold hover:underline flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RAG Medical Document Vault */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" /> RAG Medical Document & Report Vault
                </h3>
                <p className="text-xs text-slate-400 font-mono">Upload blood reports, lab tests, and discharge summaries for vector AI search</p>
              </div>
              <button
                onClick={() => setShowDocModal(true)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition-all flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Upload Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((d) => (
                <div key={d.id} className="glass-card p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-cyan text-[10px]">{d.category}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{d.timestamp}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-200">{d.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{d.content}</p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">Source: {d.source}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Health Assistant Chat */}
        <div className="glass-panel p-6 flex flex-col justify-between h-[680px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">MyHealth AI Assistant</h3>
                <p className="text-[10px] text-slate-400 font-mono">Grounded in your medical records & vitals</p>
              </div>
            </div>
            <span className="badge badge-emerald text-[10px]">Online</span>
          </div>

          <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2">
            {chatState.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                <p className="text-xs text-slate-400">
                  Ask me about your blood reports, sugar trends, active medications, or next check-up schedule.
                </p>
              </div>
            ) : (
              chatState.messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender !== 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 text-emerald-400 text-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`max-w-xs p-3 rounded-xl text-xs space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'glass-card border-white/10 text-slate-200'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="pt-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about blood reports, sugar, or meds..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 max-w-md w-full rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" /> Upload Blood Report / Lab Document
            </h3>
            <form onSubmit={handleDocSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document / Report Title</label>
                <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g. Fasting Sugar & HbA1c Report Aug 2026" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100" required />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Report Details & Lab Values</label>
                <textarea value={docContent} onChange={(e) => setDocContent(e.target.value)} rows={4} placeholder="Paste blood report details (Fasting sugar: 142 mg/dL, HbA1c: 7.2%)..." className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-slate-100" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold">Index Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
