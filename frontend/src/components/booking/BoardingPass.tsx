import React from 'react';
import { Plane, QrCode, Printer, ShieldCheck, Clock, Luggage, MapPin } from 'lucide-react';
import { Ticket, Flight } from '../../types';
import { Button } from '../ui/Button';

interface BoardingPassProps {
  bookingReference: string;
  flight: Flight;
  ticket: Ticket;
  passengerName: string;
}

export const BoardingPass: React.FC<BoardingPassProps> = ({
  bookingReference,
  flight,
  ticket,
  passengerName,
}) => {
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 print:m-0 print:max-w-none">
      {/* Boarding Pass Ticket Container */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300">
        {/* Top Airline Header Ribbon */}
        <div className="bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 p-4 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black font-display tracking-tight">
                {flight.airline}
              </div>
              <div className="text-[11px] text-white/80 uppercase tracking-widest font-mono">
                Official Electronic Boarding Pass
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-white/70 block">
              Booking Ref (PNR)
            </span>
            <span className="text-base sm:text-lg font-black font-mono tracking-wider">
              {bookingReference}
            </span>
          </div>
        </div>

        {/* Main Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Passenger & Flight Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Passenger</span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display truncate">
                {passengerName || ticket.passengerName}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Flight</span>
              <div className="text-sm sm:text-base font-extrabold font-mono text-brand-600 dark:text-brand-400">
                {flight.flightNumber}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Seat</span>
              <div className="text-sm sm:text-base font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {ticket.seatNumber}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Cabin Class</span>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white capitalize">
                {ticket.cabinClass.toLowerCase().replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Route & Times */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
                {flight.origin.code}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{flight.origin.city}</div>
              <div className="text-xs font-mono text-brand-500 font-bold mt-1">{formatTime(depTime)}</div>
            </div>

            <div className="flex-1 flex flex-col items-center max-w-[140px] sm:max-w-[180px]">
              <span className="text-[10px] font-mono text-slate-400">{formatDate(depTime)}</span>
              <div className="w-full h-[2px] bg-slate-300 dark:bg-slate-700 my-2 relative flex items-center justify-center">
                <Plane className="w-4 h-4 text-brand-500 rotate-90 absolute" />
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-500">Confirmed Direct</span>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
                {flight.destination.code}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">{flight.destination.city}</div>
              <div className="text-xs font-mono text-brand-500 font-bold mt-1">{formatTime(arrTime)}</div>
            </div>
          </div>

          {/* Airport Logistics (Gate, Terminal, Boarding Time) */}
          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Gate</span>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                {flight.gate || 'G14'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Terminal</span>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                {flight.terminal || 'T2'}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Boarding Closes</span>
              <div className="text-sm font-extrabold text-amber-500 font-mono">
                {new Date(depTime.getTime() - 30 * 60000).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Divider Bar */}
        <div className="relative border-t-2 border-dashed border-slate-200 dark:border-slate-800 py-4 bg-slate-50/50 dark:bg-slate-950/40 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Circular Cutouts for authentic ticket feel */}
          <div className="hidden sm:block absolute -left-4 -top-4 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800" />
          <div className="hidden sm:block absolute -right-4 -top-4 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800" />

          {/* Simulated Aztec/QR Barcode */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <QrCode className="w-12 h-12 text-slate-900 dark:text-white" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {ticket.ticketNumber}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                ELECTRONIC CHECK-IN VALIDATED
              </div>
            </div>
          </div>

          {/* Print Button (hidden during print) */}
          <div className="print:hidden">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="rounded-xl"
            >
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
