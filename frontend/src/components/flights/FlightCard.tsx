import React, { useState } from 'react';
import { 
  Plane, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Luggage, 
  Armchair, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Leaf, 
  Bell, 
  Check, 
  Wifi, 
  Zap, 
  Coffee 
} from 'lucide-react';
import { Flight } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);

  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const durationHours = Math.floor(flight.durationMinutes / 60);
  const durationMins = flight.durationMinutes % 60;

  // Airline specific theme colors, logos, and badges
  const getAirlineDetails = (airline: string) => {
    if (airline.includes('SkyLuxe')) {
      return {
        bg: 'from-indigo-600 via-purple-600 to-indigo-800',
        text: 'text-indigo-600 dark:text-indigo-400',
        logoText: 'SL',
        iconColor: 'text-amber-300',
      };
    }
    if (airline.includes('StarWings') || airline.includes('Apex')) {
      return {
        bg: 'from-amber-500 via-orange-500 to-amber-600',
        text: 'text-amber-600 dark:text-amber-400',
        logoText: 'SW',
        iconColor: 'text-yellow-100',
      };
    }
    if (airline.includes('Oceanic') || airline.includes('Vayu')) {
      return {
        bg: 'from-teal-500 via-emerald-600 to-cyan-600',
        text: 'text-teal-600 dark:text-teal-400',
        logoText: 'OA',
        iconColor: 'text-emerald-100',
      };
    }
    if (airline.includes('Air India') || airline.includes('Crimson')) {
      return {
        bg: 'from-rose-600 via-red-600 to-amber-600',
        text: 'text-rose-600 dark:text-rose-400',
        logoText: 'AI',
        iconColor: 'text-amber-200',
      };
    }
    return {
      bg: 'from-[#0062E3] via-blue-600 to-[#00B2D6]',
      text: 'text-[#0062E3] dark:text-[#00B2D6]',
      logoText: 'SH',
      iconColor: 'text-white',
    };
  };

  const airlineMeta = getAirlineDetails(flight.airline);

  return (
    <div className="skyscanner-card p-5 sm:p-6 transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        
        {/* Left: Airline Logo & Info */}
        <div className="flex items-center gap-3.5 lg:w-1/4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${airlineMeta.bg} p-0.5 shadow-md shrink-0 flex items-center justify-center`}>
            <div className="w-full h-full rounded-[14px] bg-white/10 backdrop-blur-xs flex items-center justify-center text-white font-black font-display text-sm relative">
              <Plane className={`w-5 h-5 -rotate-45 ${airlineMeta.iconColor} drop-shadow-sm`} />
              <span className="absolute bottom-1 right-1 text-[8px] font-mono font-black opacity-80">
                {airlineMeta.logoText}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-1.5">
              <span>{flight.airline}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-[#0062E3] dark:text-[#00B2D6]">
                {flight.flightNumber}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {flight.aircraftType || 'Airbus A320neo'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Flight Timeline & Route Visualizer */}
        <div className="flex-1 flex items-center justify-between gap-3 sm:gap-6 px-0 sm:px-2">
          {/* Departure */}
          <div className="text-left">
            <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
              {formatTime(depTime)}
            </div>
            <div className="text-xs font-black font-mono text-[#0062E3] dark:text-[#00B2D6]">
              {flight.origin.code}
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-[90px] sm:max-w-[120px]">
              {flight.origin.city}
            </div>
          </div>

          {/* Route Duration Indicator */}
          <div className="flex-1 flex flex-col items-center max-w-[160px] sm:max-w-[210px]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {durationHours}h {durationMins > 0 ? `${durationMins}m` : ''}
            </span>
            
            {/* Visual Route Track */}
            <div className="w-full h-[2px] bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#0062E3] dark:bg-[#00B2D6] absolute -left-1" />
              <div className="p-1 rounded-full bg-white dark:bg-[#05203C] shadow-xs">
                <Plane className="w-3.5 h-3.5 text-[#0062E3] dark:text-[#00B2D6] rotate-90" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#0062E3] dark:bg-[#00B2D6] absolute -right-1" />
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Direct
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                <Leaf className="w-3 h-3" /> -14% CO₂
              </span>
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
              {formatTime(arrTime)}
            </div>
            <div className="text-xs font-black font-mono text-[#0062E3] dark:text-[#00B2D6]">
              {flight.destination.code}
            </div>
            <div className="text-[11px] text-slate-500 truncate max-w-[90px] sm:max-w-[120px]">
              {flight.destination.city}
            </div>
          </div>
        </div>

        {/* Right: Skyscanner Price Block & Primary Select Action */}
        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 lg:w-1/4">
          <div className="text-left lg:text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Price from</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-1">
              <span className="text-[#0062E3] dark:text-[#00B2D6] font-bold">₹</span>
              <span>{Number(flight.effectivePrice || flight.basePrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {flight.availableSeatsCount ?? 42} seats remaining
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAlertActive(!isAlertActive)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isAlertActive
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={isAlertActive ? 'Price alert active' : 'Set price drop alert for this flight'}
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelect(flight)}
              className="px-6 py-2.5 rounded-xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-bold text-sm tracking-wide shadow-sky hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Select</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Skyscanner Accordion Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-semibold text-slate-500 hover:text-[#0062E3] dark:hover:text-[#00B2D6] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide flight details' : 'Flight & baggage details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
          {flight.terminal && (
            <span>Terminal: <strong className="text-slate-700 dark:text-slate-300">{flight.terminal}</strong></span>
          )}
          {flight.gate && (
            <span>Gate: <strong className="text-slate-700 dark:text-slate-300">{flight.gate}</strong></span>
          )}
        </div>
      </div>

      {/* Expandable Flight & Amenities Details Drawer */}
      {isExpanded && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#02122c]/80 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in duration-150">
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Luggage className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6]" />
              Baggage Included
            </div>
            <p className="text-slate-500 dark:text-slate-400">Cabin: 1 x 7 kg handbag (included)</p>
            <p className="text-slate-500 dark:text-slate-400">Check-in: 1 x 15-23 kg piece (included)</p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Armchair className="w-4 h-4 text-indigo-500" />
              Cabin Experience
            </div>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> In-Seat USB-C Power
            </p>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-[#00B2D6]" /> High-Speed In-Flight WiFi
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Flexibility & Refund
            </div>
            <p className="text-slate-500 dark:text-slate-400">Free cancellation up to 24h prior</p>
            <p className="text-slate-500 dark:text-slate-400">Instant refund to original payment</p>
          </div>
        </div>
      )}
    </div>
  );
};
