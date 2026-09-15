import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight, Tag, Sparkles, Flame, Zap, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useBookingStore } from '../../store/bookingStore';

const fallbackDeals = [
  {
    id: 'deal-1',
    flightNumber: 'SH-104',
    airline: 'SkyHaven Airways',
    originCity: 'Mumbai',
    originCode: 'BOM',
    destCity: 'Goa',
    destCode: 'GOI',
    durationMinutes: 75,
    price: 3650,
    originalPrice: 4800,
    departureTime: new Date(Date.now() + 86400000).toISOString(),
    discount: '24% OFF',
    tag: '⚡ FLASH FARE',
    seatsLeft: 6,
  },
  {
    id: 'deal-2',
    flightNumber: 'AM-108',
    airline: 'Vayu Jet',
    originCity: 'Bengaluru',
    originCode: 'BLR',
    destCity: 'Mumbai',
    destCode: 'BOM',
    durationMinutes: 100,
    price: 4150,
    originalPrice: 5500,
    departureTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    discount: '25% OFF',
    tag: '🔥 POPULAR',
    seatsLeft: 4,
  },
  {
    id: 'deal-3',
    flightNumber: 'AM-112',
    airline: 'SkyLuxe International',
    originCity: 'New Delhi',
    originCode: 'DEL',
    destCity: 'Goa',
    destCode: 'GOI',
    durationMinutes: 155,
    price: 5400,
    originalPrice: 7200,
    departureTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    discount: '25% OFF',
    tag: '🌴 WEEKEND SPECIAL',
    seatsLeft: 9,
  },
  {
    id: 'deal-4',
    flightNumber: 'AM-116',
    airline: 'Apex Global',
    originCity: 'New Delhi',
    originCode: 'DEL',
    destCity: 'Dubai',
    destCode: 'DXB',
    durationMinutes: 235,
    price: 18500,
    originalPrice: 24000,
    departureTime: new Date(Date.now() + 86400000 * 4).toISOString(),
    discount: '23% OFF',
    tag: '✈️ GLOBAL HUB',
    seatsLeft: 12,
  },
];

export const FlightDeals: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchParams } = useBookingStore();
  const [deals, setDeals] = useState<any[]>(fallbackDeals);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api
      .getFeaturedDeals()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDeals(
            res.data.map((d: any, idx: number) => ({
              ...d,
              originalPrice: Math.round(d.price * 1.28),
              discount: `${20 + (idx % 3) * 5}% OFF`,
              tag: idx % 2 === 0 ? '⚡ FLASH FARE' : '🔥 LIMITED SEATS',
              seatsLeft: 4 + (idx * 3) % 10,
            }))
          );
        }
      })
      .catch(() => {
        // Keep resilient fallback deals
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleBookDeal = (deal: any) => {
    setSearchParams({
      origin: deal.originCode,
      destination: deal.destCode,
      departureDate: new Date(deal.departureTime).toISOString().split('T')[0],
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
            Today's Top Flight Deals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time discounted inventory across high-demand domestic & international sectors.
          </p>
        </div>

        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0062E3] dark:text-[#00B2D6] hover:underline transition-colors cursor-pointer group font-display"
        >
          <span>View All 280+ Live Flights</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {deals.slice(0, 4).map((deal) => (
          <div
            key={deal.id}
            onClick={() => handleBookDeal(deal)}
            className="group relative rounded-2xl p-5 bg-white dark:bg-[#05203C] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-[#0062E3] dark:hover:border-[#0062E3] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#0062E3] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Header: Flash Tag & Flight Number */}
              <div className="flex items-center justify-between gap-2 mb-4">

                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {deal.flightNumber}
                </span>
              </div>

              {/* Route & City Names */}
              <div className="flex items-center justify-between my-3">
                <div>
                  <div className="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                    {deal.originCode}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">{deal.originCity}</div>
                </div>

                <div className="flex flex-col items-center px-3">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {Math.floor(deal.durationMinutes / 60)}h {deal.durationMinutes % 60}m
                  </span>
                  <div className="w-16 h-[2px] bg-slate-200 dark:bg-slate-700 my-1.5 relative flex items-center justify-center">
                    <Plane className="w-3.5 h-3.5 text-[#0062E3] dark:text-[#00B2D6] absolute rotate-90" />
                  </div>
                  <span className="text-[9px] uppercase font-bold text-emerald-500">Non-stop</span>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                    {deal.destCode}
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">{deal.destCity}</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Airline: <strong className="text-slate-700 dark:text-slate-300">{deal.airline}</strong></span>

              </div>
            </div>

            {/* Bottom Price & Action */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] line-through text-slate-400 font-mono">
                    ₹{Number(deal.originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 font-mono">
                    {deal.discount}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-[#0062E3] dark:text-[#00B2D6]">
                  ₹{Number(deal.price).toLocaleString('en-IN')}
                </div>
              </div>

              <button className="p-2.5 rounded-xl bg-blue-500/10 text-[#0062E3] dark:text-[#00B2D6] group-hover:bg-[#0062E3] group-hover:text-white transition-all shadow-xs">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
