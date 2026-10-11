import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowUpRight, Compass, Sparkles, Sun, Building, Palmtree, Globe, Tag } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

export const PopularDestinations: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchParams } = useBookingStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Destinations' },
    { id: 'beach', label: 'Beach Getaways' },
    { id: 'weekend', label: 'Weekend Trips' },
    { id: 'international', label: 'International' },
    { id: 'budget', label: 'Budget Friendly' },
  ];

  const destinations = [
    {
      city: 'Goa',
      country: 'India',
      code: 'GOI',
      category: ['beach', 'weekend', 'budget'],
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      price: '₹3,650',
      originalPrice: '₹5,200',
      tag: 'Sun & Beaches',
      direct: true,
    },
    {
      city: 'Dubai',
      country: 'United Arab Emirates',
      code: 'DXB',
      category: ['international'],
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      price: '₹18,500',
      originalPrice: '₹24,000',
      tag: 'Luxury & Shopping',
      direct: true,
    },
    {
      city: 'London',
      country: 'United Kingdom',
      code: 'LHR',
      category: ['international'],
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
      price: '₹48,000',
      originalPrice: '₹62,000',
      tag: 'Culture & Heritage',
      direct: true,
    },
    {
      city: 'Bengaluru',
      country: 'India',
      code: 'BLR',
      category: ['weekend', 'budget'],
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      price: '₹4,150',
      originalPrice: '₹5,800',
      tag: 'Tech & Gardens',
      direct: true,
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      code: 'SIN',
      category: ['international'],
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
      price: '₹24,500',
      originalPrice: '₹32,000',
      tag: 'Modern Metropolis',
      direct: true,
    },
    {
      city: 'Mumbai',
      country: 'India',
      code: 'BOM',
      category: ['weekend', 'budget'],
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      price: '₹3,499',
      originalPrice: '₹4,900',
      tag: 'Coastal City',
      direct: true,
    },
  ];

  const filteredDestinations = destinations.filter(
    (d) => activeCategory === 'all' || d.category.includes(activeCategory)
  );

  const handleSelectDestination = (code: string) => {
    setSearchParams({
      origin: 'DEL',
      destination: code,
      departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      passengers: 1,
      cabinClass: 'ECONOMY',
    });
    navigate('/search');
  };

  return (
    <section className="relative space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Trending Travel Destinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare real-time lowest flight fares to popular holiday and business hubs worldwide.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-2xl bg-slate-100 dark:bg-[#05203C] border border-slate-200 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#0062E3] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((dest, idx) => (
          <div
            key={idx}
            onClick={() => handleSelectDestination(dest.code)}
            className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-slate-200/60 dark:border-slate-800"
          >
            {/* Background Image */}
            <img
              src={dest.image}
              alt={dest.city}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02122c] via-[#02122c]/40 to-transparent" />

            {/* Top Left Category Tag */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-[#02122c]/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                {dest.tag}
              </span>
            </div>

            {/* Top Right Action Icon */}
            <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#0062E3] group-hover:rotate-45 transition-all duration-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>

            {/* Bottom Content Bar */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-display text-white">{dest.city}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#0062E3] text-white shadow-sm">
                    {dest.code}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#00B2D6]" />
                  {dest.country}
                </div>
                {dest.direct && (
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mt-1">
                    ✓ Direct Flights Available
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-300">Flights from</span>
                <div className="text-xl font-black font-mono text-[#00B2D6]">{dest.price}</div>
                <div className="text-[10px] text-slate-400 line-through font-mono">{dest.originalPrice}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
