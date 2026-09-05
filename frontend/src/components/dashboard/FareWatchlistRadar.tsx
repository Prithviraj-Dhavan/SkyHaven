import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, TrendingDown, TrendingUp, Sparkles, ArrowRight, Check, Zap, AlertCircle } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

interface TrackedRoute {
  id: string;
  from: string;
  to: string;
  currentFare: number;
  usualFare: number;
  trend: 'DOWN' | 'UP';
  discountPercent: number;
  aiInsight: string;
  alertEnabled: boolean;
}

export const FareWatchlistRadar: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchParams } = useBookingStore();

  const [routes, setRoutes] = useState<TrackedRoute[]>([
    {
      id: 'w-1',
      from: 'BOM',
      to: 'GOI',
      currentFare: 3650,
      usualFare: 4800,
      trend: 'DOWN',
      discountPercent: 24,
      aiInsight: 'Lowest price in 14 days! Great time to book weekend getaways.',
      alertEnabled: true,
    },
    {
      id: 'w-2',
      from: 'BLR',
      to: 'DEL',
      currentFare: 6200,
      usualFare: 7400,
      trend: 'DOWN',
      discountPercent: 16,
      aiInsight: 'Fares dropped ₹1,200 due to non-peak inventory release.',
      alertEnabled: true,
    },
    {
      id: 'w-3',
      from: 'DEL',
      to: 'DXB',
      currentFare: 18500,
      usualFare: 22000,
      trend: 'DOWN',
      discountPercent: 15,
      aiInsight: 'SkyHaven Flash Deal active for Dubai International sector.',
      alertEnabled: false,
    },
  ]);

  const toggleAlert = (id: string) => {
    setRoutes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, alertEnabled: !r.alertEnabled } : r))
    );
  };

  const handleBook = (r: TrackedRoute) => {
    setSearchParams({
      origin: r.from,
      destination: r.to,
      departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      passengers: 1,
    });
    navigate('/search');
  };

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <TrendingDown className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase text-emerald-500">
              AI Fare Drop Watcher
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Price Alerts & Predictive Watchlist
          </h3>
          <p className="text-xs text-slate-500">
            Real-time sector fare drops and algorithm-driven buy/wait recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Monitoring 24/7</span>
        </div>
      </div>

      {/* Tracked routes grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-4 hover:border-brand-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Sector & Trend Badge */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-black font-display text-slate-900 dark:text-white font-mono">
                  {r.from} ➔ {r.to}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {r.discountPercent}% Price Drop
                </span>
              </div>

              {/* Price comparison */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-brand-600 dark:text-brand-400">
                  ₹{r.currentFare.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 line-through font-mono">
                  ₹{r.usualFare.toLocaleString('en-IN')}
                </span>
              </div>

              {/* AI Insight */}
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 leading-relaxed">
                💡 <strong className="text-slate-900 dark:text-slate-200">AI Signal:</strong> {r.aiInsight}
              </p>
            </div>

            {/* Actions: Alert Toggle & Book */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => toggleAlert(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  r.alertEnabled
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{r.alertEnabled ? 'Alert Active' : 'Set Alert'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleBook(r)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
