import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Plane, Armchair, CreditCard, Sparkles, QrCode, ArrowRight } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Passenger, PassengerType, FlightSeat } from '../types';
import { PassengerForm } from '../components/booking/PassengerForm';
import { PaymentModal } from '../components/booking/PaymentModal';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedFlight, selectedSeats, setLastConfirmedBooking } = useBookingStore();

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFlight || selectedSeats.length === 0) {
      navigate('/search');
      return;
    }

    // Initialize passenger forms with smart defaults if empty
    const initialPassengers: Passenger[] = selectedSeats.map((seat: FlightSeat, idx: number) => ({
      name: idx === 0 ? (user?.name || 'Prithviraj Sharma') : `Traveler ${idx + 1}`,
      email: idx === 0 ? (user?.email || 'prithviraj@example.com') : `traveler${idx + 1}@example.com`,
      documentNumber: idx === 0 ? 'P89412750' : `P${Math.floor(10000000 + Math.random() * 90000000)}`,
      type: 'ADULT' as PassengerType,
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      cabinClass: seat.cabinClass,
      price: Number(selectedFlight.basePrice) + Number(seat.priceModifier),
    }));

    setPassengers(initialPassengers);
  }, [selectedFlight, selectedSeats, user, navigate]);

  const handlePassengerChange = (index: number, updated: Partial<Passenger>) => {
    setPassengers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
  };

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim() || !p.email.trim() || !p.documentNumber.trim()) {
        setError(`Please complete all fields for Passenger ${i + 1}.`);
        return;
      }
    }

    setError(null);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (paymentDetails: any) => {
    if (!selectedFlight) return;
    setIsProcessing(true);
    setError(null);

    try {
      const payload = {
        flightId: selectedFlight.id,
        passengers: passengers.map((p) => ({
          name: p.name,
          email: p.email,
          documentNumber: p.documentNumber,
          type: p.type,
          seatId: p.seatId,
        })),
        payment: paymentDetails,
      };

      const res = await api.createBooking(payload);

      if (res.success && res.data) {
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

  const totalAmount = passengers.reduce((sum, p) => sum + (p.price || Number(selectedFlight.basePrice)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/flights/${selectedFlight.id}`)}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#05203C] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Passenger Details & Checkout
          </h1>
          <p className="text-xs text-slate-500">
            Enter traveler credentials and proceed to secure UPI QR / Card checkout.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleOpenPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Passenger Forms (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <PassengerForm
            selectedSeats={selectedSeats}
            passengers={passengers}
            onChange={handlePassengerChange}
          />
        </div>

        {/* Right Column: Order Summary & Checkout Trigger (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display border-b border-slate-100 dark:border-slate-800 pb-3">
              Itinerary & Price Summary
            </h3>

            {/* Flight Mini Route */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#02122c] border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {selectedFlight.origin.city} ➔ {selectedFlight.destination.city}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {selectedFlight.flightNumber} • {selectedFlight.airline}
                </div>
              </div>
              <div className="text-right font-mono font-bold text-[#0062E3] dark:text-[#00B2D6]">
                Non-Stop
              </div>
            </div>

            {/* Reserved Seats List */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Assigned Seats ({selectedSeats.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 font-mono font-bold text-xs text-[#0062E3] dark:text-[#00B2D6]"
                  >
                    Seat {s.seatNumber} ({s.cabinClass.replace('_', ' ')})
                  </span>
                ))}
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Flight Tickets ({passengers.length}x)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
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
                  ₹{Math.round(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-black text-sm tracking-wide shadow-sky-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>Proceed to UPI QR / Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Dynamic UPI QR Code Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalAmount}
        onConfirmPayment={handleConfirmPayment}
        isLoading={isProcessing}
      />
    </div>
  );
};
