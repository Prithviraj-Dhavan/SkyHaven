import React from 'react';
import { Sparkles } from 'lucide-react';
import { HeroSearch } from '../components/home/HeroSearch';
import { PopularDestinations } from '../components/home/PopularDestinations';
import { FlightDeals } from '../components/home/FlightDeals';
import { TouristDestinationsShowcase } from '../components/home/TouristDestinationsShowcase';
import { TravelFaq } from '../components/home/TravelFaq';

export const HomePage: React.FC = () => {
  return (
    <div className="relative overflow-hidden pb-16">
      {/* Top Hero with Scenic Cinematic Aviation Wallpaper flowing under transparent navbar */}
      <div 
        className="relative pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 px-3.5 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all duration-300 shadow-md"
        style={{ backgroundImage: `url('/images/hero-bg.jpg')` }}
      >
        {/* Scenic Gradient Scrim Overlay for high-contrast readability and visible aircraft wallpaper in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-slate-950/75 dark:from-black/40 dark:via-[#02122c]/35 dark:to-[#02122c]/70 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center mb-5 sm:mb-7 space-y-2 relative z-10 px-2 sm:px-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight drop-shadow-md">
            Millions of cheap flights.{' '}
            <span className="text-[#00B2D6]">One simple search.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto leading-relaxed drop-shadow-sm font-medium">
            Search hundreds of airlines and travel sites at once. Compare real-time prices, pick your exact seat, and book with confidence.
          </p>
        </div>

        {/* Elevated Floating Hero Search Widget */}
        <div className="relative z-20">
          <HeroSearch />
        </div>
      </div>

      {/* Main Page Content Sections with Clean Positive Spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 space-y-16 relative z-20">
        <FlightDeals />
        <PopularDestinations />
        <TouristDestinationsShowcase />
        <TravelFaq />
      </div>
    </div>
  );
};
