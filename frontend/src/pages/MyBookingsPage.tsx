import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Calendar, ArrowRight, Ticket, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBookingStore } from '../store/bookingStore';
import { useCountdown, formatTimer } from '../hooks';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const MyBookingsPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { selectedFlight, selectedSeats, holdExpiresAt } = useBookingStore();
  const secondsLeft = useCountdown(holdExpiresAt, Boolean(holdExpiresAt));

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      const res = await api.cancelBooking(cancellingBookingId);
      if (res.success) {
        setCancellingBookingId(null);
        // refresh bookings list softly instead of page reload
        const updated = await api.getUserBookings();
        if (updated.success && updated.data) {
          setBookings(updated.data);
        }
      } else {
        setCancelError('Failed to cancel booking.');
      }
    } catch (e: any) {
      setCancelError(e.response?.data?.error?.message || 'Error cancelling booking');
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate('/login?redirect=/my-bookings');
      return;
    }

    api.getUserBookings()
      .then((res) => {
        if (res.success && res.data) {
          setBookings(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-3 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white mb-6 sm:mb-8">
        My Bookings
      </h1>

      {/* Ongoing Seat Hold & Payment Pending Banner */}
      {holdExpiresAt && secondsLeft > 0 && selectedFlight && selectedSeats.length > 0 && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Payment Incomplete
                </span>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  ⏰ {formatTimer(secondsLeft)} left
                </span>
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {selectedFlight.origin.city} ➔ {selectedFlight.destination.city} ({selectedFlight.flightNumber})
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Held Seats: {selectedSeats.map((s) => s.seatNumber).join(', ')} • {selectedFlight.airline}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Resume & Complete Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center p-8 sm:p-12 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl">
          <Ticket className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">No Bookings Found</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">You haven't booked any flights with us yet.</p>
          <Link to="/">
            <Button variant="primary">Search for Flights</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {bookings.map((booking) => {
            const flight = booking.flight;
            const depDate = new Date(flight.departureTime);
            
            return (
              <div key={booking.id} className="bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 hover:shadow-lg transition-shadow">
                <div className="flex-1 flex items-start sm:items-center gap-3 sm:gap-5 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0">
                    <Plane className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{flight.origin?.city} ({flight.origin?.code})</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{flight.destination?.city} ({flight.destination?.code})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {depDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>Ref: <strong className="font-mono text-slate-900 dark:text-white">{booking.bookingReference}</strong></span>
                      <span>•</span>
                      <span>{booking.tickets.length} Passenger(s)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-100 dark:border-slate-800/80 pt-3 md:pt-0 gap-3">
                  <div className="text-left md:text-right">
                    <div className="text-xs sm:text-sm font-bold mb-0.5">
                      {booking.status === 'CANCELLED' ? (
                        <span className="text-rose-500">Cancelled / Refunded</span>
                      ) : (
                        <span className="text-emerald-500">Confirmed</span>
                      )}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/confirmation?ref=${booking.bookingReference}`}>
                      <Button variant="outline" size="sm" className="font-bold whitespace-nowrap">
                        View Ticket
                      </Button>
                    </Link>
                    {booking.status !== 'CANCELLED' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold whitespace-nowrap"
                        onClick={() => setCancellingBookingId(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal 
        isOpen={!!cancellingBookingId} 
        onClose={() => setCancellingBookingId(null)}
        maxWidth="md"
      >
        <div className="text-center p-2">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cancel Booking?</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Are you sure you want to cancel this booking? This action cannot be undone, your seats will be released to the public, and your refund will be processed immediately.
          </p>
          
          {cancelError && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm border border-rose-200 dark:border-rose-900/50">
              {cancelError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setCancellingBookingId(null)}
              className="sm:w-1/2"
              disabled={isCancelling}
            >
              Keep Booking
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmCancel}
              className="sm:w-1/2 bg-rose-500 hover:bg-rose-600 focus:ring-rose-500 text-white"
              isLoading={isCancelling}
            >
              Confirm Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
