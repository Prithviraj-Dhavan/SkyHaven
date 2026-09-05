import React from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Plane, 
  Sun, 
  Sunset, 
  Moon, 
  Check
} from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { CabinClass } from '../../types';

export const FlightFilters: React.FC = () => {
  const { searchParams, setSearchParams } = useBookingStore();

  const selectedStops = searchParams.stops 
    ? searchParams.stops.split(',') 
    : ['direct', '1stop', '2plus'];

  const selectedTimeOfDay = searchParams.timeOfDay 
    ? searchParams.timeOfDay.split(',') 
    : [];

  const airlinesList = [
    { name: 'SkyHaven Express', code: 'SH', fromPrice: 'from ₹3,650' },
    { name: 'SkyLuxe International', code: 'SL', fromPrice: 'from ₹4,800' },
    { name: 'Vayu Jet', code: 'VJ', fromPrice: 'from ₹4,150' },
    { name: 'Apex Global', code: 'AG', fromPrice: 'from ₹5,200' },
    { name: 'Oceanic Air', code: 'OA', fromPrice: 'from ₹4,400' },
    { name: 'StarWings', code: 'SW', fromPrice: 'from ₹3,900' },
  ];

  const handlePriceChange = (val: number) => {
    setSearchParams({ maxPrice: val });
  };

  const handleAirlineToggle = (airline: string) => {
    const current = searchParams.airlines ? searchParams.airlines.split(',') : [];
    let updated: string[];
    if (current.includes(airline)) {
      updated = current.filter((a) => a !== airline);
    } else {
      updated = [...current, airline];
    }
    setSearchParams({ airlines: updated.length > 0 ? updated.join(',') : undefined });
  };

  const toggleStop = (stop: string) => {
    let updated: string[];
    if (selectedStops.includes(stop)) {
      updated = selectedStops.filter((s) => s !== stop);
    } else {
      updated = [...selectedStops, stop];
    }
    setSearchParams({ stops: updated.length > 0 ? updated.join(',') : 'none' });
  };

  const toggleTimeOfDay = (timeKey: string) => {
    let updated: string[];
    if (selectedTimeOfDay.includes(timeKey)) {
      updated = selectedTimeOfDay.filter((t) => t !== timeKey);
    } else {
      updated = [...selectedTimeOfDay, timeKey];
    }
    setSearchParams({ timeOfDay: updated.length > 0 ? updated.join(',') : undefined });
  };

  const handleResetFilters = () => {
    setSearchParams({
      maxPrice: undefined,
      airlines: undefined,
      stops: undefined,
      timeOfDay: undefined,
      cabinClass: 'ECONOMY',
    });
  };

  const selectedAirlines = searchParams.airlines ? searchParams.airlines.split(',') : [];

  return (
    <div className="w-full bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6]" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
            Filter Results
          </h3>
        </div>
        <button
          type="button"
          onClick={handleResetFilters}
          className="text-xs font-semibold text-[#0062E3] dark:text-[#00B2D6] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Stops Filter */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Stops
        </label>
        <div className="space-y-2">
          {[
            { id: 'direct', label: 'Direct only', price: 'from ₹3,650' },
            { id: '1stop', label: '1 Stop', price: 'from ₹4,200' },
            { id: '2plus', label: '2+ Stops', price: 'from ₹6,800' },
          ].map((item) => {
            const isChecked = selectedStops.includes(item.id);
            return (
              <label
                key={item.id}
                onClick={() => toggleStop(item.id)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded text-[#0062E3] accent-[#0062E3] cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  {item.price}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Departure Times (Morning, Afternoon, Evening) */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Departure Times
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'morning', label: 'Morning', sub: '00:00 - 12:00', icon: <Sun className="w-4 h-4 text-amber-500" /> },
            { id: 'afternoon', label: 'Afternoon', sub: '12:00 - 18:00', icon: <Sunset className="w-4 h-4 text-orange-500" /> },
            { id: 'evening', label: 'Evening', sub: '18:00 - 24:00', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
          ].map((timeSlot) => {
            const isActive = selectedTimeOfDay.includes(timeSlot.id);
            return (
              <button
                key={timeSlot.id}
                type="button"
                onClick={() => toggleTimeOfDay(timeSlot.id)}
                className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isActive
                    ? 'border-[#0062E3] bg-blue-50 dark:bg-blue-950/40 text-[#0062E3] dark:text-[#00B2D6] shadow-2xs font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 bg-white dark:bg-[#071d38]'
                }`}
              >
                {timeSlot.icon}
                <div className="text-[11px] font-bold mt-1">{timeSlot.label}</div>
                <div className="text-[9px] text-slate-400 truncate max-w-full">{timeSlot.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Budget Range Slider */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Max Budget
          </label>
          <span className="text-sm font-mono font-bold text-[#0062E3] dark:text-[#00B2D6]">
            {searchParams.maxPrice ? `₹${searchParams.maxPrice.toLocaleString('en-IN')}` : 'Any budget'}
          </span>
        </div>
        <input
          type="range"
          min="2500"
          max="80000"
          step="500"
          value={searchParams.maxPrice || 80000}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full accent-[#0062E3] bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>₹2.5K</span>
          <span>₹40K</span>
          <span>₹80K+</span>
        </div>
      </div>

      {/* 4. Preferred Airlines with Logos & Prices */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Airlines
        </label>
        <div className="space-y-2">
          {airlinesList.map((airline) => {
            const isChecked = selectedAirlines.includes(airline.name);
            return (
              <label
                key={airline.name}
                onClick={() => handleAirlineToggle(airline.name)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded text-[#0062E3] accent-[#0062E3] cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {airline.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {airline.fromPrice}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Cabin Class Filter */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Cabin Class
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ECONOMY', label: 'Economy' },
            { id: 'PREMIUM_ECONOMY', label: 'Premium' },
            { id: 'BUSINESS', label: 'Business' },
            { id: 'FIRST', label: 'First' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSearchParams({ cabinClass: c.id as CabinClass })}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                searchParams.cabinClass === c.id
                  ? 'bg-[#0062E3] text-white border-[#0062E3] shadow-xs font-bold'
                  : 'bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
