import React, { useState } from 'react';
import { Watch, Heart, Activity, Moon, RefreshCw, Flame, Battery, ShieldCheck } from 'lucide-react';

export default function FitbitWidget({ telemetry, onSync, isDoctor = false }) {
  const [syncing, setSyncing] = useState(false);

  const data = telemetry || {
    steps_today: 8420,
    step_goal: 10000,
    current_heart_rate: 72,
    resting_heart_rate: 68,
    active_minutes: 42,
    calories_burned: 1850,
    sleep_hours: 7.2,
    sync_status: 'Connected (Synced 2 mins ago)',
    battery_level: 88,
    device_name: 'Fitbit Sense 2'
  };

  const handleSyncClick = async () => {
    if (syncing || !onSync) return;
    setSyncing(true);
    await onSync();
    setTimeout(() => setSyncing(false), 800);
  };

  const stepPct = Math.min(100, Math.round((data.steps_today / data.step_goal) * 100));

  return (
    <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-cyan-950/30">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-md">
            <Watch className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-100">{data.device_name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Live Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{data.sync_status}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>{data.battery_level}%</span>
          </div>

          {!isDoctor && (
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className={`p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all ${
                syncing ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync Fitbit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Step Progress Ring Box */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 space-y-1.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-mono text-[11px]">Daily Steps</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-100">{data.steps_today.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 font-mono">Goal: {data.step_goal.toLocaleString()} ({stepPct}%)</div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${stepPct}%` }}
            />
          </div>
        </div>

        {/* Continuous Heart Rate Box */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 space-y-1.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-mono text-[11px]">Heart Rate</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-rose-300">{data.current_heart_rate}</span>
              <span className="text-[10px] text-slate-400 font-mono">BPM</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Resting HR: {data.resting_heart_rate} BPM</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Normal Rhythm
          </div>
        </div>

        {/* Active Exercise Minutes & Calories */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 space-y-1.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-mono text-[11px]">Active Zone</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-300">{data.active_minutes} <span className="text-xs font-normal">mins</span></div>
            <div className="text-[10px] text-slate-400 font-mono">{data.calories_burned} kcal burned</div>
          </div>
          <div className="text-[10px] text-amber-400 font-mono">Cardio & Walking</div>
        </div>

        {/* Sleep Telemetry */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5 space-y-1.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-mono text-[11px]">Sleep Quality</span>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <div className="text-lg font-black text-indigo-300">{data.sleep_hours} <span className="text-xs font-normal">hrs</span></div>
            <div className="text-[10px] text-slate-400 font-mono">82% Restful Sleep</div>
          </div>
          <div className="text-[10px] text-indigo-400 font-mono">REM & Deep Cycle</div>
        </div>
      </div>
    </div>
  );
}
