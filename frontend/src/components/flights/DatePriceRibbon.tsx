import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingDown } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

interface DatePriceRibbonProps {
  currentDate?: string;
  onSelectDate: (dateStr: string) => void;
  baseFare?: number;
}

export const DatePriceRibbon: React.FC<DatePriceRibbonProps> = ({
  currentDate,
  onSelectDate,
  baseFare = 4500,
}) => {
  const selectedDate = currentDate ? new Date(currentDate) : new Date();

  // Generate 7 days around the selected date (-3 to +3 days)
  const days = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);

    // Calculate a simulated real-world dynamic price curve
    // Offset variation gives realistic airline pricing curve
    const multiplier = 1 + Math.sin(d.getDate() * 1.5) * 0.18 + (offset === 0 ? 0 : 0.05);
    const price = Math.round((baseFare * multiplier) / 50) * 50;

    return {
      date: d,
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      price,
      isCurrent: offset === 0,
    };
  });

  // Find the cheapest date in the range
  const minPrice = Math.min(...days.map((d) => d.price));

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onSelectDate(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onSelectDate(next.toISOString().split('T')[0]);
  };

  return (
    <div className="w-full bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-3 mb-6">
      <div className="flex items-center justify-between gap-2">
        {/* Prev Arrow */}
        <button
          type="button"
          onClick={handlePrevDay}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Days Scrollable Track */}
        <div className="flex-1 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-1">
          {days.map((item) => {
            const isLowest = item.price === minPrice;
            const isSelected = item.isCurrent;

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => onSelectDate(item.dateStr)}
                className={`flex-1 min-w-[100px] sm:min-w-[120px] p-2.5 rounded-xl text-center transition-all cursor-pointer relative border ${
                  isSelected
                    ? 'bg-[#0062E3] text-white border-[#0062E3] shadow-md shadow-blue-500/20'
                    : isLowest
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-[#0062E3] text-slate-700 dark:text-slate-300'
                }`}
              >
                {/* Lowest Price Flag */}
                {isLowest && !isSelected && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded-full bg-emerald-500 text-white shadow-xs">
                    Cheapest
                  </span>
                )}

                <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {item.dayName}, {item.formattedDate}
                </div>

                <div className={`text-xs sm:text-sm font-mono font-black mt-0.5 ${
                  isSelected ? 'text-white' : isLowest ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}>
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={handleNextDay}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
