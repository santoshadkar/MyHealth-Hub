import React from 'react';
import { HeartPulse, UserCheck, Stethoscope, LogOut, PhoneCall } from 'lucide-react';

export default function Header({ user, onSignOut, hitlCount }) {
  const isDoctor = user.role === 'doctor';
  const displaySpecialty = user.specialty || 'General Physician';

  return (
    <header className="glass-panel mx-4 mt-4 px-6 py-4 flex items-center justify-between z-50">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <HeartPulse className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-health-gradient">MyHealth Portal (India)</h1>
          <p className="text-xs text-slate-400 font-mono">Connected Care Engine • Patient & Doctor Platform</p>
        </div>
      </div>

      {/* Center Persona Badge */}
      <div className="flex items-center gap-3">
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono border flex items-center gap-2 ${
          isDoctor
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          {isDoctor ? <Stethoscope className="w-4 h-4 text-cyan-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
          <span>{isDoctor ? 'DOCTOR PORTAL ACTIVE' : 'PATIENT PORTAL ACTIVE'}</span>
        </div>

        {/* Indian Emergency Speed Dial Badge */}
        <a
          href="tel:112"
          className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500/20 transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Emergency 112 / 108</span>
        </a>
      </div>

      {/* User Info & Sign Out Button */}
      <div className="flex items-center gap-3">
        <div className="text-right text-xs">
          <div className="font-bold text-slate-200">{user.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {isDoctor ? displaySpecialty : `Patient ID: ${user.patient_id || 'P-1001'}`}
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="p-2 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
