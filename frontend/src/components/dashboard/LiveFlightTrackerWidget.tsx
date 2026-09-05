import React from 'react';
import { Plane, Clock, Sun, Cloud, Luggage, Radio, ShieldCheck, QrCode, ArrowRight, MapPin } from 'lucide-react';
import { Booking, Flight } from '../../types';
import { Button } from '../ui/Button';

interface LiveTrackerProps {
  booking: Booking;
  onViewPass: () => void;
}

export const LiveFlightTrackerWidget: React.FC<LiveTrackerProps> = ({ booking, onViewPass }) => {
  const depTime = new Date(booking.flight.departureTime);
  const arrTime = new Date(booking.flight.arrivalTime);

  return (
    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#0c162d] to-slate-900 border border-brand-500/30 shadow-2xl text-white space-y-6 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
              Active Upcoming Itinerary • PNR: {booking.bookingReference}
            </span>
            <div className="text-lg font-bold font-display text-white mt-0.5">
              {booking.flight.airline} ({booking.flight.flightNumber})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onViewPass}
            variant="glow"
            size="sm"
            leftIcon={<QrCode className="w-3.5 h-3.5" />}
          >
            Digital Boarding Pass
          </Button>
        </div>
      </div>

      {/* Main Route Tracker Line */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Origin */}
        <div className="text-left space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Departure Hub</span>
          <div className="text-3xl font-black font-display text-white">
            {booking.flight.origin.code}
          </div>
          <div className="text-xs text-slate-300 font-medium">{booking.flight.origin.name}</div>
          <div className="text-xs font-mono text-cyan-400 font-bold">
            {depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} (IST)
          </div>
        </div>

        {/* Center Progress Line */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            ON SCHEDULE • GATE {booking.flight.gate || 'G12'}
          </span>

          <div className="w-full h-2 bg-slate-800 rounded-full relative flex items-center overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-400 rounded-full" />
          </div>

          <div className="flex justify-between w-full text-[10px] font-mono text-slate-400">
            <span>Terminal {booking.flight.terminal || 'T1'}</span>
            <span>Non-stop ({booking.flight.durationMinutes}m)</span>
            <span>Baggage: Carousel 4</span>
          </div>
        </div>

        {/* Destination */}
        <div className="text-right space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Arrival Hub</span>
          <div className="text-3xl font-black font-display text-white">
            {booking.flight.destination.code}
          </div>
          <div className="text-xs text-slate-300 font-medium">{booking.flight.destination.name}</div>
          <div className="text-xs font-mono text-cyan-400 font-bold">
            {arrTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
        </div>
      </div>

      {/* Trip Intelligence Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <Sun className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Destination Weather</div>
            <div className="text-xs font-bold text-white">28°C • Clear Skies</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Web Check-in</div>
            <div className="text-xs font-bold text-emerald-400">OPEN (Auto Confirmed)</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <Luggage className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Baggage Tracker</div>
            <div className="text-xs font-bold text-white">1 Check-in • Tagged</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Aviation Insurance</div>
            <div className="text-xs font-bold text-white">Covered up to ₹25L</div>
          </div>
        </div>
      </div>
    </div>
  );
};
