import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Plane, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Palmtree, 
  Mountain, 
  Landmark, 
  Building2, 
  Heart, 
  Sun,
  Star,
  Tag
} from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

interface TouristPlace {
  id: string;
  city: string;
  country: string;
  code: string;
  category: ('beach' | 'mountain' | 'historic' | 'metropolis' | 'romantic')[];
  image: string;
  tagline: string;
  attractions: string[];
  bestSeason: string;
  flightDuration: string;
  price: string;
  originalPrice: string;
  discount: string;
  direct: boolean;
  rating: number;
}

export const TouristDestinationsShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchParams } = useBookingStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Wonder Places', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'beach', label: 'Beach Paradises', icon: <Palmtree className="w-3.5 h-3.5" /> },
    { id: 'mountain', label: 'Mountain & Alps', icon: <Mountain className="w-3.5 h-3.5" /> },
    { id: 'historic', label: 'Historic & Heritage', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'metropolis', label: 'Mega Metropolises', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'romantic', label: 'Romantic Escapes', icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  const touristPlaces: TouristPlace[] = [
    {
      id: 'paris',
      city: 'Paris',
      country: 'France',
      code: 'CDG',
      category: ['historic', 'romantic', 'metropolis'],
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
      tagline: 'City of Lights, Art & Romance',
      attractions: ['Eiffel Tower', 'Louvre Museum', 'Seine Cruise'],
      bestSeason: 'Apr – Oct • 21°C',
      flightDuration: '8h 45m',
      price: '₹38,400',
      originalPrice: '₹49,900',
      discount: '23% OFF',
      direct: true,
      rating: 4.9,
    },
    {
      id: 'bali',
      city: 'Bali',
      country: 'Indonesia',
      code: 'DPS',
      category: ['beach', 'romantic'],
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
      tagline: 'Tropical Island of Temples & Beaches',
      attractions: ['Uluwatu Temple', 'Ubud Rice Terraces', 'Seminyak'],
      bestSeason: 'May – Sep • 28°C',
      flightDuration: '6h 15m',
      price: '₹16,900',
      originalPrice: '₹22,500',
      discount: '25% OFF',
      direct: true,
      rating: 4.8,
    },
    {
      id: 'switzerland',
      city: 'Zurich & Swiss Alps',
      country: 'Switzerland',
      code: 'ZRH',
      category: ['mountain', 'romantic'],
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80',
      tagline: 'Snow-capped Alps & Crystal Lakes',
      attractions: ['Matterhorn', 'Lake Zurich', 'Jungfraujoch'],
      bestSeason: 'Dec – Apr (Snow) / Jun – Sep',
      flightDuration: '8h 10m',
      price: '₹46,500',
      originalPrice: '₹58,000',
      discount: '20% OFF',
      direct: true,
      rating: 4.9,
    },
    {
      id: 'tokyo',
      city: 'Tokyo',
      country: 'Japan',
      code: 'HND',
      category: ['metropolis', 'historic'],
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80',
      tagline: 'Neon Metropolis Meets Ancient Traditions',
      attractions: ['Shibuya Crossing', 'Mount Fuji', 'Senso-ji'],
      bestSeason: 'Mar – May (Cherry Blossom) & Oct – Nov',
      flightDuration: '7h 50m',
      price: '₹34,200',
      originalPrice: '₹44,000',
      discount: '22% OFF',
      direct: true,
      rating: 4.9,
    },
    {
      id: 'maldives',
      city: 'Maldives',
      country: 'Maldives',
      code: 'MLE',
      category: ['beach', 'romantic'],
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80',
      tagline: 'Turquoise Lagoons & Overwater Villas',
      attractions: ['Private Coral Islands', 'Scuba Diving', 'Sunset Cruises'],
      bestSeason: 'Nov – Apr • 30°C',
      flightDuration: '3h 45m',
      price: '₹14,800',
      originalPrice: '₹19,500',
      discount: '24% OFF',
      direct: true,
      rating: 5.0,
    },
    {
      id: 'santorini',
      city: 'Santorini',
      country: 'Greece',
      code: 'ATH',
      category: ['beach', 'romantic', 'historic'],
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80',
      tagline: 'Whitewashed Cliffs & Caldera Sunsets',
      attractions: ['Oia Blue Domes', 'Red Beach', 'Fira Town'],
      bestSeason: 'May – Oct • 26°C',
      flightDuration: '7h 30m',
      price: '₹41,000',
      originalPrice: '₹52,000',
      discount: '21% OFF',
      direct: false,
      rating: 4.9,
    },
    {
      id: 'dubai',
      city: 'Dubai',
      country: 'United Arab Emirates',
      code: 'DXB',
      category: ['metropolis', 'beach'],
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
      tagline: 'Futuristic Skyline & Desert Safaris',
      attractions: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall'],
      bestSeason: 'Nov – Mar • 25°C',
      flightDuration: '3h 50m',
      price: '₹18,500',
      originalPrice: '₹24,000',
      discount: '23% OFF',
      direct: true,
      rating: 4.8,
    },
    {
      id: 'kashmir',
      city: 'Srinagar & Gulmarg',
      country: 'India',
      code: 'SXR',
      category: ['mountain', 'romantic'],
      image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=900&q=80',
      tagline: 'Paradise on Earth with Snow Valleys',
      attractions: ['Dal Lake Shikara', 'Gulmarg Gondola', 'Pahalgam'],
      bestSeason: 'Year Round (Snow: Dec-Feb / Flowers: Apr-Aug)',
      flightDuration: '1h 35m',
      price: '₹4,800',
      originalPrice: '₹6,900',
      discount: '30% OFF',
      direct: true,
      rating: 4.9,
    },
  ];

  const filteredPlaces = touristPlaces.filter(
    (p) => activeCategory === 'all' || p.category.includes(activeCategory as any)
  );

  const handleBookDestination = (code: string) => {
    setSearchParams({
      origin: 'DEL',
      destination: code,
      departureDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      passengers: 1,
      cabinClass: 'ECONOMY',
    });
    navigate('/search');
  };

  return (
    <section className="relative space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            Explore Top Travel Destinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Book discounted flights to breathtaking global tourist destinations, tropical island paradises, snowy alps, and historic wonders.
          </p>
        </div>

        {/* All Wonder Places Only Badge / Tab */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#05203C] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0062E3] text-white shadow-sm font-display">
            <Compass className="w-3.5 h-3.5" />
            <span>All Wonder Places</span>
          </div>
        </div>
      </div>

      {/* Tourist Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            onClick={() => handleBookDestination(place.code)}
            className="group relative rounded-3xl overflow-hidden bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-[#0062E3] dark:hover:border-[#0062E3] transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
          >
            {/* Image Header with Hover Zoom */}
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={place.image}
                alt={place.city}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Top Badges */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold font-mono border border-white/20">
                  {place.discount}
                </span>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md text-slate-900 dark:text-white text-[11px] font-bold shadow-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{place.rating}</span>
                </div>
              </div>

              {/* City & Country on Image */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black font-display tracking-tight text-white drop-shadow-sm">
                    {place.city}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-[#0062E3] text-white text-[10px] font-mono font-bold">
                    {place.code}
                  </span>
                </div>
                <div className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#00B2D6]" />
                  <span>{place.country}</span>
                </div>
              </div>
            </div>

            {/* Card Body Details */}
            <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                  {place.tagline}
                </p>

                {/* Popular Attractions Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {place.attractions.map((att, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                    >
                      {att}
                    </span>
                  ))}
                </div>

                {/* Travel & Flight Specs */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0062E3]" />
                    <span>{place.flightDuration}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">{place.bestSeason}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Button Row */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Flights from</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black font-mono text-[#0062E3] dark:text-[#00B2D6]">
                      {place.price}
                    </span>
                    <span className="text-[11px] line-through text-slate-400 font-mono">
                      {place.originalPrice}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-[#0062E3] text-white text-xs font-bold hover:bg-[#0051c7] group-hover:scale-105 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Book Flight</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
