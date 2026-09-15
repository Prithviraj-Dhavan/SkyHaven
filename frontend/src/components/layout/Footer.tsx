import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, ShieldCheck, Sparkles, Globe, Heart, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#02122c] text-slate-800 dark:text-white border-t border-slate-200 dark:border-[#0d3a66] mt-16 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Top Section: Brand + Mission */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-white/10">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-[#0062E3]/20 bg-white dark:bg-[#02122c] p-0.5 border border-slate-200 dark:border-white/15 shrink-0 flex items-center justify-center">
                <img
                  src="/images/skyhaven-logo.png"
                  alt="SkyHaven Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-none">
                  Sky<span className="text-[#0062E3] dark:text-[#00B2D6]">Haven</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 font-display mt-0.5">
                  Your Journey Begins Here
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              SkyHaven is a next-generation flight search, seat reservation, and booking platform. Compare flights across hundreds of airlines, discover the lowest prices worldwide, and reserve guaranteed seats in real time.
            </p>
          </div>

          {/* Popular Domestic Sectors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
              Popular Routes
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights Delhi to Goa</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights Mumbai to Goa</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights Bengaluru to Mumbai</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights Delhi to Bengaluru</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights Mumbai to Delhi</Link>
              </li>
            </ul>
          </div>

          {/* International Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
              International Hubs
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights to Dubai (DXB)</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights to London (LHR)</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights to Singapore (SIN)</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights to Tokyo (HND)</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Flights to New York (JFK)</Link>
              </li>
            </ul>
          </div>

          {/* Travel Tools & Exploration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300">
              Travel Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/search" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Explore Everywhere</Link>
              </li>
              <li>
                <span className="hover:text-[#0062E3] dark:hover:text-white transition-colors cursor-pointer">Flight Price Alerts</span>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#0062E3] dark:hover:text-white transition-colors">Partner & Fleet Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>© 2026 SkyHaven Aviation Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="hover:text-[#0062E3] dark:hover:text-white cursor-pointer">Privacy Notice</span>
            <span className="hover:text-[#0062E3] dark:hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#0062E3] dark:hover:text-white cursor-pointer">Cookie Policy</span>
            <span className="hover:text-[#0062E3] dark:hover:text-white cursor-pointer">Security & Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
