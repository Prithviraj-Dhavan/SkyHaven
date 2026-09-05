import React, { useState, useEffect } from 'react';
import { Plane, Radio, Compass, Navigation, Eye, Zap, ShieldCheck, Clock, Wind, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActiveFlightTrack {
  id: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  from: { code: string; name: string; x: number; y: number };
  to: { code: string; name: string; x: number; y: number };
  progress: number; // 0 to 100%
  altitudeFt: number;
  speedKmh: number;
  status: 'CLIMBING' | 'CRUISING' | 'DESCENDING' | 'BOARDING';
  headingDeg: number;
}

const LIVE_FLIGHTS: ActiveFlightTrack[] = [
  {
    id: 'f-1',
    flightNumber: 'SH-104',
    airline: 'SkyHaven Airways',
    aircraft: 'Boeing 787-9 Dreamliner',
    from: { code: 'BOM', name: 'Mumbai', x: 235, y: 195 },
    to: { code: 'GOI', name: 'Goa', x: 250, y: 240 },
    progress: 68,
    altitudeFt: 28000,
    speedKmh: 760,
    status: 'DESCENDING',
    headingDeg: 165,
  },
  {
    id: 'f-2',
    flightNumber: 'AM-108',
    airline: 'Vayu Jet',
    aircraft: 'Airbus A321neo',
    from: { code: 'BLR', name: 'Bengaluru', x: 270, y: 230 },
    to: { code: 'DEL', name: 'New Delhi', x: 240, y: 130 },
    progress: 42,
    altitudeFt: 36000,
    speedKmh: 840,
    status: 'CRUISING',
    headingDeg: 345,
  },
  {
    id: 'f-3',
    flightNumber: 'AM-210',
    airline: 'SkyLuxe International',
    aircraft: 'Airbus A350-900',
    from: { code: 'DEL', name: 'New Delhi', x: 240, y: 130 },
    to: { code: 'DXB', name: 'Dubai', x: 140, y: 155 },
    progress: 81,
    altitudeFt: 34000,
    speedKmh: 890,
    status: 'DESCENDING',
    headingDeg: 260,
  },
  {
    id: 'f-4',
    flightNumber: 'AM-402',
    airline: 'Apex Global',
    aircraft: 'Boeing 777-300ER',
    from: { code: 'BOM', name: 'Mumbai', x: 235, y: 195 },
    to: { code: 'LHR', name: 'London', x: 50, y: 80 },
    progress: 35,
    altitudeFt: 38000,
    speedKmh: 910,
    status: 'CRUISING',
    headingDeg: 310,
  },
  {
    id: 'f-5',
    flightNumber: 'AM-550',
    airline: 'StarWings',
    aircraft: 'Boeing 787-9',
    from: { code: 'SIN', name: 'Singapore', x: 380, y: 260 },
    to: { code: 'HND', name: 'Tokyo', x: 470, y: 120 },
    progress: 55,
    altitudeFt: 39000,
    speedKmh: 930,
    status: 'CRUISING',
    headingDeg: 45,
  },
];

const HUBS = [
  { code: 'DEL', name: 'New Delhi', x: 240, y: 130 },
  { code: 'BOM', name: 'Mumbai', x: 235, y: 195 },
  { code: 'BLR', name: 'Bengaluru', x: 270, y: 230 },
  { code: 'GOI', name: 'Goa', x: 250, y: 240 },
  { code: 'DXB', name: 'Dubai', x: 140, y: 155 },
  { code: 'LHR', name: 'London', x: 50, y: 80 },
  { code: 'SIN', name: 'Singapore', x: 380, y: 260 },
  { code: 'HND', name: 'Tokyo', x: 470, y: 120 },
  { code: 'JFK', name: 'New York', x: 10, y: 90 },
];

export const GlobalFlightRadar: React.FC = () => {
  const [selectedFlight, setSelectedFlight] = useState<ActiveFlightTrack>(LIVE_FLIGHTS[0]);
  const [flights, setFlights] = useState<ActiveFlightTrack[]>(LIVE_FLIGHTS);
  const [filterMode, setFilterMode] = useState<'ALL' | 'DOMESTIC' | 'INTERNATIONAL'>('ALL');
  const [radarSweep, setRadarSweep] = useState(0);

  // Smooth telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarSweep((prev) => (prev + 1) % 360);
      setFlights((prev) =>
        prev.map((f) => {
          const nextProg = f.progress >= 99 ? 5 : f.progress + 0.15;
          return {
            ...f,
            progress: Number(nextProg.toFixed(2)),
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const filteredFlights = flights.filter((f) => {
    if (filterMode === 'DOMESTIC') {
      return ['DEL', 'BOM', 'BLR', 'GOI'].includes(f.from.code) && ['DEL', 'BOM', 'BLR', 'GOI'].includes(f.to.code);
    }
    if (filterMode === 'INTERNATIONAL') {
      return ['DXB', 'LHR', 'SIN', 'HND', 'JFK'].includes(f.to.code) || ['DXB', 'LHR', 'SIN', 'HND', 'JFK'].includes(f.from.code);
    }
    return true;
  });

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white">
      {/* Background Radar Grid & HUD styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Live Global Flight Radar ADS-B
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              286 Active Aircraft
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
            Real-Time Aviation Telemetry & Route Radar
          </h2>
        </div>

        {/* Filter Switcher */}
        <div className="flex bg-slate-900/90 rounded-2xl p-1 border border-slate-800 text-xs font-semibold">
          {(['ALL', 'DOMESTIC', 'INTERNATIONAL'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                filterMode === mode
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'ALL' ? 'All Active' : mode === 'DOMESTIC' ? 'India Domestic' : 'International'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Radar Display Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
        {/* Interactive Map Visualizer (8 Cols) */}
        <div className="lg:col-span-8 relative aspect-[16/9] w-full rounded-2xl bg-[#070d1a] border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
          {/* Radar Circles */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-indigo-500/10 pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/15 pointer-events-none" />
          <div className="absolute w-[150px] h-[150px] rounded-full border border-brand-500/20 pointer-events-none" />

          {/* SVG Map Canvas */}
          <svg viewBox="0 0 520 300" className="w-full h-full">
            <defs>
              {/* Glowing gradients */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Hub Connections & Flight Arcs */}
            {filteredFlights.map((f) => {
              const isSelected = selectedFlight.id === f.id;
              // Compute intermediate point on quadratic curve
              const midX = (f.from.x + f.to.x) / 2;
              const midY = Math.min(f.from.y, f.to.y) - 35;
              const pathD = `M ${f.from.x} ${f.from.y} Q ${midX} ${midY} ${f.to.x} ${f.to.y}`;

              // Position along the path based on progress %
              const t = f.progress / 100;
              const planeX = (1 - t) * (1 - t) * f.from.x + 2 * (1 - t) * t * midX + t * t * f.to.x;
              const planeY = (1 - t) * (1 - t) * f.from.y + 2 * (1 - t) * t * midY + t * t * f.to.y;

              return (
                <g key={f.id} className="cursor-pointer" onClick={() => setSelectedFlight(f)}>
                  {/* Arc Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isSelected ? '#38bdf8' : '#334155'}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    strokeDasharray={isSelected ? 'none' : '4 4'}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* Active Airplane Marker */}
                  <g transform={`translate(${planeX}, ${planeY})`}>
                    <circle
                      r={isSelected ? 10 : 7}
                      fill={isSelected ? '#0284c7' : '#1e293b'}
                      stroke={isSelected ? '#38bdf8' : '#64748b'}
                      strokeWidth={1.5}
                      className="transition-all"
                    />
                    <Plane
                      x={-6}
                      y={-6}
                      width={12}
                      height={12}
                      className={`${isSelected ? 'text-white' : 'text-slate-300'}`}
                    />
                    {isSelected && (
                      <text
                        x={14}
                        y={4}
                        fill="#38bdf8"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {f.flightNumber} ({Math.round(f.progress)}%)
                      </text>
                    )}
                  </g>
                </g>
              );
            })}

            {/* Aviation Hub Nodes */}
            {HUBS.map((hub) => (
              <g key={hub.code} transform={`translate(${hub.x}, ${hub.y})`}>
                <circle r={3.5} fill="#0ea5e9" />
                <circle r={7} fill="none" stroke="#0ea5e9" strokeOpacity={0.4} />
                <text
                  x={8}
                  y={3}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {hub.code}
                </text>
              </g>
            ))}
          </svg>

          {/* Compass Rose Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400">
            <Compass className="w-3.5 h-3.5 text-brand-400" />
            <span>HEADING {selectedFlight.headingDeg}° N</span>
          </div>
        </div>

        {/* Selected Flight Live Telemetry Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Live Telemetry Target
                </span>
                <div className="text-xl font-black font-display text-white">
                  {selectedFlight.airline}
                </div>
                <div className="text-xs font-mono font-bold text-brand-400">
                  {selectedFlight.flightNumber} • {selectedFlight.aircraft}
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                {selectedFlight.status}
              </span>
            </div>

            {/* Route Sector */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black font-mono text-white">
                  {selectedFlight.from.code}
                </div>
                <div className="text-[11px] text-slate-400">{selectedFlight.from.name}</div>
              </div>

              <div className="flex flex-col items-center flex-1 px-4">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {Math.round(selectedFlight.progress)}% COMPLETE
                </span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden my-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${selectedFlight.progress}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-500">EN ROUTE</span>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-white">
                  {selectedFlight.to.code}
                </div>
                <div className="text-[11px] text-slate-400">{selectedFlight.to.name}</div>
              </div>
            </div>

            {/* Avionics Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Altitude</span>
                <span className="text-sm font-black font-mono text-white">
                  {selectedFlight.altitudeFt.toLocaleString()} FT
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Ground Speed</span>
                <span className="text-sm font-black font-mono text-white">
                  {selectedFlight.speedKmh} KM/H
                </span>
              </div>
            </div>

            {/* Quick action button */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cabin Load: <strong className="text-white">92% Occupancy</strong></span>
                <span>Transponder: <strong className="text-emerald-400 font-mono">ON (Mode S)</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
