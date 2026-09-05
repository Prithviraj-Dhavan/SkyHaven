import React from 'react';
import { Globe, Plane, Leaf, Clock, MapPin, Compass, ShieldCheck } from 'lucide-react';

export const TravelStatisticsGrid: React.FC = () => {
  const stats = [
    {
      label: 'Distance Flown',
      value: '18,450 km',
      sub: '0.46x Around Earth 🌍',
      icon: <Globe className="w-5 h-5 text-brand-500" />,
      bg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      label: 'Flight Legs Logged',
      value: '14 Flights',
      sub: '100% On-Time Record',
      icon: <Plane className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Aviation Hubs Explored',
      value: '8 International',
      sub: 'DEL, BOM, BLR, GOI, DXB, LHR...',
      icon: <MapPin className="w-5 h-5 text-cyan-500" />,
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Carbon Eco Offset',
      value: '100% Neutralized',
      sub: '3.4 Tonnes SAF Funded 🌿',
      icon: <Leaf className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase text-indigo-500">
              Personal Aviation Passport
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Travel Milestones & Lifetime Analytics
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {s.label}
              </span>
              <div className={`p-2 rounded-xl border ${s.bg}`}>{s.icon}</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {s.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
