import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, ArrowRight, Clock, User } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Passenger, PassengerType, FlightSeat } from '../types';
import { PassengerForm } from '../components/booking/PassengerForm';
import { PaymentModal } from '../components/booking/PaymentModal';
import { ReleaseSeatsModal } from '../components/booking/ReleaseSeatsModal';
import { CheckoutAuthModal } from '../components/booking/CheckoutAuthModal';
import { useCountdown, formatTimer } from '../hooks';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const {
    selectedFlight,
    selectedSeats,
    returnFlight,
    returnSeats,
    setLastConfirmedBooking,
    holdExpiresAt,
    setHoldExpiresAt,
    clearHold,
  } = useBookingStore();

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const bookingConfirmedRef = useRef(false);
  const isReleasingRef = useRef(false);

  const allSeatIds = [
    ...selectedSeats.map((s: FlightSeat) => s.id),
    ...returnSeats.map((s: FlightSeat) => s.id),
  ];

  useEffect(() => {
    if (isLoading) return;

    if (!selectedFlight || selectedSeats.length === 0) {
      navigate('/search');
      return;
    }

    const storedPassengers = useBookingStore.getState().passengers;
    const initialPassengers: Passenger[] = selectedSeats.map((seat: FlightSeat, idx: number) => {
      const existing = storedPassengers?.find((p) => p.seatId === seat.id) || storedPassengers?.[idx];
      return {
        name: existing?.name || (idx === 0 ? (user?.name || '') : ''),
        email: existing?.email || (idx === 0 ? (user?.email || '') : ''),
        documentNumber: existing?.documentNumber || '',
        type: existing?.type || ('ADULT' as PassengerType),
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        cabinClass: seat.cabinClass,
        price: Number(selectedFlight.basePrice) + Number(seat.priceModifier),
      };
    });

    setPassengers(initialPassengers);
  }, [selectedFlight, selectedSeats, isLoading, navigate]);

  // If user logs in while on checkout page, prefill first passenger details if empty
  useEffect(() => {
    if (user && passengers.length > 0) {
      setPassengers((prev) => {
        if (prev.length > 0 && (!prev[0].name || !prev[0].email)) {
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            name: updated[0].name || user.name || '',
            email: updated[0].email || user.email || '',
          };
          useBookingStore.getState().setPassengers(updated);
          return updated;
        }
        return prev;
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user || !selectedFlight || allSeatIds.length === 0 || isReleasingRef.current) return;
    if (!holdExpiresAt) {
      api.holdSeats({ seatIds: allSeatIds })
        .then((res) => {
          if (res.success && res.data?.expiresAt && !isReleasingRef.current) {
            setHoldExpiresAt(res.data.expiresAt);
          }
        })
        .catch((err) => {
          console.warn('Seat lock auto-start:', err);
        });
    }
  }, [user, selectedFlight, allSeatIds.length, holdExpiresAt, setHoldExpiresAt]);

  const handleHoldExpired = async () => {
    isReleasingRef.current = true;
    setIsPaymentModalOpen(false);
    setClientSecret(null);
    const flightId = selectedFlight?.id;
    const seatIds = [...allSeatIds];
    clearHold();
    setError('Your 5-minute seat hold expired. Please select your seats again.');
    if (seatIds.length > 0) {
      await api.releaseHold({ seatIds }).catch(() => {});
    }
    window.dispatchEvent(new CustomEvent('skyhaven:seats-released'));
    if (flightId) {
      navigate(`/flights/${flightId}`);
    }
  };

  const secondsLeft = useCountdown(holdExpiresAt, Boolean(holdExpiresAt), handleHoldExpired);

  const handlePassengerChange = (index: number, updated: Partial<Passenger>) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      useBookingStore.getState().setPassengers(next);
      return next;
    });
  };

  const outboundTotal = passengers.reduce((sum, p) => sum + (p.price || Number(selectedFlight?.basePrice || 0)), 0);
  const returnBasePrice = returnFlight ? Number(returnFlight.basePrice) : 0;
  const returnTotal = (returnFlight && returnSeats.length > 0)
    ? returnSeats.reduce((sum, s) => sum + returnBasePrice + Number(s.priceModifier), 0)
    : 0;
  const totalAmount = Math.round(outboundTotal + returnTotal);

  const proceedWithPaymentSession = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const holdRes = await api.holdSeats({ seatIds: allSeatIds });
      if (!holdRes.success) {
        setError('Could not hold your seats. Please try again.');
        return;
      }
      setHoldExpiresAt(holdRes.data.expiresAt);

      const intentRes = await api.createPaymentIntent({ amount: totalAmount, currency: 'inr' });
      if (intentRes.success && intentRes.data) {
        setClientSecret(intentRes.data.clientSecret);
        setIsPaymentModalOpen(true);
      }
    } catch (err: any) {
      setError(err.message || 'Seats were unavailable or payment session could not start.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim() || !p.email.trim()) {
        setError(`Please complete Name and Email for Passenger ${i + 1}.`);
        return;
      }
    }

    setError(null);

    // If not logged in, prompt authentication without navigating away from checkout!
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    await proceedWithPaymentSession();
  };

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    await proceedWithPaymentSession();
  };

  const handleClosePayment = () => {
    setIsPaymentModalOpen(false);
    setClientSecret(null);
  };

  const handleConfirmRelease = async () => {
    try {
      isReleasingRef.current = true;
      setIsReleasing(true);
      setIsPaymentModalOpen(false);
      setClientSecret(null);

      const flightId = selectedFlight?.id;
      const seatIdsToRelease = allSeatIds.length > 0 ? allSeatIds : undefined;

      // 1. Release hold on the backend first
      await api.releaseHold({ seatIds: seatIdsToRelease }).catch((err) => {
        console.warn('Failed to release hold:', err);
      });

      // 2. Clear client hold & seats
      clearHold();

      // 3. Dispatch release notification for active flight pages
      window.dispatchEvent(new CustomEvent('skyhaven:seats-released'));

      // 4. Navigate back to the flight details page
      if (flightId) {
        navigate(`/flights/${flightId}`);
      } else {
        navigate('/search');
      }
    } finally {
      setIsReleasing(false);
      setIsReleaseModalOpen(false);
    }
  };

  const handleConfirmPayment = async ({ paymentIntentId }: { paymentIntentId: string }) => {
    if (!selectedFlight) return;
    setIsProcessing(true);
    setError(null);

    try {
      const outboundPassengers = passengers.map((p) => ({
        name: p.name,
        email: p.email,
        documentNumber: p.documentNumber,
        type: p.type,
        seatId: p.seatId,
      }));

      const payload: any = {
        flightId: selectedFlight.id,
        passengers: outboundPassengers,
        payment: { paymentIntentId },
      };

      if (returnFlight && returnSeats.length > 0) {
        payload.returnFlightId = returnFlight.id;
        payload.returnPassengers = passengers.map((p, idx) => ({
          name: p.name,
          email: p.email,
          documentNumber: p.documentNumber,
          type: p.type,
          seatId: returnSeats[idx] ? returnSeats[idx].id : returnSeats[0].id,
        }));
      }

      const res = await api.createBooking(payload);

      if (res.success && res.data) {
        bookingConfirmedRef.current = true;
        setLastConfirmedBooking(res.data);
        setIsPaymentModalOpen(false);
        navigate('/confirmation');
      }
    } catch (err: any) {
      setError(err.message || 'Payment or reservation transaction failed');
      setIsPaymentModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedFlight) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate(`/flights/${selectedFlight.id}`)}
          className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#05203C] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Passenger Details & Checkout
          </h1>
          <p className="text-xs text-slate-500">
            Enter traveler credentials and proceed to secure checkout.
          </p>
        </div>
      </div>

      {secondsLeft > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-700 dark:text-amber-400 text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 animate-pulse text-amber-500 shrink-0" />
            <span>
              Seats locked for you: <strong className="font-mono text-sm underline">{formatTimer(secondsLeft)}</strong> remaining before release.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsReleaseModalOpen(true)}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 underline cursor-pointer shrink-0"
          >
            Release Seats
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {!user && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-700 dark:text-blue-300 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6] shrink-0" />
            <span>
              Booking as guest: Fill in your traveler details below. You will be prompted to authenticate when clicking <strong>Proceed to Payment</strong> to secure your e-tickets.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-bold transition-all cursor-pointer shrink-0 text-xs self-start sm:self-auto shadow-xs"
          >
            Sign In Now
          </button>
        </div>
      )}

      <form onSubmit={handleOpenPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <PassengerForm
            selectedSeats={selectedSeats}
            returnSeats={returnSeats}
            passengers={passengers}
            onChange={handlePassengerChange}
          />
        </div>

        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display border-b border-slate-100 dark:border-slate-800 pb-3">
              Itinerary & Price Summary
            </h3>

            {/* Outbound Leg Card */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#02122c] border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  Leg 1: Outbound
                </span>
                <span className="font-mono font-bold text-[#0062E3] dark:text-[#00B2D6]">Non-Stop</span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedFlight.origin.city} ({selectedFlight.origin.code}) ➔ {selectedFlight.destination.city} ({selectedFlight.destination.code})
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {selectedFlight.airline} • {selectedFlight.flightNumber}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedSeats.map((s) => (
                  <span
                    key={`out-${s.id}`}
                    className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 font-mono font-bold text-[10px] text-[#0062E3] dark:text-[#00B2D6]"
                  >
                    Seat {s.seatNumber} ({s.cabinClass.replace('_', ' ')})
                  </span>
                ))}
              </div>
            </div>

            {/* Return Leg Card (if Round-Trip) */}
            {returnFlight && returnSeats.length > 0 && (
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#02122c] border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Leg 2: Return
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">Non-Stop</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {returnFlight.origin.city} ({returnFlight.origin.code}) ➔ {returnFlight.destination.city} ({returnFlight.destination.code})
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {returnFlight.airline} • {returnFlight.flightNumber}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {returnSeats.map((s) => (
                    <span
                      key={`ret-${s.id}`}
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 font-mono font-bold text-[10px] text-indigo-600 dark:text-indigo-400"
                    >
                      Seat {s.seatNumber} ({s.cabinClass.replace('_', ' ')})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Outbound Tickets ({passengers.length}x)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  ₹{Math.round(outboundTotal).toLocaleString('en-IN')}
                </span>
              </div>

              {returnFlight && returnSeats.length > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Return Tickets ({passengers.length}x)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{Math.round(returnTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Baggage Allowance</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Free Included</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes & GST</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">₹0 (Included)</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-3xl font-black font-mono text-[#0062E3] dark:text-[#00B2D6]">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-black text-sm tracking-wide shadow-sky-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        totalAmount={totalAmount}
        clientSecret={clientSecret}
        holdExpiresAt={holdExpiresAt}
        onHoldExpired={handleHoldExpired}
        onConfirmPayment={handleConfirmPayment}
        isLoading={isProcessing}
      />

      <ReleaseSeatsModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        onConfirmRelease={handleConfirmRelease}
        flight={selectedFlight}
        seats={selectedSeats}
        secondsLeft={secondsLeft}
        isProcessing={isReleasing}
      />

      <CheckoutAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultEmail={passengers[0]?.email || ''}
        defaultName={passengers[0]?.name || ''}
      />
    </div>
  );
};