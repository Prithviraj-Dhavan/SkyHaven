import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Ticket, ArrowRight, Plane, ShieldCheck } from 'lucide-react';
import { Booking } from '../../types';
import { BoardingPass } from './BoardingPass';
import { Button } from '../ui/Button';

export const BookingConfirmation: React.FC<{ booking: Booking }> = ({ booking }) => {

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-3 sm:px-4 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 mb-1 sm:mb-2">
          <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
          Flight Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto px-2">
          Your reservation is locked. Electronic tickets have been issued and confirmation email dispatched.
        </p>

        {/* Email Notification Notice */}
        <div className="flex flex-wrap sm:inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-[11px] sm:text-xs font-semibold text-brand-600 dark:text-brand-400 break-all max-w-full text-center">
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Confirmation dispatched to: <strong className="font-mono">{booking.tickets[0]?.passengerEmail || booking.user?.email}</strong></span>
        </div>
      </div>

      {/* Render All Boarding Passes */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-[#0062E3]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Outbound Flight Boarding Pass{(booking.tickets?.length || 0) > 1 ? 'es' : ''}
          </h2>
        </div>
        {booking.tickets.map((ticket, idx) => (
          <BoardingPass
            key={ticket.id || idx}
            bookingReference={booking.bookingReference}
            flight={booking.flight}
            ticket={ticket}
            passengerName={ticket.passengerName}
          />
        ))}

        {Boolean((booking as any).returnBooking?.tickets?.length) && (
          <>
            <div className="flex items-center gap-2 pt-4">
              <Plane className="w-4 h-4 text-indigo-600 rotate-180" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Return Flight Boarding Pass{((booking as any).returnBooking.tickets?.length || 0) > 1 ? 'es' : ''}
              </h2>
            </div>
            {((booking as any).returnBooking.tickets as any[]).map((ticket, idx) => (
              <BoardingPass
                key={ticket.id || `ret-${idx}`}
                bookingReference={(booking as any).returnBooking.bookingReference}
                flight={(booking as any).returnBooking.flight}
                ticket={ticket}
                passengerName={ticket.passengerName}
              />
            ))}
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 sm:pt-6 print:hidden w-full max-w-md mx-auto sm:max-w-none">
        <Link to="/my-bookings" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto font-bold justify-center" leftIcon={<Ticket className="w-4 h-4" />}>
            View All My Bookings
          </Button>
        </Link>
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="w-full sm:w-auto font-bold justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Search More Flights
          </Button>
        </Link>
      </div>
    </div>
  );
};
