import React from 'react';
import { Plane, ArrowUpDown } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

interface FlightSortBarProps {
  totalCount: number;
}

export const FlightSortBar: React.FC<FlightSortBarProps> = ({ totalCount }) => {
  const { searchParams, setSearchParams } = useBookingStore();

  return (
    <div className="bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-xs transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Results Counter */}
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
        <Plane className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6]" />
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-bold">{totalCount}</strong> flights matching your search
        </span>
      </div>

      {/* Clean Sort Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 font-mono">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          Sort by:
        </span>
        <select
          value={searchParams.sortBy || 'best'}
          onChange={(e) => setSearchParams({ sortBy: e.target.value as any })}
          className="bg-slate-50 dark:bg-[#071d38] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0062E3] cursor-pointer"
        >
          <option value="best">Best (Smart Pick)</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="duration_asc">Duration: Fastest First</option>
          <option value="departure_asc">Departure: Earliest First</option>
        </select>
      </div>
    </div>
  );
};
