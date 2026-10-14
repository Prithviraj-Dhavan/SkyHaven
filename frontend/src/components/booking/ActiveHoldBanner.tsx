import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, ArrowRight, X, Plane, Minimize2, Maximize2 } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useCountdown, formatTimer } from '../../hooks';
import { ReleaseSeatsModal } from './ReleaseSeatsModal';

export const ActiveHoldBanner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    selectedFlight,
    selectedSeats,
    returnSeats,
    holdExpiresAt,
    restoreHold,
    clearHold,
  } = useBookingStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  // Sync with backend on mount or when user changes
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setIsSyncing(true);

    api
      .getActiveHold()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data.hasActiveHold && res.data.hold) {
          const { flight, seats, expiresAt } = res.data.hold;
          restoreHold({ flight, seats, expiresAt });
          setIsDismissed(false);
        } else if (res.success && !res.data.hasActiveHold) {
          // No active hold on server
          if (holdExpiresAt) {
            clearHold();
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to sync active hold:', err);
      })
      .finally(() => {
        if (isMounted) setIsSyncing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, restoreHold, clearHold]);

  const handleExpire = async () => {
    const seatIds = [
      ...selectedSeats.map((s) => s.id),
      ...returnSeats.map((s) => s.id),
    ];
    clearHold();
    if (seatIds.length > 0) {
      await api.releaseHold({ seatIds }).catch(() => {});
    }
    window.dispatchEvent(new CustomEvent('skyhaven:seats-released'));
  };

  const secondsLeft = useCountdown(holdExpiresAt, Boolean(holdExpiresAt), handleExpire);

  const handleConfirmRelease = async () => {
    try {
      setIsReleasing(true);
      const seatIds = [
        ...selectedSeats.map((s) => s.id),
        ...returnSeats.map((s) => s.id),
      ];
      // 1. Release hold in the database first
      await api.releaseHold({ seatIds: seatIds.length > 0 ? seatIds : undefined }).catch((err) => {
        console.warn('Failed to release hold:', err);
      });

      // 2. Clear client hold and dismiss banner
      clearHold();
      setIsDismissed(true);

      // 3. Notify any listeners (e.g. FlightDetailsPage seat map)
      window.dispatchEvent(new CustomEvent('skyhaven:seats-released'));
    } finally {
      setIsReleasing(false);
      setIsReleaseModalOpen(false);
    }
  };

  // Do not show banner if:
  // 1. Hold timer expired or no seats held
  // 2. User is currently on Checkout page (Checkout has its own inline countdown banner)
  // 3. User manually dismissed it in this session
  if (
    !holdExpiresAt ||
    secondsLeft <= 0 ||
    !selectedFlight ||
    selectedSeats.length === 0 ||
    location.pathname === '/checkout' ||
    isDismissed
  ) {
    return null;
  }

  const seatNumbers = selectedSeats.map((s) => s.seatNumber).join(', ');
  const totalDuration = 300; // 5-minute lock window in seconds
  const progressPercent = Math.min(100, Math.max(0, (secondsLeft / totalDuration) * 100));
  const isUrgent = secondsLeft < 60;

  return (
    <aside
      aria-label="Active Seat Hold Notification"
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 pointer-events-auto"
    >
      {isMinimized ? (
        /* Minimized Floating Side Icon / Pill */
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#061836]/95 backdrop-blur-2xl border border-blue-200/90 dark:border-blue-500/30 text-slate-800 dark:text-white shadow-[0_10px_30px_rgba(0,98,227,0.18)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-[0_12px_36px_rgba(0,98,227,0.28)] hover:scale-105 active:scale-95 transition-all cursor-pointer ring-1 ring-blue-500/10"
          title="Seats locked! Click to expand reservation details."
        >
          {/* Plane Icon Badge */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0062E3] to-[#00B2D6] text-white flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform">
            <Plane className="w-3.5 h-3.5 -rotate-45" />
          </div>

          {/* Live Timer with pulsing beacon */}
          <div className="flex items-center gap-1.5 font-mono text-xs font-black">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <span
              className={
                isUrgent
                  ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'text-[#0062E3] dark:text-sky-300'
              }
            >
              {formatTimer(secondsLeft)}
            </span>
          </div>

          {/* Seat Tag */}
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-[#0062E3] dark:text-sky-200 border border-blue-200/60 dark:border-blue-700/50">
            Seat {seatNumbers}
          </span>

          {/* Expand Hint */}
          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-[#0062E3] dark:group-hover:text-white group-hover:bg-blue-50 dark:group-hover:bg-white/20 transition-colors ml-0.5">
            <Maximize2 className="w-3 h-3" />
          </div>
        </button>
      ) : (
        /* Expanded Stunning Glass Card matching page aesthetics */
        <div className="w-[310px] sm:w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-[#061836]/95 backdrop-blur-2xl border border-blue-100/90 dark:border-white/10 shadow-[0_16px_45px_rgba(0,40,120,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-3.5 sm:p-4 text-slate-900 dark:text-white ring-1 ring-blue-500/10 dark:ring-white/5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Locked for You
              </span>
              <span
                className={`font-mono text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isUrgent
                    ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 animate-pulse'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-[#0062E3] dark:text-sky-300 border border-blue-100 dark:border-blue-800/50'
                }`}
              >
                <Clock className="w-3 h-3" />
                {formatTimer(secondsLeft)}
              </span>
            </div>

            <div className="flex items-center gap-0.5">
              {/* Minimize to small icon */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                title="Minimize to side icon"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                title="Dismiss notification"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Countdown Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full my-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                isUrgent
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-[#0062E3] to-[#00B2D6]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Flight Route & Seat Details */}
          <div className="flex items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 flex items-center justify-center text-[#0062E3] dark:text-sky-400 shrink-0">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                  {selectedFlight.origin.code || selectedFlight.origin.city} ➔ {selectedFlight.destination.code || selectedFlight.destination.city}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {selectedFlight.flightNumber} • {selectedFlight.airline}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="font-mono text-xs font-bold text-[#0062E3] dark:text-sky-300 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/50 px-2 py-0.5 rounded-lg inline-block">
                Seat {seatNumbers}
              </span>
            </div>
          </div>

          {/* Action CTAs: Resume & Release */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="flex-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0062E3] to-[#00B2D6] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs tracking-tight shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Resume Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsReleaseModalOpen(true)}
              className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-800 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-bold text-xs transition-colors cursor-pointer"
              title="Release these seats"
            >
              Release
            </button>
          </div>
        </div>
      )}

      <ReleaseSeatsModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        onConfirmRelease={handleConfirmRelease}
        flight={selectedFlight}
        seats={selectedSeats}
        secondsLeft={secondsLeft}
        isProcessing={isReleasing}
      />
    </aside>
  );
};
