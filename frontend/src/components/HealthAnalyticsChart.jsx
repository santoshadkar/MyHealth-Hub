import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Heart, Droplets, Watch, ShieldAlert, Award } from 'lucide-react';

export default function HealthAnalyticsChart({ analyticsData }) {
  const [activeTab, setActiveTab] = useState('sugar'); // 'sugar', 'bp', 'steps', 'hr'

  const data = analyticsData || {
    health_trend_summary: {
      status: 'Improving',
      health_score: 88,
      delta_percentage: 7.5,
      summary_text: 'Blood sugar levels stabilized; daily physical activity increased by 15% over the past 14 days.'
    },
    sugar_trend: [
      { day: 'Day -6', fasting: 155, pp: 210 },
      { day: 'Day -5', fasting: 150, pp: 205 },
      { day: 'Day -4', fasting: 148, pp: 200 },
      { day: 'Day -3', fasting: 145, pp: 195 },
      { day: 'Day -2', fasting: 144, pp: 192 },
      { day: 'Day -1', fasting: 140, pp: 188 },
      { day: 'Today', fasting: 142, pp: 198 }
    ],
    fitbit_step_trend: [
      { day: 'Mon', steps: 6200, goal: 10000 },
      { day: 'Tue', steps: 7100, goal: 10000 },
      { day: 'Wed', steps: 8500, goal: 10000 },
      { day: 'Thu', steps: 9200, goal: 10000 },
      { day: 'Fri', steps: 7800, goal: 10000 },
      { day: 'Sat', steps: 9400, goal: 10000 },
      { day: 'Sun', steps: 8420, goal: 10000 }
    ],
    bp_trend: [
      { day: 'Day -6', systolic: 138, diastolic: 88, spo2: 96 },
      { day: 'Day -5', systolic: 135, diastolic: 86, spo2: 97 },
      { day: 'Day -4', systolic: 134, diastolic: 85, spo2: 97 },
      { day: 'Day -3', systolic: 132, diastolic: 84, spo2: 98 },
      { day: 'Day -2', systolic: 131, diastolic: 83, spo2: 98 },
      { day: 'Day -1', systolic: 130, diastolic: 82, spo2: 98 },
      { day: 'Today', systolic: 130, diastolic: 85, spo2: 98 }
    ]
  };

  const summary = data.health_trend_summary || { status: 'Improving', health_score: 88, delta_percentage: 7.5 };
  const isImproving = summary.status === 'Improving';
  const isDeteriorating = summary.status === 'Deteriorating';

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl bg-slate-900/90 relative">
      {/* Top Health Progress & Deterioration Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg ${
            isDeteriorating
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {summary.health_score}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-100">Overall Health Score</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border flex items-center gap-1 ${
                isDeteriorating
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {isDeteriorating ? (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {summary.status}: {isImproving ? '+' : ''}{summary.delta_percentage}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{summary.summary_text}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>AI Health Index: <strong className="text-white">{summary.health_score}/100</strong></span>
          </div>
        </div>
      </div>

      {/* Graphical Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" /> Statistical Telemetry & Trend Analytics
        </h2>

        <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('sugar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sugar'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Blood Sugar
          </button>
          <button
            onClick={() => setActiveTab('bp')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bp'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> BP & SpO2
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'steps'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Watch className="w-3.5 h-3.5" /> Fitbit Steps
          </button>
        </div>
      </div>

      {/* SVG Chart Rendering */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 space-y-4">
        {activeTab === 'sugar' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Fasting Sugar (mg/dL)
                </span>
                <span className="flex items-center gap-1.5 text-teal-300 font-mono font-bold">
                  <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" /> Post-Prandial (PP)
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Safe Range: 70 - 140 mg/dL</span>
            </div>

            {/* Custom SVG Line Graph */}
            <div className="h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                {/* Target Safe Threshold Band */}
                <rect x="50" y="80" width="620" height="70" fill="rgba(16, 185, 129, 0.08)" rx="4" />
                <line x1="50" y1="80" x2="670" y2="80" stroke="rgba(16, 185, 129, 0.3)" strokeDasharray="4 4" />
                <text x="675" y="84" fill="#10b981" fontSize="10" fontFamily="monospace">140 mg/dL Target</text>

                {/* Grid Lines */}
                {[40, 90, 140, 190].map((val, idx) => (
                  <line key={idx} x1="50" y1={200 - val * 0.8} x2="670" y2={200 - val * 0.8} stroke="rgba(255,255,255,0.05)" />
                ))}

                {/* Fasting Sugar Line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  points={data.sugar_trend.map((d, i) => `${60 + i * 95},${200 - d.fasting * 0.9}`).join(' ')}
                />

                {/* PP Sugar Line */}
                <polyline
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  points={data.sugar_trend.map((d, i) => `${60 + i * 95},${200 - d.pp * 0.7}`).join(' ')}
                />

                {/* Data Points */}
                {data.sugar_trend.map((d, i) => (
                  <g key={i}>
                    {/* Fasting Point */}
                    <circle cx={60 + i * 95} cy={200 - d.fasting * 0.9} r="5" fill="#10b981" />
                    <text x={60 + i * 95} y={200 - d.fasting * 0.9 - 10} fill="#10b981" fontSize="10" textAnchor="middle" fontWeight="bold">
                      {d.fasting}
                    </text>

                    {/* PP Point */}
                    <circle cx={60 + i * 95} cy={200 - d.pp * 0.7} r="4" fill="#2dd4bf" />
                    <text x={60 + i * 95} y={200 - d.pp * 0.7 - 10} fill="#2dd4bf" fontSize="10" textAnchor="middle">
                      {d.pp}
                    </text>

                    {/* Day Axis Label */}
                    <text x={60 + i * 95} y="195" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      {d.day}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {activeTab === 'bp' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" /> Systolic BP (mmHg)
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Diastolic BP
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> SpO2 (%)
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Normal BP: 120/80 mmHg</span>
            </div>

            <div className="h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                {/* Systolic Line */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  points={data.bp_trend.map((d, i) => `${60 + i * 95},${220 - d.systolic * 1.1}`).join(' ')}
                />

                {/* Diastolic Line */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  points={data.bp_trend.map((d, i) => `${60 + i * 95},${220 - d.diastolic * 1.3}`).join(' ')}
                />

                {/* Data Points */}
                {data.bp_trend.map((d, i) => (
                  <g key={i}>
                    <circle cx={60 + i * 95} cy={220 - d.systolic * 1.1} r="5" fill="#06b6d4" />
                    <text x={60 + i * 95} y={220 - d.systolic * 1.1 - 10} fill="#06b6d4" fontSize="10" textAnchor="middle" fontWeight="bold">
                      {d.systolic}
                    </text>

                    <circle cx={60 + i * 95} cy={220 - d.diastolic * 1.3} r="4" fill="#6366f1" />
                    <text x={60 + i * 95} y={220 - d.diastolic * 1.3 - 10} fill="#6366f1" fontSize="10" textAnchor="middle">
                      {d.diastolic}
                    </text>

                    <text x={60 + i * 95} y="195" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                      {d.day}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-400 font-mono font-bold flex items-center gap-1.5">
                <Watch className="w-4 h-4 text-amber-400" /> Fitbit Weekly Step Goal (10,000 steps/day)
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">Average: 8,000+ steps/day</span>
            </div>

            <div className="h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                {/* 10k Goal Line */}
                <line x1="50" y1="40" x2="670" y2="40" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth="1.5" />
                <text x="675" y="44" fill="#f59e0b" fontSize="10" fontFamily="monospace">10k Goal</text>

                {/* Bars */}
                {data.fitbit_step_trend.map((d, i) => {
                  const barHeight = (d.steps / 10000) * 130;
                  const isGoalMet = d.steps >= d.goal;
                  return (
                    <g key={i}>
                      <rect
                        x={45 + i * 95}
                        y={180 - barHeight}
                        width="30"
                        height={barHeight}
                        rx="6"
                        fill={isGoalMet ? '#10b981' : '#f59e0b'}
                        opacity="0.85"
                      />
                      <text x={60 + i * 95} y={170 - barHeight} fill="#f1f5f9" fontSize="10" textAnchor="middle" fontFont="monospace" fontWeight="bold">
                        {d.steps}
                      </text>
                      <text x={60 + i * 95} y="195" fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                        {d.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
