import React, { useState } from 'react';
import { 
  Plane, 
  Check, 
  Lock, 
  Sparkles, 
  Crown, 
  Briefcase, 
  Zap, 
  Armchair, 
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { FlightSeat, CabinClass } from '../../types';
import { useBookingStore } from '../../store/bookingStore';
import { useCountdown, formatTimer } from '../../hooks';

interface SeatMapProps {
  seats: FlightSeat[];
  selectedSeats: FlightSeat[];
  onToggleSeat: (seat: FlightSeat) => void;
  maxPassengers: number;
  onContinue?: () => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeats,
  onToggleSeat,
  maxPassengers,
  onContinue,
}) => {
  const { holdExpiresAt } = useBookingStore();
  const secondsLeft = useCountdown(holdExpiresAt, Boolean(holdExpiresAt));

  const [hoveredSeat, setHoveredSeat] = useState<FlightSeat | null>(null);
  const [activeCabinTab, setActiveCabinTab] = useState<CabinClass | 'ALL'>('ECONOMY');

  // Filter seats based on active cabin tab (or all)
  const filteredSeats = activeCabinTab === 'ALL' 
    ? seats 
    : seats.filter((s) => s.cabinClass === activeCabinTab);

  // Group seats by row
  const rows = Array.from(new Set(filteredSeats.map((s) => s.row))).sort((a, b) => a - b);

  const cabinConfigs = [
    {
      id: 'ECONOMY' as const,
      label: 'Economy',
      tag: 'Standard',
      activeStyle: 'bg-gradient-to-r from-[#0062E3] to-[#004bb0] text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/40',
    },
    {
      id: 'PREMIUM_ECONOMY' as const,
      label: 'Premium',
      tag: '+₹2,800',
      activeStyle: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-300/40',
    },
    {
      id: 'BUSINESS' as const,
      label: 'Business',
      tag: '+₹7,500',
      activeStyle: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-300/40',
    },
    {
      id: 'FIRST' as const,
      label: 'First Class',
      tag: '+₹12,500',
      activeStyle: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-300/40',
    },
    {
      id: 'ALL' as const,
      label: 'All Cabins',
      tag: 'Full Plane',
      activeStyle: 'bg-slate-800 dark:bg-slate-700 text-white shadow-md ring-2 ring-slate-400/40',
    },
  ];

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
        {/* Outer Sky-Blue Ambient Backdrop Card */}
      <div className="w-full max-w-lg bg-gradient-to-b from-blue-100/70 via-indigo-50/40 to-slate-100/80 dark:from-[#02122c] dark:via-[#05203C]/80 dark:to-[#02122c] p-2.5 sm:p-7 rounded-2xl sm:rounded-3xl border border-blue-200/60 dark:border-slate-800 shadow-xl">
        
        {/* Clean Luxury Cabin Switcher Pills with mobile horizontal scroll */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-5 mb-5 sm:mb-6">
          {cabinConfigs.map((cfg) => {
            const isActive = activeCabinTab === cfg.id;
            return (
              <button
                key={cfg.id}
                type="button"
                onClick={() => setActiveCabinTab(cfg.id)}
                className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-2.5 sm:px-2 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer text-center relative shrink-0 min-w-[76px] sm:min-w-0 ${
                  isActive
                    ? cfg.activeStyle
                    : 'bg-white/90 dark:bg-[#071d38] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 hover:border-blue-400 hover:shadow-xs'
                }`}
              >
                <span className="text-[11px] sm:text-xs font-black font-display tracking-tight leading-tight whitespace-nowrap">
                  {cfg.label}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-mono mt-0.5 font-bold ${isActive ? 'text-white/90' : 'text-slate-400 dark:text-slate-500'}`}>
                  {cfg.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* White Airplane Fuselage Shape Container matching Image 5 */}
        <div className="relative w-full bg-white dark:bg-[#05203C] rounded-t-[100px] sm:rounded-t-[170px] rounded-b-[28px] sm:rounded-b-[36px] border border-slate-200/90 dark:border-slate-700/80 shadow-2xl px-2.5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-7 overflow-hidden">
          
          {/* Cockpit Nose & Curved Windshield Glass matching Image 5 */}
          <div className="w-full flex flex-col items-center justify-center mb-6">
            {/* Windshield Arches */}
            <div className="relative w-28 h-14 rounded-t-full bg-gradient-to-b from-slate-100 via-blue-50 to-white dark:from-slate-800 dark:via-[#072448] dark:to-[#05203C] border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
              {/* Window Panels Dividers */}
              <div className="absolute inset-0 grid grid-cols-4 gap-0.5 pointer-events-none opacity-40">
                <div className="border-r border-slate-300 dark:border-slate-600" />
                <div className="border-r border-slate-300 dark:border-slate-600" />
                <div className="border-r border-slate-300 dark:border-slate-600" />
                <div />
              </div>
              {/* Gentle reflection shine */}
              <div className="absolute top-1 left-3 w-8 h-4 bg-sky-400/20 rounded-full blur-[2px] -rotate-12" />
              <Plane className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6] opacity-70" />
            </div>
          </div>

          {/* Cabin Class Centered Header without emojis */}
          <div className="text-center mb-4">
            <h3 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-white tracking-tight">
              {activeCabinTab === 'ECONOMY' && 'Economy Class'}
              {activeCabinTab === 'PREMIUM_ECONOMY' && 'Premium Economy Class'}
              {activeCabinTab === 'BUSINESS' && 'Business Class'}
              {activeCabinTab === 'FIRST' && 'First Class'}
              {activeCabinTab === 'ALL' && 'All Aircraft Cabins (Rows 1–12)'}
            </h3>

            {/* Clean Minimalist Legend matching Image 5 */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {/* Available */}
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-3.5 rounded-sm border-2 border-amber-400 bg-white dark:bg-slate-800 shadow-2xs" />
                <span className="text-[11px]">Available</span>
              </div>

              {/* Booked */}
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-3.5 rounded-sm bg-slate-300 dark:bg-slate-600" />
                <span className="text-[11px]">Booked</span>
              </div>

              {/* Selected */}
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-3.5 rounded-sm bg-[#0062E3] shadow-xs" />
                <span className="text-[11px]">Selected</span>
              </div>

              {/* Locked for You */}
              {secondsLeft > 0 && selectedSeats.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-3.5 rounded-sm bg-gradient-to-r from-[#0062E3] to-[#00B2D6] shadow-xs flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </span>
                  <span className="text-[11px] font-bold text-[#0062E3] dark:text-[#00B2D6]">
                    Locked for You ({formatTimer(secondsLeft)})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Seat Grid (3 Seats Left | Aisle | 3 Seats Right) with ACTUAL seat numbers */}
          <div className="space-y-3.5 my-6">
            {rows.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No seats available in this cabin section.
              </div>
            ) : (
              rows.map((rowNum) => {
                const rowSeats = filteredSeats.filter((s) => s.row === rowNum);
                const seatA = rowSeats.find((s) => s.column === 'A');
                const seatB = rowSeats.find((s) => s.column === 'B');
                const seatC = rowSeats.find((s) => s.column === 'C');
                const seatD = rowSeats.find((s) => s.column === 'D');
                const seatE = rowSeats.find((s) => s.column === 'E');
                const seatF = rowSeats.find((s) => s.column === 'F');

                const isExit = seatA?.isExitRow;

                return (
                  <div key={rowNum} className="relative">
                    {isExit && (
                      <div className="flex items-center justify-between text-[8px] sm:text-[9px] uppercase font-mono font-bold text-amber-600 dark:text-amber-400 py-0.5 px-1.5 sm:px-2 my-1 bg-amber-500/10 rounded border border-amber-500/20">
                        <span>Exit</span>
                        <span className="truncate px-1">Extra Legroom Row {rowNum}</span>
                        <span>Exit</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1 sm:gap-2">
                      {/* Left Group (A, B, C) */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {renderSeat(seatA)}
                        {renderSeat(seatB)}
                        {renderSeat(seatC)}
                      </div>

                      {/* Aisle Spacer with Row Label */}
                      <div className="w-4 sm:w-7 flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 select-none">
                        {rowNum}
                      </div>

                      {/* Right Group (D, E, F) */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {renderSeat(seatD)}
                        {renderSeat(seatE)}
                        {renderSeat(seatF)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Continue Booking Button matching Image 5 */}
          <div className="mt-7 pt-2">
            <button
              type="button"
              onClick={onContinue}
              disabled={selectedSeats.length === 0}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                selectedSeats.length === 0
                  ? 'bg-[#0062E3] text-white opacity-90 hover:opacity-100 hover:scale-[1.01] active:scale-[0.99] shadow-blue-500/20'
                  : 'bg-[#0062E3] hover:bg-[#0051c7] text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/30'
              }`}
            >
              <span>Continue Booking</span>
              {selectedSeats.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-mono">
                  {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip Pill */}
      {hoveredSeat && (() => {
        const isHovSelected = selectedSeats.some((s) => s.id === hoveredSeat.id);
        const isHovLocked = (hoveredSeat.isHeldByMe || isHovSelected) && secondsLeft > 0;

        let statusText = 'Available';
        if (hoveredSeat.isBooked) {
          statusText = 'Booked / Occupied';
        } else if (isHovLocked) {
          statusText = `🔒 Locked for You (${formatTimer(secondsLeft)} remaining)`;
        } else if (isHovSelected) {
          statusText = 'Selected';
        } else if (hoveredSeat.priceModifier > 0) {
          statusText = `+₹${hoveredSeat.priceModifier.toLocaleString('en-IN')} Upgrade`;
        } else {
          statusText = 'Standard Included';
        }

        return (
          <div className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2.5 animate-in fade-in duration-100">
            <span className="font-mono font-black text-[#00B2D6] text-sm">{hoveredSeat.seatNumber}</span>
            <span className="capitalize text-slate-300">{hoveredSeat.cabinClass.toLowerCase().replace('_', ' ')}</span>
            <span>•</span>
            <span className={isHovLocked ? 'text-amber-400 font-bold' : ''}>{statusText}</span>
          </div>
        );
      })()}
    </div>
  );

  function renderSeat(seat: FlightSeat | undefined) {
    if (!seat) {
      return <div className="w-8 h-8 sm:w-11 sm:h-11" />;
    }

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    const isLockedForMe = (seat.isHeldByMe || isSelected) && secondsLeft > 0;

    // Styling matching Image 5
    let seatClasses = '';
    if (seat.isBooked) {
      seatClasses = 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed shadow-none';
    } else if (isLockedForMe) {
      seatClasses = 'bg-gradient-to-br from-[#0062E3] to-[#009bb8] text-white font-bold shadow-md shadow-blue-500/50 ring-2 ring-cyan-300 scale-105 z-10';
    } else if (isSelected) {
      seatClasses = 'bg-[#0062E3] text-white font-bold shadow-md shadow-blue-500/40 ring-2 ring-blue-300 scale-105 z-10';
    } else {
      seatClasses = 'border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold hover:border-[#0062E3] hover:scale-105 active:scale-95 shadow-2xs';
    }

    let tooltipStatus = 'Available';
    if (seat.isBooked) {
      tooltipStatus = 'Booked / Occupied';
    } else if (isLockedForMe) {
      tooltipStatus = `Locked for You (${formatTimer(secondsLeft)} remaining)`;
    } else if (isSelected) {
      tooltipStatus = 'Selected';
    } else if (seat.priceModifier > 0) {
      tooltipStatus = `Available (+₹${seat.priceModifier})`;
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={seat.isBooked}
        onMouseEnter={() => setHoveredSeat(seat)}
        onMouseLeave={() => setHoveredSeat(null)}
        onClick={() => onToggleSeat(seat)}
        className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold transition-all duration-150 relative cursor-pointer ${seatClasses}`}
        title={`Seat ${seat.seatNumber} (${seat.cabinClass.replace('_', ' ')}) - ${tooltipStatus}`}
      >
        {isLockedForMe ? (
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-[10px] sm:text-xs font-mono font-black">{seat.seatNumber}</span>
            <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-cyan-200 mt-0.5 animate-pulse" />
          </div>
        ) : (
          seat.seatNumber
        )}
      </button>
    );
  }
};
