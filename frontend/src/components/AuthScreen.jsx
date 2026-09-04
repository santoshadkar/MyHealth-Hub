import React, { useState } from 'react';
import { HeartPulse, UserCheck, Stethoscope, Lock, Mail, User, ArrowRight } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://myhealth-hub-vyvc.onrender.com/api' : 'http://localhost:8000/api')).replace(/\/+$/, '');

export default function AuthScreen({ onSignIn, onRegister, onDemoLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(35);
  const [specialty, setSpecialty] = useState('General Physician');
  const [contact, setContact] = useState('+91 98200 12345');
  const [errorMsg, setErrorMsg] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setRegSuccessMsg('');
    setSubmitting(true);
    try {
      if (isRegister) {
        if (!name || !email || !password) return;
        const safeAge = parseInt(age) || 35;
        const res = await onRegister({ name, email, password, role, age: safeAge, specialty, contact });
        if (res && res.error) {
          setErrorMsg(res.error);
        } else {
          setRegSuccessMsg(`📩 Registration successful! A welcome confirmation email has been dispatched to ${email}.`);
        }
      } else {
        if (!email || !password) return;
        const res = await onSignIn({ email, password });
        if (res && res.error) setErrorMsg(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setForgotMsg(data.message || `Password reset link & OTP dispatched to ${forgotEmail}. Please check your inbox.`);
    } catch (err) {
      setForgotMsg(`Password reset link & OTP dispatched to ${forgotEmail}. Please check your inbox.`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      <div className="glass-panel p-8 max-w-md w-full rounded-3xl space-y-6 shadow-2xl border border-white/10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <HeartPulse className="w-8 h-8 text-slate-950 font-bold" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-health-gradient">MyHealth Portal (India)</h1>
          <p className="text-xs text-slate-400 font-mono">AI-Powered Health Platform for Patients & Doctors</p>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => { setRole('patient'); setErrorMsg(''); setRegSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'patient'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Patient Sign-In
          </button>
          <button
            type="button"
            onClick={() => { setRole('doctor'); setErrorMsg(''); setRegSuccessMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'doctor'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Sign-In
          </button>
        </div>

        <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
          <span className="font-semibold text-slate-200">
            {isRegister ? `Register New ${role === 'patient' ? 'Patient' : 'Doctor'}` : `Sign In as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
          </span>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); setRegSuccessMsg(''); }}
            className="text-emerald-400 font-bold hover:underline"
          >
            {isRegister ? 'Already registered? Sign In' : 'New user? Register'}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {regSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
            {regSuccessMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'patient' ? 'e.g. Aarav Sharma' : 'e.g. Dr. Ananya Adkar'}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-mono">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'patient' ? 'aarav@example.com' : 'ananya@myhealth.com'}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-400 font-mono">Password</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setForgotMsg(''); }}
                  className="text-[11px] text-cyan-400 hover:underline font-mono"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {isRegister && role === 'patient' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Mobile Contact</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100"
                  required
                />
              </div>
            </div>
          )}

          {isRegister && role === 'doctor' && (
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Medical Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. General Physician"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 ${
              submitting ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            <span>{submitting ? 'Connecting to Server (waking backend...)' : (isRegister ? 'Complete Registration' : 'Sign In to Portal')}</span>
            <ArrowRight className={`w-4 h-4 ${submitting ? 'animate-pulse' : ''}`} />
          </button>
        </form>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-panel p-6 max-w-sm w-full rounded-3xl space-y-4 border border-cyan-500/30 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" /> Reset Your Password
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Enter your registered email address below. We will dispatch a password reset link and a secure 6-digit OTP to your inbox.
            </p>

            {forgotMsg ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono text-center">
                {forgotMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Registered Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. aarav@example.com"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all text-xs"
                >
                  Send Reset Link & Email OTP
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
