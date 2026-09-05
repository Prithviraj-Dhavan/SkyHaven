import React from 'react';
import { Search, ShieldCheck, Zap, Sparkles, Award, Lock, Headphones, RefreshCw } from 'lucide-react';

export const TrustSignals: React.FC = () => {
  const features = [
    {
      icon: <Search className="w-6 h-6 text-[#0062E3]" />,
      title: 'Compare 1,000+ Flights in Seconds',
      description: 'Search across major full-service airlines and low-cost carriers in a single unified view.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: 'No Hidden Fees & Transparent Pricing',
      description: 'The fare you see is the fare you pay. Direct GDS pricing with zero unexpected add-ons.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Instant Confirmed Seat Locking',
      description: 'Atomic ACID seat reservations guarantee your exact chosen seat on interactive cabin maps.',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#00B2D6]" />,
      title: 'Neural AI Travel Assistant',
      description: 'Find flights using plain English conversational prompts with instant date and budget parsing.',
    },
  ];

  return (
    <section className="bg-slate-100/70 dark:bg-[#05203C]/60 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">
          Why millions book flights with SkyHaven
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Industry-leading transparency, live airline inventory, and intelligent flight booking.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 transition-all hover:border-[#0062E3] dark:hover:border-[#0062E3]"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center">
              {item.icon}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
              {item.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
