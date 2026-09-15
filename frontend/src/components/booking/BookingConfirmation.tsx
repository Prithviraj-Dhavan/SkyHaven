import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Mail, Ticket, ArrowRight, Plane, ShieldCheck } from 'lucide-react';
import { Booking } from '../../types';
import { BoardingPass } from './BoardingPass';
import { Button } from '../ui/Button';

export const BookingConfirmation: React.FC<{ booking: Booking }> = ({ booking }) => {
  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#38bdf8', '#6366f1', '#10b981'],
      });
    } catch {
      // Ignore if confetti not supported
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
          Flight Booking Confirmed!
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Your reservation is locked. Electronic tickets have been issued and confirmation email dispatched.
        </p>

        {/* Email Notification Notice */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-400">
          <Mail className="w-4 h-4" />
          <span>Confirmation dispatched to: <strong>{booking.tickets[0]?.passengerEmail || booking.user?.email}</strong></span>
        </div>
      </div>

      {/* Render All Boarding Passes */}
      <div className="space-y-6">
        {booking.tickets.map((ticket, idx) => (
          <BoardingPass
            key={ticket.id || idx}
            bookingReference={booking.bookingReference}
            flight={booking.flight}
            ticket={ticket}
            passengerName={ticket.passengerName}
          />
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">

        <Link to="/">
          <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
