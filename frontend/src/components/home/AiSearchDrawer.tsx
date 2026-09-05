import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, ArrowRight, CheckCircle2, Bot, CornerDownLeft, X, Compass, Calendar, Users, Plane } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AiParsedQuery } from '../../types';

export const AiSearchDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { isAiDrawerOpen, setAiDrawerOpen, setSearchParams } = useBookingStore();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<AiParsedQuery | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    'Cheapest flight from Mumbai to Delhi next weekend under 5000',
    'Flight to Goa tomorrow for 2 passengers',
    'Business class flight from Delhi to London',
    'Flights from Bengaluru to Mumbai under 4500',
    'Flight from Delhi to Dubai next week under 20000',
  ];

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setError(null);
    setParsedResult(null);

    try {
      const res = await api.parseAiQuery(queryText);
      if (res.success && res.data) {
        setParsedResult(res.data);
      } else {
        throw new Error('Could not parse flight query');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process AI query. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAndSearch = () => {
    if (!parsedResult) return;

    setSearchParams({
      origin: parsedResult.origin || '',
      destination: parsedResult.destination || '',
      departureDate: parsedResult.departureDate || '',
      returnDate: parsedResult.returnDate || '',
      passengers: parsedResult.passengers || 1,
      cabinClass: parsedResult.cabinClass || 'ECONOMY',
      maxPrice: parsedResult.maxPrice,
      tripType: parsedResult.isRoundTrip ? 'round-trip' : 'one-way',
    });

    setAiDrawerOpen(false);
    navigate('/search');
  };

  return (
    <Modal
      isOpen={isAiDrawerOpen}
      onClose={() => setAiDrawerOpen(false)}
      maxWidth="2xl"
      title="SkyHaven AI Flight Search Assistant"
      subtitle="Ask in natural language. Our neural engine parses dates, airport codes, passenger counts, and budget limits in Indian Rupees."
    >
      <div className="space-y-6">
        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery(prompt);
          }}
          className="relative"
        >
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-400 shadow-xl shadow-brand-500/10">
            <div className="relative flex items-center bg-white dark:bg-[#0b1120] rounded-2xl">
              <Sparkles className="w-5 h-5 text-brand-500 ml-4 shrink-0 animate-pulse" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Cheapest flight to Goa next weekend under ₹5,000..."
                className="w-full bg-transparent px-4 py-3.5 text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                disabled={isLoading}
                autoFocus
              />
              <div className="mr-2">
                <Button
                  type="submit"
                  variant="glow"
                  size="sm"
                  isLoading={isLoading}
                  disabled={!prompt.trim()}
                  className="rounded-xl cursor-pointer"
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Analyze
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggested Prompt Chips */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Try these intelligent queries:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(sample);
                  handleQuery(sample);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700/60 hover:border-brand-500/30 transition-all text-left cursor-pointer"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Parsed Result Visualizer */}
        {parsedResult && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-brand-500/30 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Extracted Query Intent</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-bold">
                Structured Schema
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium italic">
              "{parsedResult.explanation}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Plane className="w-3 h-3 text-brand-500" />
                  Route
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 font-mono">
                  {parsedResult.origin || 'Any'} ➔ {parsedResult.destination || 'Any'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  Date
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {parsedResult.departureDate || 'Upcoming'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-500" />
                  Pax & Class
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {parsedResult.passengers} Pax • {parsedResult.cabinClass.replace('_', ' ')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <span className="text-emerald-500 font-bold font-mono">₹</span>
                  Max Budget
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-1 font-mono">
                  {parsedResult.maxPrice ? `₹${Number(parsedResult.maxPrice).toLocaleString('en-IN')}` : 'No limit'}
                </div>
              </div>
            </div>

            <Button
              onClick={handleApplyAndSearch}
              variant="glow"
              size="lg"
              className="w-full cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Apply Intent & Search Flights
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
