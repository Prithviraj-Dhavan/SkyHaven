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
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBookingStore } from '../../store/bookingStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { setAiDrawerOpen, setSearchParams } = useBookingStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  return (
    <>
      <header 
        className={`z-40 w-full transition-all duration-300 text-white ${
          isHomePage
            ? isScrolled 
              ? 'fixed top-0 left-0 right-0 bg-[#02122c]/90 backdrop-blur-md border-b border-white/10 shadow-lg' 
              : 'absolute top-3 sm:top-5 left-0 right-0 bg-transparent border-b border-transparent'
            : 'sticky top-0 bg-[#02122c] border-b border-slate-800 shadow-md'
        }`}
      >
        {/* Main Full-Width Header Row with balanced luxury padding */}
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 sm:h-22 flex items-center justify-between gap-4">
          
          {/* Logo & Category Navigation Tabs */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shrink-0 flex items-center justify-center">
                <img
                  src="/images/skyhaven-logo.png"
                  alt="SkyHaven Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black font-display tracking-tight text-white leading-none drop-shadow-sm">
                  Sky<span className="text-[#00B2D6]">Haven</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-slate-300 font-display mt-0.5 drop-shadow-xs">
                  Your Journey Begins Here
                </span>
              </div>
            </Link>

            {/* Main Category Tabs - Direct on Background (no enclosing box) */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleFlightsClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                  (isActive('/search') || isActive('/')) && !isEverywhereActive
                    ? 'bg-[#0062E3] text-white shadow-sm shadow-blue-500/30'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
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
                    ? 'bg-[#0062E3] text-white shadow-sm shadow-blue-500/30'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#00B2D6]" />
                <span>Explore Everywhere</span>
              </button>


              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin')
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
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
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-display"
              title="Change Currency & Region"
            >
              <Globe className="w-3.5 h-3.5 text-[#00B2D6]" />
              <span>{selectedCountry} • {selectedCurrency} (₹)</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>

            {/* Price Alerts Button */}
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer font-display"
              title="Set Flight Price Alerts"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Price Alerts</span>
            </button>

            {/* Clean Ask AI Button matching background */}
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer font-display shadow-2xs"
              title="Search with Natural Language"
            >
              Ask AI
            </button>

            {/* Dark / Light Toggle */}
            <ThemeToggle className="bg-white/10 hover:bg-white/20 border-white/20 text-white" />

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0062E3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-white truncate max-w-[100px]">
                      {user.name}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0c1322] border border-slate-800 shadow-2xl z-50 p-2 space-y-1 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2.5 border-b border-slate-800">
                        <div className="text-xs font-bold text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 text-indigo-400 font-bold"
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
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-3.5 py-2 rounded-xl text-xs font-bold font-display text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
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
          </div>
        </div>
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
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedCurrency === c.code
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
