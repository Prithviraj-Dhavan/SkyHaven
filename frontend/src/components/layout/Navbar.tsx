import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plane,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  Ticket,
  Search,
  ChevronDown,
  Radio,
  Globe,
  Bell,
  Compass,
  Check,
  X,
  Menu,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBookingStore } from '../../store/bookingStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useCountdown, formatTimer } from '../../hooks';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { setAiDrawerOpen, setSearchParams, holdExpiresAt, selectedSeats } = useBookingStore();
  const secondsLeft = useCountdown(holdExpiresAt, Boolean(holdExpiresAt));
  const location = useLocation();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isEverywhereActive = location.search.includes('mode=everywhere');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFlightsClick = () => {
    setSearchParams({
      origin: 'DEL',
      destination: 'BOM',
      departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      passengers: 1,
      cabinClass: 'ECONOMY',
      tripType: 'one-way',
    });
    navigate('/search?mode=direct&t=' + Date.now());
  };

  const handleExploreEverywhere = () => {
    setSearchParams({
      origin: 'DEL',
      destination: '',
      departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      passengers: 1,
      cabinClass: 'ECONOMY',
      tripType: 'one-way',
    });
    navigate('/search?mode=everywhere&t=' + Date.now());
  };

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  ];

  const isDarkHeroNavbar = isHomePage && !isScrolled;

  return (
    <>
      <header
        className={`z-40 w-full transition-all duration-300 ${
          isDarkHeroNavbar
            ? 'absolute top-2 sm:top-5 left-0 right-0 bg-transparent border-b border-transparent text-white'
            : isHomePage
            ? 'fixed top-0 left-0 right-0 bg-white/90 dark:bg-[#05182e]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs text-slate-800 dark:text-white'
            : 'sticky top-0 bg-white/90 dark:bg-[#05182e]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs text-slate-800 dark:text-white'
        }`}
      >
        {/* Main Full-Width Header Row with balanced luxury padding */}
        <div className="w-full px-3 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">

          {/* Logo & Category Navigation Tabs */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shrink-0 flex items-center justify-center bg-white shadow-2xs border border-slate-200/60 dark:border-white/10">
                <img
                  src="/images/skyhaven-logo.png"
                  alt="SkyHaven Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg sm:text-2xl font-black font-display tracking-tight leading-none drop-shadow-2xs ${
                  isDarkHeroNavbar ? 'text-white' : 'text-slate-900 dark:text-white'
                }`}>
                  Sky<span className="text-[#0062E3] dark:text-[#00B2D6]">Haven</span>
                </span>
                <span className={`hidden sm:block text-[9px] font-bold tracking-widest uppercase font-display mt-0.5 ${
                  isDarkHeroNavbar ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  Your Journey Begins Here
                </span>
              </div>
            </Link>

            {/* Main Category Tabs - Direct on Background */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFlightsClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                  (isActive('/search') || isActive('/')) && !isEverywhereActive
                    ? 'bg-[#0062E3] text-white shadow-sm shadow-blue-500/25'
                    : isDarkHeroNavbar
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Flights</span>
              </button>

              <button
                type="button"
                onClick={handleExploreEverywhere}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                  isEverywhereActive
                    ? 'bg-[#0062E3] text-white shadow-sm shadow-blue-500/25'
                    : isDarkHeroNavbar
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#0062E3] dark:text-[#00B2D6]" />
                <span>Explore Everywhere</span>
              </button>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin')
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isDarkHeroNavbar
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-300" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Country & Currency Selector Button */}
            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(true)}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer font-display ${
                isDarkHeroNavbar
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
              }`}
              title="Change Currency & Region"
            >
              <Globe className="w-3.5 h-3.5 text-[#0062E3] dark:text-[#00B2D6]" />
              <span>{selectedCountry} • {selectedCurrency} (₹)</span>
              <ChevronDown className={`w-3 h-3 ${isDarkHeroNavbar ? 'text-white/60' : 'text-slate-400 dark:text-white/60'}`} />
            </button>

            {/* Price Alerts Button */}
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer font-display ${
                isDarkHeroNavbar
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
              }`}
              title="Set Flight Price Alerts"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden xl:inline">Price Alerts</span>
            </button>

            {/* Modern Ask AI Button */}
            <button
              onClick={() => setAiDrawerOpen(true)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold font-display transition-all cursor-pointer shadow-xs ${
                isDarkHeroNavbar
                  ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                  : 'bg-gradient-to-r from-blue-600 via-[#0062E3] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 shadow-sm hover:scale-102 active:scale-98'
              }`}
              title="Search with Natural Language"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Ask AI</span>
            </button>

            {/* Active Seat Lock Quick-Resume Pill */}
            {holdExpiresAt && secondsLeft > 0 && selectedSeats.length > 0 && location.pathname !== '/checkout' && (
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-amber-500/25 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-400/50 text-amber-500 dark:text-amber-300 text-xs font-bold font-mono transition-all animate-pulse cursor-pointer shadow-xs"
                title="Your seats are locked! Click to resume payment."
              >
                <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Seats Held:</span>
                <span className="underline">{formatTimer(secondsLeft)}</span>
              </button>
            )}

            {/* Dark / Light Toggle */}
            <ThemeToggle className={isDarkHeroNavbar ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : ''} />

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-1.5 sm:gap-2 p-1.5 pr-2 sm:pr-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isDarkHeroNavbar
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#0062E3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className={`text-xs font-bold truncate max-w-[100px] ${
                      isDarkHeroNavbar ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      {user.name}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 ${
                    isDarkHeroNavbar ? 'text-white/70' : 'text-slate-500 dark:text-white/70'
                  }`} />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#071628] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 space-y-1 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                      </div>

                      <Link
                        to="/my-bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white"
                      >
                        <Ticket className="w-4 h-4 text-slate-400" />
                        <span>My Bookings</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <button className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display transition-colors cursor-pointer ${
                    isDarkHeroNavbar
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/10'
                  }`}>
                    Log In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold font-display bg-[#0062E3] hover:bg-[#0051c7] text-white shadow-xs transition-colors cursor-pointer">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer ${
                isDarkHeroNavbar
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15'
              }`}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/98 dark:bg-[#05182e]/98 backdrop-blur-xl px-4 py-4 space-y-2 text-slate-800 dark:text-white animate-in slide-in-from-top-3 duration-200 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleFlightsClick();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                (isActive('/search') || isActive('/')) && !isEverywhereActive
                  ? 'bg-[#0062E3] text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-white/90 dark:hover:bg-white/10'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>Search Flights</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleExploreEverywhere();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                isEverywhereActive
                  ? 'bg-[#0062E3] text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-white/90 dark:hover:bg-white/10'
              }`}
            >
              <Compass className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6]" />
              <span>Explore Everywhere</span>
            </button>

            {user && (
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive('/my-bookings')
                    ? 'bg-[#0062E3] text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-white/90 dark:hover:bg-white/10'
                }`}
              >
                <Ticket className="w-4 h-4 text-[#0062E3]" />
                <span>My Bookings</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAlertModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-white/90 dark:hover:bg-white/10 transition-all text-left"
            >
              <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Flight Price Alerts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCurrencyModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-white/90 dark:hover:bg-white/10 transition-all text-left"
            >
              <Globe className="w-4 h-4 text-[#0062E3] dark:text-[#00B2D6]" />
              <span>Region & Currency ({selectedCurrency})</span>
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            )}

            {!user ? (
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-center text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-center text-xs font-bold bg-[#0062E3] hover:bg-[#0051c7] text-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({user.name})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Currency & Region Selector Modal */}
      <Modal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        title="Select Regional Preferences"
        subtitle="Choose your preferred display currency and billing country."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
              Currency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCurrency(c.code)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${selectedCurrency === c.code
                      ? 'border-[#0062E3] bg-blue-50 dark:bg-blue-950/40 text-[#0062E3] dark:text-[#00B2D6]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span>{c.code}</span>
                  </div>
                  <span className="font-mono text-slate-400">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => setIsCurrencyModalOpen(false)} size="sm">
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>

      {/* Price Alert Subscription Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Set Route Price Alert"
        subtitle="We will track airfares in the background and notify you when prices drop."
        maxWidth="md"
      >
        <div className="space-y-4">
          {alertSubscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Price Alert Active!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You will receive real-time email alerts for sudden price dips.
              </p>
              <Button
                onClick={() => {
                  setAlertSubscribed(false);
                  setIsAlertModalOpen(false);
                }}
                size="sm"
                variant="outline"
                className="mt-2"
              >
                Done
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAlertSubscribed(true);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-[#071628] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0062E3]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAlertModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Track Airfare
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
};
