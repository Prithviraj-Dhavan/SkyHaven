import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Sparkles } from 'lucide-react';

export const TravelFaq: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does SkyHaven find the cheapest flight deals?',
      a: 'SkyHaven scans and indexes live airline inventory across multiple Global Distribution Systems (GDS) and low-cost carriers simultaneously. Our intelligent pricing matrix calculates dynamic fare adjustments, seat tier discounts, and flash sales in real time, so you always get the lowest guaranteed fare with no hidden booking fees.',
    },
    {
      q: 'What is the "Explore Everywhere" search feature?',
      a: 'If you want to travel but haven’t decided on a specific destination, simply enter your departure city and choose "Everywhere". SkyHaven will automatically rank all available flights worldwide from cheapest to highest, helping you discover unforgettable weekend escapes and international adventures on your budget.',
    },
    {
      q: 'Can I set up Price Alerts for flights?',
      a: 'Yes! Click on the "Price Alerts" button or the bell icon on any flight card to track route price fluctuations. As soon as airline ticket prices drop or promotional seats open up, you will receive an instant notification.',
    },
    {
      q: 'How do seat reservations and instant confirmation work?',
      a: 'Unlike standard aggregator platforms that redirect you to third parties, SkyHaven uses an atomic in-process database transaction. When you select an exact seat on our interactive 3D aircraft cabin map and complete checkout, the seat is locked instantly and your verified digital boarding pass is generated immediately.',
    },
    {
      q: 'How do I use natural language AI search?',
      a: 'Click "Ask AI" in the header or press ⌘K (Ctrl+K). You can type queries like "Cheapest flight from Delhi to Goa next weekend under ₹5,000" or "Business class to London with WiFi". Our neural parser extracts your travel intent and configures the exact search filters in milliseconds.',
    },
  ];

  return (
    <section className="relative">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-[#0062E3] dark:text-[#00B2D6] text-xs font-bold font-mono">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
          Smart Travel Made Simple
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Everything you need to know about searching, comparing, and booking flights with SkyHaven.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#0062E3] dark:hover:text-[#00B2D6] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6] shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
