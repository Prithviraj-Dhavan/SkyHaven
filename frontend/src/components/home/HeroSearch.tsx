import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  ArrowRightLeft, 
  Sparkles, 
  Search, 
  ChevronDown, 
  Minus, 
  Plus, 
  Check, 
  Compass, 
  ArrowRight, 
  Clock,
  PlaneTakeoff,
  PlaneLanding,
  Zap,
  Crown,
  Radar,
  Tag,
  GraduationCap,
  Award,
  HeartPulse,
  UserCheck,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { CabinClass } from '../../types';
import { api } from '../../services/api';
import { FlightDatePicker } from '../ui/FlightDatePicker';

type SpecialFare = 'REGULAR' | 'STUDENT' | 'ARMED_FORCES' | 'SENIOR_CITIZEN' | 'DOCTORS_NURSES';
type FlightMode = 'SEARCH' | 'EVERYWHERE' | 'DIRECT' | 'PREMIUM' | 'CALENDAR' | 'STATUS';

interface MultiCityLeg {
  id: string;
  fromCode: string;
  fromCity: string;
  fromAirport: string;
  toCode: string;
  toCity: string;
  toAirport: string;
  date: string;
}

export const HeroSearch: React.FC = () => {
  const navigate = useNavigate();
  const { searchParams, setSearchParams, setAiDrawerOpen } = useBookingStore();

  const [flightMode, setFlightMode] = useState<FlightMode>('SEARCH');
  const [specialFare, setSpecialFare] = useState<SpecialFare>('REGULAR');

  const [airports, setAirports] = useState<any[]>([]);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isPaxOpen, setIsPaxOpen] = useState(false);

  const [originCode, setOriginCode] = useState(searchParams.origin || 'DEL');
  const [destCode, setDestCode] = useState(searchParams.destination || 'BOM');
  const [originCity, setOriginCity] = useState('New Delhi');
  const [destCity, setDestCity] = useState('Mumbai');
  const [originAirportName, setOriginAirportName] = useState('DEL, Indira Gandhi International Airport');
  const [destAirportName, setDestAirportName] = useState('BOM, Chhatrapati Shivaji International Airport');

  const [originSearchText, setOriginSearchText] = useState('');
  const [destSearchText, setDestSearchText] = useState('');
  const [directOnly, setDirectOnly] = useState(false);

  // Steppers for passengers
  const [adults, setAdults] = useState(searchParams.passengers || 1);
  const [children, setChildren] = useState(0);

  // Multi-city legs state
  const [multiCityLegs, setMultiCityLegs] = useState<MultiCityLeg[]>([
    {
      id: 'leg-1',
      fromCode: 'DEL',
      fromCity: 'New Delhi',
      fromAirport: 'DEL, Indira Gandhi International Airport',
      toCode: 'BOM',
      toCity: 'Mumbai',
      toAirport: 'BOM, Chhatrapati Shivaji International Airport',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    },
    {
      id: 'leg-2',
      fromCode: 'BOM',
      fromCity: 'Mumbai',
      fromAirport: 'BOM, Chhatrapati Shivaji International Airport',
      toCode: 'BLR',
      toCity: 'Bengaluru',
      toAirport: 'BLR, Kempegowda International Airport',
      date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    },
  ]);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const paxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getAirports().then((res: any) => {
      if (res.success && res.data) {
        setAirports(res.data);
        const originAir = res.data.find((a: any) => a.code === (searchParams.origin || 'DEL'));
        if (originAir) {
          setOriginCode(originAir.code);
          setOriginCity(originAir.cityName);
          setOriginAirportName(`${originAir.code}, ${originAir.name}`);
        }
        const destAir = res.data.find((a: any) => a.code === (searchParams.destination || 'BOM'));
        if (destAir) {
          setDestCode(destAir.code);
          setDestCity(destAir.cityName);
          setDestAirportName(`${destAir.code}, ${destAir.name}`);
        }
      }
    });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setIsDestOpen(false);
      }
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) {
        setIsPaxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOrigins = airports.filter(
    (a) =>
      a.cityName.toLowerCase().includes(originSearchText.toLowerCase()) ||
      a.code.toLowerCase().includes(originSearchText.toLowerCase()) ||
      a.name.toLowerCase().includes(originSearchText.toLowerCase())
  );

  const filteredDests = airports.filter(
    (a) =>
      a.cityName.toLowerCase().includes(destSearchText.toLowerCase()) ||
      a.code.toLowerCase().includes(destSearchText.toLowerCase()) ||
      a.name.toLowerCase().includes(destSearchText.toLowerCase())
  );

  const handleSwapAirports = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tempCode = originCode;
    const tempCity = originCity;
    const tempName = originAirportName;

    setOriginCode(destCode || 'DEL');
    setOriginCity(destCity || 'New Delhi');
    setOriginAirportName(destAirportName || 'DEL, Indira Gandhi International Airport');

    setDestCode(tempCode);
    setDestCity(tempCity);
    setDestAirportName(tempName);

    setSearchParams({
      origin: destCode || 'DEL',
      destination: tempCode,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      origin: originCode || 'DEL',
      destination: destCode === 'EVERYWHERE' ? '' : destCode,
      passengers: adults + children,
      departureDate: searchParams.departureDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    });
    if (destCode === 'EVERYWHERE' || !destCode) {
      navigate('/search?mode=everywhere');
    } else {
      navigate('/search');
    }
  };

  const handleEverywhere = () => {
    setDestCode('');
    setDestCity('Everywhere');
    setDestAirportName('Explore cheapest flights worldwide');
    setSearchParams({ destination: '' });
    setIsDestOpen(false);
    navigate('/search?mode=everywhere&t=' + Date.now());
  };

  const handleFlightModeClick = (mode: FlightMode) => {
    setFlightMode(mode);
    if (mode === 'EVERYWHERE') {
      handleEverywhere();
    } else if (mode === 'DIRECT') {
      setDirectOnly(!directOnly);
    } else if (mode === 'PREMIUM') {
      setSearchParams({ cabinClass: 'BUSINESS' });
    } else if (mode === 'CALENDAR') {
      setIsDateModalOpen(true);
    } else if (mode === 'STATUS') {
      navigate('/trips');
    }
  };

  const handleTripTypeChange = (type: 'round-trip' | 'one-way' | 'multi-city') => {
    if (type === 'round-trip') {
      const dep = searchParams.departureDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const retDate = new Date(dep);
      retDate.setDate(retDate.getDate() + 7);
      setSearchParams({
        tripType: 'round-trip',
        departureDate: dep,
        returnDate: retDate.toISOString().split('T')[0],
      });
    } else if (type === 'one-way') {
      setSearchParams({
        tripType: 'one-way',
        returnDate: undefined,
      });
    } else {
      setSearchParams({
        tripType: 'multi-city',
      });
    }
  };

  const totalPassengers = adults + children;

  // Breakdown date parts for giant stylish display (e.g. "3", "Sep'26", "Thursday")
  const getDateBreakdown = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date(Date.now() + 86400000);
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const yearShort = String(d.getFullYear()).slice(-2);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    return {
      dayNumber,
      monthYear: `${monthName}'${yearShort}`,
      weekday,
    };
  };

  const depBreakdown = getDateBreakdown(searchParams.departureDate);
  const retBreakdown = searchParams.returnDate ? getDateBreakdown(searchParams.returnDate) : null;

  const flightCategories = [
    { id: 'SEARCH', label: 'Flights', icon: <Plane className="w-4 h-4" /> },
    { id: 'EVERYWHERE', label: 'Explore Everywhere', icon: <Compass className="w-4 h-4" /> },
    { id: 'DIRECT', label: 'Direct Flights', icon: <Zap className="w-4 h-4" /> },
    { id: 'PREMIUM', label: 'Business & First', icon: <Crown className="w-4 h-4" /> },
    { id: 'CALENDAR', label: 'Low Fare Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
  ];

  const specialFareOptions = [
    { id: 'REGULAR', label: 'Regular Fares', desc: 'Best standard prices', icon: <Tag className="w-3.5 h-3.5" /> },
    { id: 'STUDENT', label: 'Student', desc: 'Extra 10kg baggage + 10% off', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'ARMED_FORCES', label: 'Armed Forces', desc: 'Up to ₹600 off', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'SENIOR_CITIZEN', label: 'Senior Citizen', desc: 'Up to ₹600 off', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'DOCTORS_NURSES', label: 'Doctors & Nurses', desc: 'Special care fare', icon: <HeartPulse className="w-3.5 h-3.5" /> },
  ];

  const isRoundTrip = searchParams.tripType === 'round-trip';
  const isMultiCity = searchParams.tripType === 'multi-city';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-2.5">
      
      {/* 1. Floating Flight Intelligence Pill Bar */}
      <div className="flex justify-center -mb-4 relative z-30 overflow-x-auto no-scrollbar px-2">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-[#05203C]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/20 shadow-xl">
          {flightCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleFlightModeClick(cat.id as FlightMode)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-display whitespace-nowrap ${
                flightMode === cat.id
                  ? 'bg-[#0062E3] text-white shadow-sky'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0062E3] hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Elevated Search Box Card */}
      <div className="w-full bg-white dark:bg-[#05203C] text-slate-900 dark:text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-white/15 space-y-5 transition-colors duration-200 relative z-20">
        
        {/* Top Control Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4 pt-1">
          {/* Trip Type Radio Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: 'round-trip', label: 'Round Trip' },
              { id: 'one-way', label: 'One Way' },
              { id: 'multi-city', label: 'Multi City' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTripTypeChange(type.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer font-display ${
                  searchParams.tripType === type.id
                    ? 'bg-[#0062E3] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    searchParams.tripType === type.id ? 'bg-white' : 'bg-transparent border-2 border-slate-400 dark:border-slate-500'
                  }`}
                />
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Preferences & AI Trigger */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-slate-400 hidden md:inline font-mono">
              Book International & Domestic Flights
            </span>

            <button
              type="button"
              onClick={() => setAiDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0062E3] border border-blue-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-[#00B2D6] dark:border-white/10 text-xs font-bold transition-all cursor-pointer font-display"
            >
              Ask AI
            </button>
          </div>
        </div>

        {/* 3. MULTI-CITY VIEW OR 5-BOX ROUND-TRIP/ONE-WAY CONNECTED MATRIX */}
        {isMultiCity ? (
          /* Multi-City Interactive Form */
          <div className="space-y-4">
            {multiCityLegs.map((leg, index) => (
              <div key={leg.id} className="p-4 bg-slate-50 dark:bg-[#071628] rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
                <span className="text-xs font-black font-mono px-2.5 py-1 rounded-lg bg-[#0062E3] text-white">
                  Flight {index + 1}
                </span>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  {/* From */}
                  <div className="bg-white dark:bg-[#0c192e] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
                    <div className="text-base font-black font-display text-slate-900 dark:text-white">
                      {leg.fromCity} ({leg.fromCode})
                    </div>
                  </div>

                  {/* To */}
                  <div className="bg-white dark:bg-[#0c192e] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
                    <div className="text-base font-black font-display text-slate-900 dark:text-white">
                      {leg.toCity} ({leg.toCode})
                    </div>
                  </div>

                  {/* Date */}
                  <div 
                    onClick={() => setIsDateModalOpen(true)}
                    className="bg-white dark:bg-[#0c192e] p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
                    <div className="text-base font-black font-display text-slate-900 dark:text-white">
                      {leg.date}
                    </div>
                  </div>
                </div>

                {multiCityLegs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setMultiCityLegs(multiCityLegs.filter((l) => l.id !== leg.id))}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              {multiCityLegs.length < 5 && (
                <button
                  type="button"
                  onClick={() =>
                    setMultiCityLegs([
                      ...multiCityLegs,
                      {
                        id: `leg-${Date.now()}`,
                        fromCode: multiCityLegs[multiCityLegs.length - 1].toCode,
                        fromCity: multiCityLegs[multiCityLegs.length - 1].toCity,
                        fromAirport: multiCityLegs[multiCityLegs.length - 1].toAirport,
                        toCode: 'GOI',
                        toCity: 'Goa',
                        toAirport: 'GOI, Dabolim Airport',
                        date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                      },
                    ])
                  }
                  className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0062E3] dark:text-[#00B2D6] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Flight Leg</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="px-8 py-3.5 rounded-full bg-[#0062E3] hover:bg-[#0051c7] text-white font-black font-display text-sm tracking-wide shadow-sky cursor-pointer"
              >
                Search Multi-City Flights
              </button>
            </div>
          </div>
        ) : (
          /* 5-BOX CONNECTED FLIGHT MATRIX (FROM, TO, DEPARTURE, RETURN, TRAVELLERS) */
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 bg-slate-50 dark:bg-[#071628] p-2.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
              
              {/* Box 1: FROM (Big Bold City Name) */}
              <div className="relative" ref={originRef}>
                <div
                  onClick={() => setIsOriginOpen(true)}
                  className="bg-white dark:bg-[#0c192e] rounded-xl p-3 sm:p-3.5 h-[96px] flex flex-col justify-between cursor-pointer border border-slate-200/80 dark:border-slate-800 hover:border-[#0062E3] dark:hover:border-[#00B2D6] transition-all text-slate-900 dark:text-white shadow-2xs group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[10px]">
                      <PlaneTakeoff className="w-3.5 h-3.5 text-[#0062E3]" />
                      From
                    </span>
                    <button
                      type="button"
                      onClick={handleSwapAirports}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-slate-400 hover:text-[#0062E3] transition-colors"
                      title="Swap route"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-none truncate">
                      {originCity}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {originAirportName}
                    </div>
                  </div>
                </div>

                {/* Origin Autocomplete Popover */}
                {isOriginOpen && (
                  <div className="absolute top-full left-0 right-0 sm:w-[320px] mt-2 bg-white dark:bg-[#071628] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-50 p-2 text-slate-900 dark:text-white animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="Type city or airport code..."
                      value={originSearchText}
                      onChange={(e) => setOriginSearchText(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold mb-2 focus:outline-none focus:border-[#0062E3]"
                    />
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Popular Departure Airports
                    </div>
                    {filteredOrigins.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setOriginCode(a.code);
                          setOriginCity(a.cityName);
                          setOriginAirportName(`${a.code}, ${a.name}`);
                          setSearchParams({ origin: a.code });
                          setIsOriginOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-[#0062E3] shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {a.cityName}, {a.country}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                              {a.name}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-[#0062E3] dark:text-[#00B2D6]">
                          {a.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: TO (Big Bold Destination City Name) */}
              <div className="relative" ref={destRef}>
                <div
                  onClick={() => setIsDestOpen(true)}
                  className="bg-white dark:bg-[#0c192e] rounded-xl p-3 sm:p-3.5 h-[96px] flex flex-col justify-between cursor-pointer border border-slate-200/80 dark:border-slate-800 hover:border-[#0062E3] dark:hover:border-[#00B2D6] transition-all text-slate-900 dark:text-white shadow-2xs group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[10px]">
                      <PlaneLanding className="w-3.5 h-3.5 text-[#0062E3]" />
                      To
                    </span>
                  </div>

                  <div>
                    <div className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-none truncate">
                      {destCity}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {destAirportName}
                    </div>
                  </div>
                </div>

                {/* Destination Autocomplete Popover */}
                {isDestOpen && (
                  <div className="absolute top-full left-0 right-0 sm:w-[320px] mt-2 bg-white dark:bg-[#071628] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-50 p-2 text-slate-900 dark:text-white animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="Type city or airport code..."
                      value={destSearchText}
                      onChange={(e) => setDestSearchText(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold mb-2 focus:outline-none focus:border-[#0062E3]"
                    />

                    {/* Explore Everywhere Button */}
                    <button
                      type="button"
                      onClick={handleEverywhere}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0062E3] dark:text-[#00B2D6] font-bold text-xs mb-2 transition-all cursor-pointer border border-blue-200 dark:border-blue-800"
                    >
                      <Compass className="w-5 h-5 text-[#0062E3] animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="text-left">
                        <div className="font-black font-display">Can't decide? Search Everywhere</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Explore cheapest flight fares across all global hubs</div>
                      </div>
                    </button>

                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Popular Destinations
                    </div>
                    {filteredDests.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setDestCode(a.code);
                          setDestCity(a.cityName);
                          setDestAirportName(`${a.code}, ${a.name}`);
                          setSearchParams({ destination: a.code });
                          setIsDestOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-[#0062E3] shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {a.cityName}, {a.country}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                              {a.name}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-[#0062E3] dark:text-[#00B2D6]">
                          {a.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 3: DEPARTURE (Date) */}
              <div>
                <div
                  onClick={() => setIsDateModalOpen(true)}
                  className="bg-white dark:bg-[#0c192e] rounded-xl p-3 sm:p-3.5 h-[96px] flex flex-col justify-between cursor-pointer border border-slate-200/80 dark:border-slate-800 hover:border-[#0062E3] dark:hover:border-[#00B2D6] transition-all text-slate-900 dark:text-white shadow-2xs group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[10px]">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#0062E3]" />
                      Departure
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5 leading-none">
                      <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                        {depBreakdown.dayNumber}
                      </span>
                      <span className="text-xs font-black font-display text-slate-800 dark:text-slate-200">
                        {depBreakdown.monthYear}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {depBreakdown.weekday}
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 4: RETURN DATE */}
              <div>
                <div
                  onClick={() => {
                    if (!isRoundTrip) {
                      handleTripTypeChange('round-trip');
                    }
                    setIsDateModalOpen(true);
                  }}
                  className={`rounded-xl p-3 sm:p-3.5 h-[96px] flex flex-col justify-between cursor-pointer transition-all shadow-2xs group border ${
                    isRoundTrip && retBreakdown
                      ? 'bg-white dark:bg-[#0c192e] border-slate-200/80 dark:border-slate-800 hover:border-[#0062E3]'
                      : 'bg-blue-50/40 dark:bg-white/5 border-dashed border-blue-300 dark:border-white/20 hover:border-solid hover:border-[#0062E3]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[10px]">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#0062E3]" />
                      Return
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>

                  <div>
                    {isRoundTrip && retBreakdown ? (
                      <div>
                        <div className="flex items-baseline gap-1.5 leading-none">
                          <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                            {retBreakdown.dayNumber}
                          </span>
                          <span className="text-xs font-black font-display text-slate-800 dark:text-slate-200">
                            {retBreakdown.monthYear}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {retBreakdown.weekday}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-black font-display text-[#0062E3] dark:text-[#00B2D6] leading-tight">
                          + Add Return Date
                        </div>
                        <div className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          Save extra on round-trips
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 5: TRAVELLERS & CABIN CLASS */}
              <div className="relative" ref={paxRef}>
                <div
                  onClick={() => setIsPaxOpen(!isPaxOpen)}
                  className="bg-white dark:bg-[#0c192e] rounded-xl p-3 sm:p-3.5 h-[96px] flex flex-col justify-between cursor-pointer border border-slate-200/80 dark:border-slate-800 hover:border-[#0062E3] dark:hover:border-[#00B2D6] transition-all text-slate-900 dark:text-white shadow-2xs group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[10px]">
                      <Users className="w-3.5 h-3.5 text-[#0062E3]" />
                      Travellers & Class
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5 leading-none truncate">
                      <span className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                        {totalPassengers}
                      </span>
                      <span className="text-xs font-black font-display text-slate-800 dark:text-slate-200">
                        {totalPassengers === 1 ? 'Traveller' : 'Travellers'}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize truncate mt-0.5">
                      {searchParams.cabinClass.toLowerCase().replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Passenger Selector Popover */}
                {isPaxOpen && (
                  <div className="absolute top-full right-0 w-[300px] mt-2 bg-white dark:bg-[#071628] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-4 text-slate-900 dark:text-white animate-in fade-in duration-150">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Cabin & Travellers
                    </div>

                    {/* Adults Stepper */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold">Adults</div>
                        <div className="text-[10px] text-slate-400">12+ years</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-xs">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(9, adults + 1))}
                          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children Stepper */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold">Children</div>
                        <div className="text-[10px] text-slate-400">2-12 years</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-xs">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(6, children + 1))}
                          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Cabin Class Selection */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        Class
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                        {[
                          { id: 'ECONOMY', label: 'Economy' },
                          { id: 'PREMIUM_ECONOMY', label: 'Premium' },
                          { id: 'BUSINESS', label: 'Business' },
                          { id: 'FIRST', label: 'First' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSearchParams({ cabinClass: c.id as any })}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                              searchParams.cabinClass === c.id
                                ? 'border-[#0062E3] bg-blue-50 dark:bg-blue-950/50 text-[#0062E3] dark:text-[#00B2D6]'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams({ passengers: adults + children });
                        setIsPaxOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#0062E3] text-white font-bold text-xs hover:bg-[#0051c7] transition-colors cursor-pointer font-display"
                    >
                      Apply Passengers
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Special Fare Discount Selector Strip */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-display">
                  Select a Special Fare:
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">
                  ✓ Special Government & Concessional Category Savings
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {specialFareOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSpecialFare(f.id as SpecialFare)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      specialFare === f.id
                        ? 'border-[#0062E3] bg-blue-50/90 dark:bg-blue-950/50 text-[#0062E3] dark:text-[#00B2D6] shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0c192e]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs font-display">
                      {f.icon}
                      <span>{f.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold leading-tight">
                      {f.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Glowing Centered SEARCH Button */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <button
                type="submit"
                className="w-full sm:w-[320px] py-3.5 rounded-full bg-gradient-to-r from-[#0062E3] via-blue-600 to-[#00B2D6] hover:from-[#0051c7] hover:to-[#009bbd] text-white text-base font-black font-display tracking-wider uppercase shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <span>SEARCH FLIGHTS</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {/* Trending Route Shortcut Badges */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
            Trending Flights from India:
          </span>
          {[
            { label: 'Delhi ➔ Goa', from: 'DEL', to: 'GOI', fare: '₹5,400' },
            { label: 'Mumbai ➔ Goa', from: 'BOM', to: 'GOI', fare: '₹3,650' },
            { label: 'Bengaluru ➔ Mumbai', from: 'BLR', to: 'BOM', fare: '₹4,150' },
            { label: 'Delhi ➔ Dubai', from: 'DEL', to: 'DXB', fare: '₹18,500' },
            { label: 'Mumbai ➔ London', from: 'BOM', to: 'LHR', fare: '₹48,000' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setOriginCode(chip.from);
                setDestCode(chip.to);
                setSearchParams({
                  origin: chip.from,
                  destination: chip.to,
                  departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                  passengers: 1,
                  cabinClass: 'ECONOMY',
                });
                navigate('/search');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1.5 font-display"
            >
              <span>{chip.label}</span>
              <span className="font-mono font-bold text-[#0062E3] dark:text-[#00B2D6]">{chip.fare}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visual Flight Date Picker Modal */}
      <FlightDatePicker
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        departureDate={searchParams.departureDate}
        returnDate={searchParams.returnDate}
        isRoundTrip={isRoundTrip}
        onSelectDates={(dep, ret) => {
          setSearchParams({
            departureDate: dep,
            returnDate: ret,
          });
        }}
      />
    </div>
  );
};
