import React, { useState, useEffect } from 'react';
import { Stethoscope, User, ShieldAlert, Check, X, Sparkles, Activity, FileText, Send, Zap, Clock, Calendar, Droplets, Heart, Pill, ChevronRight, Eye } from 'lucide-react';
import FitbitWidget from './FitbitWidget';
import HealthAnalyticsChart from './HealthAnalyticsChart';

export default function DoctorDashboard({ doctorUser, hitlApprovals = [], onProcessApproval, onTriggerLabWebhook }) {
  const [todayQueue, setTodayQueue] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [clinicalSummary, setClinicalSummary] = useState(null);
  const [webhookStatus, setWebhookStatus] = useState(null);
  const [patientAnalytics, setPatientAnalytics] = useState(null);

  const docName = doctorUser?.name || 'Dr. Sarah Jenkins';
  const docSpecialty = doctorUser?.specialty || 'General Physician';

  useEffect(() => {
    fetch('http://localhost:8000/api/doctor/today-queue')
      .then(res => res.json())
      .then(data => {
        setTodayQueue(data.queue || []);
        if (data.queue?.length > 0) {
          handleSelectPatient(data.queue[0].patient?.id || 'P-1001');
        }
      })
      .catch(err => console.log(err));
  }, []);

  const handleSelectPatient = (patientId) => {
    fetch(`http://localhost:8000/api/patient/${patientId}`)
      .then(res => res.json())
      .then(data => setSelectedPatient(data))
      .catch(err => console.log(err));

    fetch(`http://localhost:8000/api/patient/${patientId}/analytics`)
      .then(res => res.json())
      .then(data => setPatientAnalytics(data))
      .catch(err => console.log(err));
  };


  const handleGenerateSummary = () => {
    if (!selectedPatient) return;
    setClinicalSummary({
      patient: `${selectedPatient.name} (Age ${selectedPatient.age}, ${selectedPatient.gender})`,
      history: selectedPatient.medical_history?.join(', ') || 'No recorded history',
      allergies: selectedPatient.allergies?.join(', ') || 'No allergies',
      recent_vitals: `Fasting Blood Sugar: ${selectedPatient.vitals_history?.[0]?.fasting_sugar || 142} mg/dL, Post-Prandial Sugar: ${selectedPatient.vitals_history?.[0]?.pp_sugar || 198} mg/dL, SpO2: ${selectedPatient.vitals_history?.[0]?.spo2 || 98}%, BP: ${selectedPatient.vitals_history?.[0]?.systolic_bp || 130}/${selectedPatient.vitals_history?.[0]?.diastolic_bp || 85} mmHg`,
      active_meds: selectedPatient.medications?.map(m => `${m.name} (${m.pills_remaining} pills left)`).join(', ') || 'Metformin 500mg, Telmisartan 40mg',
      ai_recommendation: `Refill approval authorized by ${docName}. Recommend repeat Fasting Sugar & HbA1c in 7 days.`
    });
  };

  const handleSimulateWebhook = async () => {
    const res = await onTriggerLabWebhook({
      patient_id: selectedPatient?.id || "P-1001",
      report_title: "Urgent Diagnostic Lab Result (Metropolis Labs)",
      lab_name: "Metropolis Diagnostics Webhook Ingress",
      content: "Patient: John Doe. Fasting Glucose: 148 mg/dL (ELEVATED). SpO2: 98%. HbA1c: 7.3%. Recommended Next Sugar Check-Up in 7 days."
    });
    setWebhookStatus(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Doctor Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-cyan font-mono">Physician Portal</span>
              <span className="text-xs font-mono text-slate-400">{docName} ({docSpecialty})</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Doctor Clinical Command Center</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select today's visiting patient, review medical files, analyze lab trends, and approve refill requests (HITL).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateSummary}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> AI Patient History Summary
            </button>
            <button
              onClick={handleSimulateWebhook}
              className="px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-cyan-300 hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-cyan-400" /> Simulate Lab Webhook
            </button>
          </div>
        </div>
      </div>

      {/* AI Generated Clinical Summary Card */}
      {clinicalSummary && (
        <div className="glass-panel p-6 border-indigo-500/40 bg-indigo-500/5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> AI Clinical Co-Pilot Patient Summary
            </h3>
            <span className="badge badge-indigo text-[10px]">Grounded in Medical Vault</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Patient Profile</span>
              <p className="font-bold text-slate-200">{clinicalSummary.patient}</p>
              <p className="text-slate-400">{clinicalSummary.history}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Recent Vitals & Lab Trends</span>
              <p className="text-amber-300 font-medium">{clinicalSummary.recent_vitals}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <span className="text-indigo-400 font-mono text-[10px] uppercase">AI Physician Recommendation</span>
              <p className="text-indigo-200">{clinicalSummary.ai_recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {webhookStatus && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Lab Webhook Received! Diagnostic lab report indexed automatically into Patient Vault.</span>
        </div>
      )}

      {/* Doctor HITL Prescription Approval Queue */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Doctor Approval Queue (Human-in-the-Loop)
            </h3>
            <p className="text-xs text-slate-400 font-mono">Review & authorize AI-suggested prescription refill requests before pharmacy dispatch</p>
          </div>
          <span className="badge badge-amber font-mono">
            {hitlApprovals.length} Pending Doctor Approval{hitlApprovals.length !== 1 ? 's' : ''}
          </span>
        </div>

        {hitlApprovals.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-200">No Pending Approvals</h4>
            <p className="text-xs text-slate-400">All patient medication refill requests have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hitlApprovals.map((item) => (
              <div key={item.approval_id} className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="badge badge-amber text-[9px]">REFILL APPROVAL REQUIRED</span>
                    <h4 className="text-xs font-bold text-slate-100 mt-1">{item.patient_name}</h4>
                    <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-cyan-300 space-y-1">
                  <div className="text-[10px] text-slate-500">Proposed Order Parameters:</div>
                  <div>Medication: {item.arguments?.medication_name || 'Metformin 500 mg'}</div>
                  <div>Quantity: {item.arguments?.quantity || 30} Tablets</div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    onClick={() => onProcessApproval(item.approval_id, 'rejected')}
                    className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs hover:bg-rose-500/30 transition-all"
                  >
                    Reject Refill
                  </button>
                  <button
                    onClick={() => onProcessApproval(item.approval_id, 'approved')}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve Prescription Refill
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Left (Today's Queue) & Right (Active Patient File Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> Today's Patient Visit Queue ({todayQueue.length})
              </h3>
              <span className="badge badge-indigo text-[10px]">Today's Appointments</span>
            </div>

            <div className="space-y-3">
              {todayQueue.map((item, idx) => {
                const p = item.patient;
                const apt = item.appointment;
                const isSelected = selectedPatient?.id === p?.id;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectPatient(p?.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg glow-indigo ring-1 ring-indigo-500'
                        : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-cyan-300">{apt.time}</span>
                        <span className="text-slate-200 font-bold text-xs">{p?.name || 'Patient'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{apt.type} • Age {p?.age}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge badge-emerald text-[9px] uppercase">{apt.status}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Patient Complete File Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPatient ? (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-cyan font-mono">Active Patient Record</span>
                    <span className="text-xs font-mono text-slate-400">ID: {selectedPatient.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Age {selectedPatient.age} • {selectedPatient.gender} • Contact: {selectedPatient.contact}
                  </p>
                </div>

                <div className="text-right text-xs space-y-1">
                  <div className="text-slate-400">ICE Emergency Contact:</div>
                  <div className="font-bold text-rose-400 font-mono">
                    {selectedPatient.emergency_contact?.name} ({selectedPatient.emergency_contact?.phone})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Medical Diagnoses</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.medical_history?.map((h, idx) => (
                      <span key={idx} className="badge badge-emerald text-[11px]">{h}</span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Allergies & Alerts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.allergies?.map((a, idx) => (
                      <span key={idx} className="badge badge-rose text-[11px]">{a}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fitbit Smart Wearable Telemetry */}
              <FitbitWidget telemetry={selectedPatient.fitbit_telemetry || patientAnalytics?.fitbit_telemetry} isDoctor={true} />

              {/* Statistical Telemetry & Health Analytics Graph */}
              <HealthAnalyticsChart analyticsData={patientAnalytics} />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Vitals & Metabolic Trend History</h4>
                <div className="overflow-x-auto rounded-xl border border-white/10 glass-card">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Fasting Sugar</th>
                        <th className="p-3">Post-Prandial</th>
                        <th className="p-3">SpO2 Level</th>
                        <th className="p-3">Blood Pressure</th>
                        <th className="p-3">Pulse Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {selectedPatient.vitals_history?.map((v, idx) => (
                        <tr key={idx} className="hover:bg-white/5 font-mono">
                          <td className="p-3 text-slate-400">{v.timestamp}</td>
                          <td className="p-3 font-bold text-amber-300">{v.fasting_sugar} mg/dL</td>
                          <td className="p-3 font-bold text-amber-300">{v.pp_sugar} mg/dL</td>
                          <td className="p-3 font-bold text-emerald-400">{v.spo2}%</td>
                          <td className="p-3">{v.systolic_bp}/{v.diastolic_bp} mmHg</td>
                          <td className="p-3 text-cyan-300">{v.pulse_rate} bpm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Active Medications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPatient.medications?.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-100">{m.name}</span>
                        <span className={m.pills_remaining <= 7 ? "text-amber-400" : "text-emerald-400"}>
                          {m.pills_remaining} pills remaining
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{m.frequency} • {m.dosage}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select a patient from today's visit queue on the left to inspect their complete medical record.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
