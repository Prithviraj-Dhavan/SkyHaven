import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams as useUrlParams } from 'react-router-dom';
import { 
  Plane, 
  Sparkles, 
  Filter, 
  ArrowLeft, 
  RotateCcw, 
  Calendar, 
  Users, 
  Edit3, 
  Bell, 
  ChevronDown, 
  ChevronUp,
  Search,
  Check,
  Compass,
  Globe,
  ArrowRight
} from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { api } from '../services/api';
import { Flight } from '../types';
import { FlightCard } from '../components/flights/FlightCard';
import { FlightFilters } from '../components/flights/FlightFilters';
import { FlightSortBar } from '../components/flights/FlightSortBar';
import { FlightSkeleton } from '../components/flights/FlightSkeleton';
import { Button } from '../components/ui/Button';

export const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [urlParams] = useUrlParams();
  const {
    searchParams,
    setSearchParams,
    selectedFlight,
    setSelectedFlight,
    returnFlight,
    setReturnFlight,
    setAiDrawerOpen,
  } = useBookingStore();
  
  const isRoundTrip = searchParams.tripType === 'round-trip' && Boolean(searchParams.destination);
  const [legStep, setLegStep] = useState<'outbound' | 'return'>('outbound');

  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isEditSearchOpen, setIsEditSearchOpen] = useState(false);
  
  const isEverywhere = urlParams.get('mode') === 'everywhere' || !searchParams.destination;

  // Local edit search state
  const [editOrigin, setEditOrigin] = useState(searchParams.origin || 'DEL');
  const [editDest, setEditDest] = useState(searchParams.destination || '');
  const [editDate, setEditDate] = useState(searchParams.departureDate || '');
  const [editReturnDate, setEditReturnDate] = useState(searchParams.returnDate || '');
  const [editPax, setEditPax] = useState(searchParams.passengers || 1);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const activeOrigin = isRoundTrip && legStep === 'return'
      ? (searchParams.destination || '')
      : (searchParams.origin || 'DEL');

    const activeDest = isRoundTrip && legStep === 'return'
      ? (searchParams.origin || 'DEL')
      : (searchParams.destination || '');

    const activeDate = isRoundTrip && legStep === 'return'
      ? (searchParams.returnDate || searchParams.departureDate || '')
      : (searchParams.departureDate || '');

    const query: Record<string, any> = {};
    if (activeOrigin && activeOrigin.trim() !== '') query.origin = activeOrigin.trim();
    if (activeDest && activeDest.trim() !== '') query.destination = activeDest.trim();
    if (activeDate && activeDate.trim() !== '') query.departureDate = activeDate.trim();
    if (searchParams.passengers) query.passengers = searchParams.passengers;
    if (searchParams.cabinClass) query.cabinClass = searchParams.cabinClass;
    if (searchParams.maxPrice) query.maxPrice = searchParams.maxPrice;
    if (searchParams.airlines) query.airlines = searchParams.airlines;
    if (searchParams.sortBy) query.sortBy = searchParams.sortBy;

    api
      .searchFlights(query)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setFlights(res.data.flights);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to search flights');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    legStep,
    isRoundTrip,
    searchParams.origin,
    searchParams.destination,
    searchParams.departureDate,
    searchParams.returnDate,
    searchParams.passengers,
    searchParams.cabinClass,
    searchParams.maxPrice,
    searchParams.airlines,
    searchParams.sortBy,
    urlParams,
  ]);

  // Real-time reactive filter pipeline across all filter criteria
  const displayedFlights = React.useMemo(() => {
    const filtered = flights.filter((flight) => {
      // 1. Max Budget Filter
      const price = flight.effectivePrice || flight.basePrice;
      if (searchParams.maxPrice && price > searchParams.maxPrice) {
        return false;
      }

      // 2. Airlines Filter
      if (searchParams.airlines) {
        const selectedAirlines = searchParams.airlines.split(',').map((a) => a.trim().toLowerCase());
        const flightAirline = flight.airline.toLowerCase();
        const matchesAirline = selectedAirlines.some(
          (a) => flightAirline.includes(a) || a.includes(flightAirline)
        );
        if (!matchesAirline) return false;
      }

      // 3. Stops Filter
      if (searchParams.stops && searchParams.stops !== 'none') {
        const allowedStops = searchParams.stops.split(',');
        const duration = flight.durationMinutes || 120;
        let flightStopType = 'direct';
        if (duration > 360) flightStopType = '2plus';
        else if (duration > 180) flightStopType = '1stop';

        if (!allowedStops.includes(flightStopType)) return false;
      }

      // 4. Departure Time of Day Filter
      if (searchParams.timeOfDay) {
        const allowedTimes = searchParams.timeOfDay.split(',');
        const depHour = new Date(flight.departureTime).getHours();
        let slot = 'morning';
        if (depHour >= 12 && depHour < 18) slot = 'afternoon';
        else if (depHour >= 18) slot = 'evening';

        if (!allowedTimes.includes(slot)) return false;
      }

      return true;
    });

    // In-memory reactive sort according to searchParams.sortBy
    const sorted = [...filtered];
    if (searchParams.sortBy === 'price_asc') {
      sorted.sort((a, b) => (Number(a.effectivePrice || a.basePrice)) - (Number(b.effectivePrice || b.basePrice)));
    } else if (searchParams.sortBy === 'price_desc') {
      sorted.sort((a, b) => (Number(b.effectivePrice || b.basePrice)) - (Number(a.effectivePrice || a.basePrice)));
    } else if (searchParams.sortBy === 'duration_asc') {
      sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (searchParams.sortBy === 'departure_asc') {
      sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    } else {
      // 'best' - composite of price and duration
      sorted.sort((a, b) => {
        const scoreA = Number(a.effectivePrice || a.basePrice) * 0.6 + a.durationMinutes * 30;
        const scoreB = Number(b.effectivePrice || b.basePrice) * 0.6 + b.durationMinutes * 30;
        return scoreA - scoreB;
      });
    }

    return sorted;
  }, [flights, searchParams.maxPrice, searchParams.airlines, searchParams.stops, searchParams.timeOfDay, searchParams.sortBy]);

  const handleSelectFlight = (flight: Flight) => {
    if (isRoundTrip && legStep === 'outbound') {
      setSelectedFlight(flight);
      setLegStep('return');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isRoundTrip && legStep === 'return') {
      setReturnFlight(flight);
      const outboundId = selectedFlight ? selectedFlight.id : flight.id;
      navigate(`/flights/${outboundId}`);
      return;
    }

    setSelectedFlight(flight);
    navigate(`/flights/${flight.id}`);
  };

  const handleApplyEditSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      origin: editOrigin,
      destination: editDest,
      departureDate: editDate,
      returnDate: editReturnDate,
      passengers: editPax,
    });
    setIsEditSearchOpen(false);
  };

  const activeOriginDisplay = isRoundTrip && legStep === 'return'
    ? (searchParams.destination || 'BOM')
    : (searchParams.origin || 'DEL');

  const activeDestDisplay = isRoundTrip && legStep === 'return'
    ? (searchParams.origin || 'DEL')
    : (searchParams.destination || 'BOM');

  const activeDateDisplay = isRoundTrip && legStep === 'return'
    ? (searchParams.returnDate || searchParams.departureDate)
    : searchParams.departureDate;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      
      {/* Top Route Summary & Quick Edit Bar */}
      <div className="bg-white dark:bg-[#05203C] text-slate-900 dark:text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors cursor-pointer shrink-0"
              title="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                {isEverywhere ? (
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#0062E3] dark:text-[#00B2D6] animate-spin" style={{ animationDuration: '10s' }} />
                    <span className="text-lg sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                      Explore Everywhere from {searchParams.origin || 'DEL'}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                    {activeOriginDisplay} ➔ {activeDestDisplay}
                  </span>
                )}
                
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#0062E3] dark:text-[#00B2D6]">
                  {displayedFlights.length} flights
                </span>

                {isRoundTrip && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300">
                    {legStep === 'outbound' ? 'Leg 1 of 2: Outbound' : 'Leg 2 of 2: Return'}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 font-medium">
                <span>
                  {activeDateDisplay
                    ? new Date(activeDateDisplay).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Flexible / Any date'}
                </span>
                <span>•</span>
                <span>
                  {searchParams.passengers || 1} Adult, {searchParams.cabinClass || 'Economy'}
                </span>
                {isEverywhere ? (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Showing Lowest Fares to All Destinations</span>
                  </>
                ) : (
                  <>
                    <span>•</span>
                    <span className="text-[#0062E3] dark:text-[#00B2D6] font-bold">Direct Flight Schedule</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditSearchOpen(!isEditSearchOpen)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15 text-xs font-bold transition-all cursor-pointer font-display"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#0062E3] dark:text-[#00B2D6]" />
              <span>{isEditSearchOpen ? 'Close Search' : 'Change Search'}</span>
              {isEditSearchOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
          </div>
        </div>

        {/* Inline Quick Search Editor Drawer */}
        {isEditSearchOpen && (
          <form
            onSubmit={handleApplyEditSearch}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-5 gap-3 animate-in fade-in duration-150"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                From
              </label>
              <input
                type="text"
                value={editOrigin}
                onChange={(e) => setEditOrigin(e.target.value.toUpperCase())}
                placeholder="DEL"
                className="w-full bg-slate-50 dark:bg-[#071628] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0062E3]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                To
              </label>
              <input
                type="text"
                value={editDest}
                onChange={(e) => setEditDest(e.target.value.toUpperCase())}
                placeholder="GOI or leave empty for Everywhere"
                className="w-full bg-slate-50 dark:bg-[#071628] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0062E3]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Depart
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#071628] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0062E3]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Passengers
              </label>
              <select
                value={editPax}
                onChange={(e) => setEditPax(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#071628] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0062E3]"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Adult' : 'Adults'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0062E3] hover:bg-[#0051c7] text-white text-xs font-bold transition-colors cursor-pointer font-display"
              >
                Update Results
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Round-Trip Leg Progress Banner */}
      {isRoundTrip && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[#0062E3] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setLegStep('outbound')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  legStep === 'outbound'
                    ? 'bg-white text-blue-700 shadow-md ring-2 ring-white/60'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-black">1</span>
                <span>1. Outbound ({searchParams.origin || 'DEL'} ➔ {searchParams.destination || 'BOM'})</span>
                {selectedFlight && <Check className="w-3.5 h-3.5 text-emerald-300" />}
              </button>

              <ArrowRight className="w-4 h-4 text-white/50 shrink-0" />

              <button
                type="button"
                onClick={() => {
                  if (selectedFlight) setLegStep('return');
                }}
                disabled={!selectedFlight}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  !selectedFlight
                    ? 'opacity-60 cursor-not-allowed bg-white/10 text-white/60'
                    : legStep === 'return'
                    ? 'bg-white text-blue-700 shadow-md ring-2 ring-white/60 cursor-pointer'
                    : 'bg-white/15 hover:bg-white/25 text-white cursor-pointer'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-black">2</span>
                <span>2. Return ({searchParams.destination || 'BOM'} ➔ {searchParams.origin || 'DEL'})</span>
                {returnFlight && <Check className="w-3.5 h-3.5 text-emerald-300" />}
              </button>
            </div>

            <div className="text-xs font-medium text-blue-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{legStep === 'outbound' ? 'Select outbound flight first' : 'Now choose your return flight'}</span>
            </div>
          </div>

          {/* Outbound Selected Summary Pill */}
          {selectedFlight && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-black/20 backdrop-blur-xs border border-white/15 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-blue-200">Selected Outbound:</span>
                <span className="font-bold text-white">
                  {selectedFlight.origin.code} ➔ {selectedFlight.destination.code} • {selectedFlight.airline} ({selectedFlight.flightNumber})
                </span>
                <span className="font-mono text-emerald-300 font-bold">
                  ₹{selectedFlight.basePrice.toLocaleString('en-IN')}
                </span>
              </div>
              {legStep === 'return' && (
                <button
                  type="button"
                  onClick={() => setLegStep('outbound')}
                  className="text-[11px] font-bold text-sky-200 hover:text-white underline cursor-pointer"
                >
                  Change Outbound Flight
                </button>
              )}
            </div>
          )}
        </div>
      )}


      {/* Mobile Filter Trigger Button */}
      <div className="lg:hidden flex items-center justify-between">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white shadow-sm"
        >
          <Filter className="w-4 h-4 text-[#0062E3]" />
          <span>Filters ({displayedFlights.length} flights)</span>
        </button>
      </div>

      {/* Main Results Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Filters Sidebar (3.5 Cols) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <FlightFilters />
        </div>

        {/* Right Flight Cards Stream (8.5 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          

          {/* Clean Streamlined Sort & Results Bar */}
          <FlightSortBar totalCount={displayedFlights.length} />

          {/* Results Stream */}
          {isLoading ? (
            <div className="space-y-4">
              <FlightSkeleton />
              <FlightSkeleton />
              <FlightSkeleton />
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
              <p className="text-rose-500 font-semibold">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : displayedFlights.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                No matching flights found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your filters, resetting the price slider, or choosing different airlines/stops.
              </p>
              <Button
                onClick={() =>
                  setSearchParams({
                    maxPrice: undefined,
                    airlines: undefined,
                    stops: undefined,
                    timeOfDay: undefined,
                  })
                }
                variant="outline"
                size="sm"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={handleSelectFlight}
                  selectLabel={
                    isRoundTrip
                      ? (legStep === 'outbound' ? 'Select Outbound' : 'Select Return')
                      : 'Select'
                  }
                  isSelected={
                    legStep === 'outbound'
                      ? selectedFlight?.id === flight.id
                      : returnFlight?.id === flight.id
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-full max-w-xs bg-white dark:bg-[#05203C] h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Filter Flights</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-xs font-bold text-slate-500"
              >
                Done
              </button>
            </div>
            <FlightFilters />
          </div>
        </div>
      )}
    </div>
  );
};
