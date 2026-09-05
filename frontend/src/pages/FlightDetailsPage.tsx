import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft, Clock, ShieldCheck, Check, ArrowRight, Armchair, Info, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useBookingStore } from '../store/bookingStore';
import { Flight, FlightSeat } from '../types';
import { SeatMap } from '../components/booking/SeatMap';
import { Button } from '../components/ui/Button';

export const FlightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { searchParams, selectedSeats, toggleSeat, setSelectedFlight } = useBookingStore();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .getFlightById(id)
      .then((res: any) => {
        if (res.success && res.data) {
          setFlight(res.data);
          setSelectedFlight(res.data);
        }
      })
      .catch((err: any) => setError(err.message || 'Failed to load flight details'))
      .finally(() => setIsLoading(false));
  }, [id, setSelectedFlight]);

  const maxPassengers = searchParams.passengers || 1;

  const calculateTotal = () => {
    if (!flight) return 0;
    const base = Number(flight.basePrice);
    const modifiers = selectedSeats.reduce((acc: number, s: FlightSeat) => acc + Number(s.priceModifier), 0);
    const selectedCount = selectedSeats.length;
    const remainingCount = Math.max(0, maxPassengers - selectedCount);
    return (base * selectedCount + modifiers) + (base * remainingCount);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert(`Please select at least 1 seat before proceeding.`);
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#0062E3] border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Rendering 3D cabin layout & live seat map...</p>
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center rounded-3xl bg-white dark:bg-[#05203C] border border-rose-500/20 space-y-4 shadow-xl">
        <p className="text-rose-500 font-semibold">{error || 'Flight not found'}</p>
        <Button onClick={() => navigate('/search')} variant="outline">
          Back to Search
        </Button>
      </div>
    );
  }

  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Route Overview Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#05203C] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/search')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                  {flight.origin.code} ➔ {flight.destination.code}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0062E3] text-white shadow-xs">
                  {flight.flightNumber}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
                <span>{flight.airline}</span>
                <span>•</span>
                <span>{flight.aircraftType || 'Airbus A320neo'}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Non-Stop</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Departure</span>
              <div className="text-xl font-black font-display text-slate-900 dark:text-white">
                {depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {depTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/15" />

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Arrival</span>
              <div className="text-xl font-black font-display text-slate-900 dark:text-white">
                {arrTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {arrTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Seat Map & Checkout Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Visual Seat Map (8 Cols) */}
        <div className="lg:col-span-8 flex justify-center">
          <SeatMap
            seats={flight.seats || []}
            selectedSeats={selectedSeats}
            onToggleSeat={(seat: FlightSeat) => toggleSeat(seat, maxPassengers)}
            maxPassengers={maxPassengers}
            onContinue={handleProceedToCheckout}
          />
        </div>

        {/* Floating Fare & Selection Summary Sidebar (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Seat Reservation Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecting <strong>{selectedSeats.length}</strong> of <strong>{maxPassengers}</strong> passenger seat(s)
              </p>
            </div>

            {/* Selected Seats List */}
            <div className="space-y-2.5">
              {selectedSeats.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#02122c]/60 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <Armchair className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No seat selected yet</p>
                  <p className="text-[11px]">Click any available seat on the aircraft map to lock your reservation</p>
                </div>
              ) : (
                selectedSeats.map((s: FlightSeat, idx: number) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#02122c]/80 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0062E3] text-white flex items-center justify-center font-black font-mono text-sm shadow-xs">
                        {s.seatNumber}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Passenger {idx + 1}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {s.cabinClass.toLowerCase().replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ₹{(Number(flight.basePrice) + Number(s.priceModifier)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Base Flight Fare ({maxPassengers}x)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  ₹{(Number(flight.basePrice) * maxPassengers).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Seat Class Modifiers</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  +₹{selectedSeats.reduce((acc: number, s: FlightSeat) => acc + Number(s.priceModifier), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes & Carrier Fees</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹0 (Included)</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-3xl font-black font-mono text-[#0062E3] dark:text-[#00B2D6]">
                  ₹{Math.round(calculateTotal()).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-sky transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedSeats.length === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#0062E3] hover:bg-[#0051c7] text-white hover:scale-102 active:scale-98 shadow-sky-lg'
              }`}
            >
              <span>Continue to Traveler Details</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
