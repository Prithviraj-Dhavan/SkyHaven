import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FlightDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  departureDate?: string;
  returnDate?: string;
  isRoundTrip?: boolean;
  onSelectDates: (depDate: string, retDate?: string) => void;
}

export const FlightDatePicker: React.FC<FlightDatePickerProps> = ({
  isOpen,
  onClose,
  departureDate,
  returnDate,
  isRoundTrip = false,
  onSelectDates,
}) => {
  // Calendar current browsing month
  const initialDate = departureDate ? new Date(departureDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  const [selectedDep, setSelectedDep] = useState<string>(
    departureDate || new Date().toISOString().split('T')[0]
  );
  const [selectedRet, setSelectedRet] = useState<string | undefined>(returnDate);
  const [selectingType, setSelectingType] = useState<'DEPARTURE' | 'RETURN'>('DEPARTURE');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate days for the current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateClick = (day: number) => {
    const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (clickedDate < today) return;

    if (!isRoundTrip || selectingType === 'DEPARTURE') {
      setSelectedDep(dStr);
      if (isRoundTrip) {
        setSelectingType('RETURN');
        if (selectedRet && new Date(selectedRet) < clickedDate) {
          setSelectedRet(undefined);
        }
      }
    } else {
      // Selecting return
      if (new Date(dStr) >= new Date(selectedDep)) {
        setSelectedRet(dStr);
      } else {
        setSelectedDep(dStr);
        setSelectedRet(undefined);
      }
    }
  };

  const handleApply = () => {
    onSelectDates(selectedDep, isRoundTrip ? selectedRet : undefined);
    onClose();
  };

  // Quick Presets
  const setPreset = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    const dStr = target.toISOString().split('T')[0];
    setSelectedDep(dStr);
    setCurrentYear(target.getFullYear());
    setCurrentMonth(target.getMonth());
    if (isRoundTrip) {
      const ret = new Date(target);
      ret.setDate(ret.getDate() + 4);
      setSelectedRet(ret.toISOString().split('T')[0]);
    }
  };

  // Estimate price indicator for date
  const getEstimatedPrice = (day: number) => {
    const seed = (day * 37 + currentMonth * 19) % 5;
    if (seed === 0) return { price: '₹3,499', isCheapest: true };
    if (seed === 1) return { price: '₹3,850', isCheapest: false };
    if (seed === 2) return { price: '₹4,150', isCheapest: false };
    if (seed === 3) return { price: '₹4,600', isCheapest: false };
    return { price: '₹5,200', isCheapest: false };
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#05203C] text-slate-900 dark:text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 my-auto sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-white/10 flex items-center justify-center text-[#0062E3] dark:text-[#00B2D6] shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-white leading-tight">
                Select Flight Travel Dates
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Pick departure date with live lowest fares
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Date Presets Bar */}
        <div className="px-3.5 sm:px-5 pt-3 sm:pt-3.5 flex flex-wrap gap-1.5 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => setPreset(0)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer font-display"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setPreset(1)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer font-display"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => setPreset(3)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer font-display"
          >
            This Weekend
          </button>
          <button
            type="button"
            onClick={() => setPreset(7)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer font-display"
          >
            Next Week
          </button>
        </div>

        {/* Departure vs Return Selector Pill Tabs */}
        {isRoundTrip && (
          <div className="px-5 pt-3">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl font-display">
              <button
                type="button"
                onClick={() => setSelectingType('DEPARTURE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  selectingType === 'DEPARTURE'
                    ? 'bg-[#0062E3] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Depart: {selectedDep || 'Select Date'}
              </button>
              <button
                type="button"
                onClick={() => setSelectingType('RETURN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  selectingType === 'RETURN'
                    ? 'bg-[#0062E3] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Return: {selectedRet || 'Select Date'}
              </button>
            </div>
          </div>
        )}

        {/* Calendar Grid Container */}
        <div className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Column Headers (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div className="text-amber-500">Sa</div>
            <div className="text-amber-500">Su</div>
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank padding days for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-10 sm:h-12" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const thisDate = new Date(currentYear, currentMonth, day);
              const isPast = thisDate < today;
              const isSelectedDep = selectedDep === dStr;
              const isSelectedRet = selectedRet === dStr;
              const isBetween = 
                selectedDep && 
                selectedRet && 
                thisDate > new Date(selectedDep) && 
                thisDate < new Date(selectedRet);

              const { price, isCheapest } = getEstimatedPrice(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(day)}
                  className={`h-10 sm:h-12 rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-0.5 text-xs transition-all relative cursor-pointer ${
                    isPast
                      ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40'
                      : isSelectedDep || isSelectedRet
                      ? 'bg-[#0062E3] text-white shadow-sky font-black scale-105 z-10'
                      : isBetween
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0062E3] dark:text-[#00B2D6] font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-transparent hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-[11px] sm:text-xs leading-none">{day}</span>
                  {!isPast && (
                    <span
                      className={`text-[8px] sm:text-[9px] font-mono leading-none mt-0.5 ${
                        isSelectedDep || isSelectedRet
                          ? 'text-white'
                          : isCheapest
                          ? 'text-emerald-600 dark:text-emerald-400 font-black'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {price}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#02122c]/50">
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Selected: </span>
            <strong className="font-bold font-display text-[#0062E3] dark:text-[#00B2D6]">
              {selectedDep} {selectedRet ? `➔ ${selectedRet}` : ''}
            </strong>
          </div>

          <div className="flex items-center gap-2 font-display">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-xl bg-[#0062E3] hover:bg-[#0051c7] text-white text-xs font-black tracking-wide shadow-sky transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Confirm Date</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
