import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft, Clock, ShieldCheck, Check, ArrowRight, Armchair, Info, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useBookingStore } from '../store/bookingStore';
import { Flight, FlightSeat } from '../types';
import { SeatMap } from '../components/booking/SeatMap';
import { Button } from '../components/ui/Button';
import { useCountdown } from '../hooks';

export const FlightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    searchParams,
    selectedSeats,
    returnSeats,
    toggleSeat,
    toggleReturnSeat,
    selectedFlight,
    returnFlight,
    setSelectedFlight,
    setReturnFlight,
    activeLeg,
    setActiveLeg,
    holdExpiresAt,
    setHoldExpiresAt,
  } = useBookingStore();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [returnFlightData, setReturnFlightData] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlight = useCallback((silent = false) => {
    if (!id) return;
    if (!silent) setIsLoading(true);

    const promises: Promise<any>[] = [api.getFlightById(id)];
    if (returnFlight?.id && returnFlight.id !== id) {
      promises.push(api.getFlightById(returnFlight.id));
    }

    Promise.all(promises)
      .then(([resOutbound, resReturn]) => {
        if (resOutbound?.success && resOutbound.data) {
          setFlight(resOutbound.data);
          setSelectedFlight(resOutbound.data);
        }
        if (resReturn?.success && resReturn.data) {
          setReturnFlightData(resReturn.data);
          setReturnFlight(resReturn.data);
        }
      })
      .catch((err: any) => {
        if (!silent) setError(err.message || 'Failed to load flight details');
      })
      .finally(() => {
        if (!silent) setIsLoading(false);
      });
  }, [id, returnFlight?.id, setSelectedFlight, setReturnFlight]);

  const handleHoldExpired = async () => {
    setHoldExpiresAt(null);
    const allSeatIds = [
      ...selectedSeats.map((s) => s.id),
      ...returnSeats.map((s) => s.id),
    ];
    if (allSeatIds.length > 0) {
      await api.releaseHold({ seatIds: allSeatIds }).catch(() => {});
    }
    fetchFlight(true);
  };

  const secondsLeft = useCountdown(holdExpiresAt, Boolean(holdExpiresAt), handleHoldExpired);

  useEffect(() => {
    fetchFlight(false);

    const interval = setInterval(() => {
      fetchFlight(true);
    }, 5000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFlight(true);
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, [fetchFlight]);

  const maxPassengers = searchParams.passengers || 1;

  const currentReturnFlight = returnFlightData || returnFlight;
  const isRoundTrip = Boolean(currentReturnFlight);

  const currentFlight = (activeLeg === 'return' && currentReturnFlight) ? currentReturnFlight : flight;
  const currentSeats = activeLeg === 'return' ? returnSeats : selectedSeats;
  const currentToggleSeat = activeLeg === 'return' ? toggleReturnSeat : toggleSeat;

  const calculateOutboundTotal = () => {
    if (!flight) return 0;
    const base = Number(flight.basePrice);
    const modifiers = selectedSeats.reduce((acc: number, s: FlightSeat) => acc + Number(s.priceModifier), 0);
    const selectedCount = selectedSeats.length;
    const remainingCount = Math.max(0, maxPassengers - selectedCount);
    return (base * selectedCount + modifiers) + (base * remainingCount);
  };

  const calculateReturnTotal = () => {
    if (!currentReturnFlight) return 0;
    const base = Number(currentReturnFlight.basePrice);
    const modifiers = returnSeats.reduce((acc: number, s: FlightSeat) => acc + Number(s.priceModifier), 0);
    const selectedCount = returnSeats.length;
    const remainingCount = Math.max(0, maxPassengers - selectedCount);
    return (base * selectedCount + modifiers) + (base * remainingCount);
  };

  const calculateCombinedTotal = () => {
    return calculateOutboundTotal() + (isRoundTrip ? calculateReturnTotal() : 0);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      setError(`Please select at least 1 outbound seat before proceeding.`);
      setActiveLeg('outbound');
      return;
    }

    if (isRoundTrip && returnSeats.length === 0) {
      setActiveLeg('return');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const allSeatIds = [
      ...selectedSeats.map((s) => s.id),
      ...(isRoundTrip ? returnSeats.map((s) => s.id) : []),
    ];

    api.holdSeats({ seatIds: allSeatIds })
      .then((res) => {
        if (res.success && res.data?.expiresAt) {
          setHoldExpiresAt(res.data.expiresAt);
        }
      })
      .catch((err) => {
        console.warn('Seat lock initiation:', err);
      });

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

  const activeFlightToShow = currentFlight || flight;
  const depTime = new Date(activeFlightToShow.departureTime);
  const arrTime = new Date(activeFlightToShow.arrivalTime);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">

      {/* Round-Trip Leg Switcher Tabs */}
      {isRoundTrip && currentReturnFlight && (
        <div className="bg-white dark:bg-[#05203C] p-2 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveLeg('outbound')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeLeg === 'outbound'
                  ? 'bg-[#0062E3] text-white shadow-sky-lg scale-[1.01]'
                  : 'bg-slate-50 dark:bg-[#02122c] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${activeLeg === 'outbound' ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-[#0062E3]'}`}>
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold opacity-80">
                    Step 1: Outbound Leg
                  </div>
                  <div className="font-extrabold font-display text-sm sm:text-base">
                    {flight.origin.code} ➔ {flight.destination.code}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {flight.airline} • {flight.flightNumber}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  selectedSeats.length > 0
                    ? (activeLeg === 'outbound' ? 'bg-white text-blue-700' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400')
                    : (activeLeg === 'outbound' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500')
                }`}>
                  {selectedSeats.length > 0 ? `${selectedSeats.map(s => s.seatNumber).join(', ')}` : 'Pick Seat'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeg('return')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                activeLeg === 'return'
                  ? 'bg-[#0062E3] text-white shadow-sky-lg scale-[1.01]'
                  : 'bg-slate-50 dark:bg-[#02122c] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${activeLeg === 'return' ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-[#0062E3]'}`}>
                  <Plane className="w-5 h-5 rotate-180" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold opacity-80">
                    Step 2: Return Leg
                  </div>
                  <div className="font-extrabold font-display text-sm sm:text-base">
                    {currentReturnFlight.origin.code} ➔ {currentReturnFlight.destination.code}
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {currentReturnFlight.airline} • {currentReturnFlight.flightNumber}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  returnSeats.length > 0
                    ? (activeLeg === 'return' ? 'bg-white text-blue-700' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400')
                    : (activeLeg === 'return' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500')
                }`}>
                  {returnSeats.length > 0 ? `${returnSeats.map(s => s.seatNumber).join(', ')}` : 'Pick Seat'}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Top Route Overview Card */}
      <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#05203C] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/search')}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="text-xl sm:text-3xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                  {activeFlightToShow.origin.code} ➔ {activeFlightToShow.destination.code}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0062E3] text-white shadow-xs">
                  {activeFlightToShow.flightNumber}
                </span>
                {isRoundTrip && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300">
                    {activeLeg === 'outbound' ? 'Viewing Outbound Flight' : 'Viewing Return Flight'}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>{activeFlightToShow.airline}</span>
                <span>•</span>
                <span>{activeFlightToShow.aircraftType || 'Airbus A320neo'}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Non-Stop</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Departure</span>
              <div className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white">
                {depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {depTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="w-[1px] h-10 bg-slate-200 dark:bg-white/15" />

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Arrival</span>
              <div className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white">
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
            seats={activeFlightToShow.seats || []}
            selectedSeats={currentSeats}
            onToggleSeat={(seat: FlightSeat) => currentToggleSeat(seat, maxPassengers)}
            maxPassengers={maxPassengers}
            onContinue={handleProceedToCheckout}
          />
        </div>

        {/* Floating Fare & Selection Summary Sidebar (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-5 sm:space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Seat Reservation Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRoundTrip ? (
                  <span>
                    Outbound: <strong>{selectedSeats.length}/{maxPassengers}</strong> • Return: <strong>{returnSeats.length}/{maxPassengers}</strong>
                  </span>
                ) : (
                  <span>
                    Selecting <strong>{selectedSeats.length}</strong> of <strong>{maxPassengers}</strong> passenger seat(s)
                  </span>
                )}
              </p>
            </div>

            {/* Outbound Selected Seats List */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>1. Outbound Seats ({flight.origin.code} ➔ {flight.destination.code})</span>
                {isRoundTrip && (
                  <button
                    type="button"
                    onClick={() => setActiveLeg('outbound')}
                    className="text-[11px] font-bold text-[#0062E3] dark:text-[#00B2D6] hover:underline cursor-pointer lowercase"
                  >
                    edit
                  </button>
                )}
              </div>

              {selectedSeats.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#02122c]/60 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <Armchair className="w-5 h-5 mx-auto text-slate-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No outbound seat selected</p>
                </div>
              ) : (
                selectedSeats.map((s: FlightSeat, idx: number) => (
                  <div
                    key={`out-${s.id}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#02122c]/80 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0062E3] text-white flex items-center justify-center font-black font-mono text-xs shadow-xs">
                        {s.seatNumber}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Traveler {idx + 1}
                        </div>
                        <div className="text-[10px] text-slate-500 capitalize">
                          {s.cabinClass.toLowerCase().replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-slate-900 dark:text-white text-xs">
                      ₹{(Number(flight.basePrice) + Number(s.priceModifier)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Return Selected Seats List (if Round-Trip) */}
            {isRoundTrip && currentReturnFlight && (
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>2. Return Seats ({currentReturnFlight.origin.code} ➔ {currentReturnFlight.destination.code})</span>
                  <button
                    type="button"
                    onClick={() => setActiveLeg('return')}
                    className="text-[11px] font-bold text-[#0062E3] dark:text-[#00B2D6] hover:underline cursor-pointer lowercase"
                  >
                    edit
                  </button>
                </div>

                {returnSeats.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#02122c]/60 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <Armchair className="w-5 h-5 mx-auto text-slate-400" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No return seat selected</p>
                    <button
                      type="button"
                      onClick={() => setActiveLeg('return')}
                      className="text-[11px] text-[#0062E3] font-bold hover:underline cursor-pointer"
                    >
                      Select Return Seat ➔
                    </button>
                  </div>
                ) : (
                  returnSeats.map((s: FlightSeat, idx: number) => (
                    <div
                      key={`ret-${s.id}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#02122c]/80 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black font-mono text-xs shadow-xs">
                          {s.seatNumber}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            Traveler {idx + 1}
                          </div>
                          <div className="text-[10px] text-slate-500 capitalize">
                            {s.cabinClass.toLowerCase().replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-slate-900 dark:text-white text-xs">
                        ₹{(Number(currentReturnFlight.basePrice) + Number(s.priceModifier)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Outbound Flight Fare ({maxPassengers}x)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  ₹{Math.round(calculateOutboundTotal()).toLocaleString('en-IN')}
                </span>
              </div>

              {isRoundTrip && currentReturnFlight && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Return Flight Fare ({maxPassengers}x)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    ₹{Math.round(calculateReturnTotal()).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes & Carrier Fees</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">₹0 (Included)</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-3xl font-black font-mono text-[#0062E3] dark:text-[#00B2D6]">
                  ₹{Math.round(calculateCombinedTotal()).toLocaleString('en-IN')}
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
              <span>
                {isRoundTrip && activeLeg === 'outbound' && returnSeats.length === 0
                  ? 'Select Return Flight Seats'
                  : 'Continue to Traveler Details'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
