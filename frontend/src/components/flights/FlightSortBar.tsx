import React from 'react';
import { 
  ArrowUpDown, 
  Sparkles, 
  Flame,
  CheckCircle2,
  TrendingDown,
  Clock,
  Plane
} from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { Flight } from '../../types';

interface FlightSortBarProps {
  totalCount: number;
  flights?: Flight[];
}

export const FlightSortBar: React.FC<FlightSortBarProps> = ({ totalCount, flights = [] }) => {
  const { searchParams, setSearchParams } = useBookingStore();

  // Compute lowest price and fastest duration dynamically from flights
  let cheapestPrice = 3650;
  let fastestMinutes = 75;
  let bestPrice = 4150;
  let bestMinutes = 85;

  if (flights.length > 0) {
    const prices = flights.map((f) => Number(f.effectivePrice || f.basePrice));
    const durations = flights.map((f) => f.durationMinutes);

    cheapestPrice = Math.min(...prices);
    fastestMinutes = Math.min(...durations);
    
    // Best is closest to min price and min duration
    const sortedByBest = [...flights].sort((a, b) => {
      const scoreA = Number(a.effectivePrice || a.basePrice) * 0.6 + a.durationMinutes * 30;
      const scoreB = Number(b.effectivePrice || b.basePrice) * 0.6 + b.durationMinutes * 30;
      return scoreA - scoreB;
    });
    
    if (sortedByBest[0]) {
      bestPrice = Number(sortedByBest[0].effectivePrice || sortedByBest[0].basePrice);
      bestMinutes = sortedByBest[0].durationMinutes;
    }
  }

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
  };

  const currentSort = searchParams.sortBy || 'price_asc';

  return (
    <div className="space-y-4 mb-6">
      {/* 3-Card Luxury Aviation Flight Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* 1. BEST (SkyHaven Optimal Choice) */}
        <button
          type="button"
          onClick={() => setSearchParams({ sortBy: 'price_asc' })}
          className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer relative overflow-hidden group border ${
            currentSort === 'price_asc'
              ? 'bg-white dark:bg-[#071b33] border-[#0062E3] dark:border-[#00B2D6] shadow-xl shadow-[#0062E3]/10 ring-2 ring-[#0062E3]/20 dark:ring-[#00B2D6]/20'
              : 'bg-white dark:bg-[#05203C] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
          }`}
        >
          {/* Top Active Glow Bar */}
          {currentSort === 'price_asc' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#0062E3] to-[#00B2D6]" />
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Luxury Gold Wing Insignia */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-300/50 dark:border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-amber-500 dark:text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white font-display">
                    BEST
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    Smart Pick
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Optimal price & duration
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-baseline justify-between">
            <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              ₹{bestPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 font-display flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Avg {formatHours(bestMinutes)}</span>
            </div>
          </div>
        </button>

        {/* 2. CHEAPEST (Lowest Fare Guaranteed) */}
        <button
          type="button"
          onClick={() => setSearchParams({ sortBy: 'price_asc' })}
          className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer relative overflow-hidden group border ${
            currentSort === 'price_asc'
              ? 'bg-white dark:bg-[#071b33] border-emerald-500 dark:border-emerald-400 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-[#05203C] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
          }`}
        >
          {/* Top Active Glow Bar */}
          {currentSort === 'price_asc' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600" />
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Precision Emerald Gem Insignia */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-300/50 dark:border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M11 3 8 9l4 12 4-12-3-6" />
                  <path d="M2 9h20" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white font-display">
                    CHEAPEST
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    Save Big
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Lowest available fare
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-baseline justify-between">
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              ₹{cheapestPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-display flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>Best direct price</span>
            </div>
          </div>
        </button>

        {/* 3. FASTEST (Direct Supersonic Route) */}
        <button
          type="button"
          onClick={() => setSearchParams({ sortBy: 'duration_asc' })}
          className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer relative overflow-hidden group border ${
            currentSort === 'duration_asc'
              ? 'bg-white dark:bg-[#071b33] border-[#0062E3] dark:border-[#00B2D6] shadow-xl shadow-[#0062E3]/10 ring-2 ring-[#0062E3]/20 dark:ring-[#00B2D6]/20'
              : 'bg-white dark:bg-[#05203C] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
          }`}
        >
          {/* Top Active Glow Bar */}
          {currentSort === 'duration_asc' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0062E3] via-sky-400 to-[#00B2D6]" />
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Supersonic Jet Vector Insignia */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-300/50 dark:border-blue-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-[#0062E3] dark:text-[#00B2D6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white font-display">
                    FASTEST
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-[#0062E3] dark:text-[#00B2D6]">
                    Non-Stop
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Shortest flight time
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-baseline justify-between">
            <div className="text-lg sm:text-xl font-black font-mono text-[#0062E3] dark:text-[#00B2D6] tracking-tight">
              {formatHours(fastestMinutes)}
            </div>
            <div className="text-xs font-bold text-[#0062E3] dark:text-[#00B2D6] font-display flex items-center gap-1">
              <Plane className="w-3 h-3 rotate-45" />
              <span>Direct Route</span>
            </div>
          </div>
        </button>
      </div>

      {/* Flight Count & Extra Sort Dropdown */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1 font-display">
        <div>
          Showing <strong className="text-slate-900 dark:text-white font-mono font-bold">{totalCount}</strong> flights matching your travel query
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1 font-mono">
            <ArrowUpDown className="w-3 h-3" />
            Sort by:
          </span>
          <select
            value={searchParams.sortBy || 'price_asc'}
            onChange={(e) => setSearchParams({ sortBy: e.target.value as any })}
            className="bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#0062E3] shadow-xs cursor-pointer"
          >
            <option value="price_asc">Price: Lowest first</option>
            <option value="price_desc">Price: Highest first</option>
            <option value="duration_asc">Duration: Fastest first</option>
            <option value="departure_asc">Departure: Earliest first</option>
          </select>
        </div>
      </div>
    </div>
  );
};
