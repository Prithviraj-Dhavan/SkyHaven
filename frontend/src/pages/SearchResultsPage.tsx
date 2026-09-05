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
  Globe
} from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import { api } from '../services/api';
import { Flight } from '../types';
import { FlightCard } from '../components/flights/FlightCard';
import { FlightFilters } from '../components/flights/FlightFilters';
import { FlightSortBar } from '../components/flights/FlightSortBar';
import { FlightSkeleton } from '../components/flights/FlightSkeleton';
import { DatePriceRibbon } from '../components/flights/DatePriceRibbon';
import { Button } from '../components/ui/Button';

export const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [urlParams] = useUrlParams();
  const { searchParams, setSearchParams, setSelectedFlight, setAiDrawerOpen } = useBookingStore();
  
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
  const [editPax, setEditPax] = useState(searchParams.passengers || 1);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const query: Record<string, any> = {};
    if (searchParams.origin && searchParams.origin.trim() !== '') query.origin = searchParams.origin.trim();
    if (searchParams.destination && searchParams.destination.trim() !== '') query.destination = searchParams.destination.trim();
    if (searchParams.departureDate && searchParams.departureDate.trim() !== '') query.departureDate = searchParams.departureDate.trim();
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
    searchParams.origin,
    searchParams.destination,
    searchParams.departureDate,
    searchParams.passengers,
    searchParams.cabinClass,
    searchParams.maxPrice,
    searchParams.airlines,
    searchParams.sortBy,
    urlParams,
  ]);

  // Real-time reactive filter pipeline across all filter criteria
  const displayedFlights = React.useMemo(() => {
    return flights.filter((flight) => {
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
  }, [flights, searchParams.maxPrice, searchParams.airlines, searchParams.stops, searchParams.timeOfDay]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    navigate(`/flights/${flight.id}`);
  };

  const handleDateChangeFromRibbon = (newDate: string) => {
    setSearchParams({ departureDate: newDate });
  };

  const handleApplyEditSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      origin: editOrigin,
      destination: editDest,
      departureDate: editDate,
      passengers: editPax,
    });
    setIsEditSearchOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      
      {/* Top Route Summary & Quick Edit Bar */}
      <div className="bg-white dark:bg-[#05203C] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors cursor-pointer"
              title="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                {isEverywhere ? (
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#0062E3] dark:text-[#00B2D6] animate-spin" style={{ animationDuration: '10s' }} />
                    <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                      Explore Everywhere from {searchParams.origin || 'DEL'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white">
                    {searchParams.origin || 'DEL'} ➔ {searchParams.destination || 'BOM'}
                  </span>
                )}
                
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#0062E3] dark:text-[#00B2D6]">
                  {displayedFlights.length} flights
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 font-medium">
                <span>
                  {searchParams.departureDate
                    ? new Date(searchParams.departureDate).toLocaleDateString('en-US', {
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15 text-xs font-bold transition-all cursor-pointer font-display"
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

      {/* Flexible 7-Day Date Price Ribbon */}
      <DatePriceRibbon
        currentDate={searchParams.departureDate || new Date().toISOString().split('T')[0]}
        onSelectDate={handleDateChangeFromRibbon}
      />

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
          
          {/* Explore Everywhere Destination Explorer Bar */}
          {isEverywhere && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-[#0062E3]/10 to-indigo-500/10 border border-[#0062E3]/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white font-display">
                  <Compass className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6]" />
                  <span>Popular Destinations from {searchParams.origin || 'DEL'}:</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">Instant Filter</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { city: 'Goa', code: 'GOI', price: '₹3,650' },
                  { city: 'Mumbai', code: 'BOM', price: '₹3,499' },
                  { city: 'Bengaluru', code: 'BLR', price: '₹4,150' },
                  { city: 'Dubai', code: 'DXB', price: '₹18,500' },
                  { city: 'Singapore', code: 'SIN', price: '₹24,500' },
                  { city: 'London', code: 'LHR', price: '₹48,000' },
                  { city: 'New York', code: 'JFK', price: '₹68,000' },
                ].map((dest) => (
                  <button
                    key={dest.code}
                    type="button"
                    onClick={() => {
                      setSearchParams({ destination: dest.code });
                      navigate(`/search?mode=direct&origin=${searchParams.origin || 'DEL'}&dest=${dest.code}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#071d38] border border-slate-200 dark:border-slate-700 hover:border-[#0062E3] text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs hover:scale-105"
                  >
                    <span className="text-slate-900 dark:text-white">{dest.city}</span>
                    <span className="text-[10px] font-mono text-[#0062E3] dark:text-[#00B2D6]">{dest.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3-Pill Comparison Sort Bar */}
          <FlightSortBar flights={displayedFlights} totalCount={displayedFlights.length} />

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
