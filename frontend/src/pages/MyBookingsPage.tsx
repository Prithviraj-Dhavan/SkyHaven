import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Plane,
  Calendar,
  Clock,
  Radio,
  Sparkles,
  Crown,
  Bell,
  BarChart3,
  XCircle,
  Printer,
  Compass,
  ArrowRight,
  TrendingDown,
  Gift
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Booking, Ticket } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { BoardingPass } from '../components/booking/BoardingPass';
import { GlobalFlightRadar } from '../components/dashboard/GlobalFlightRadar';
import { TravelerLoyaltyCard } from '../components/dashboard/TravelerLoyaltyCard';
import { FareWatchlistRadar } from '../components/dashboard/FareWatchlistRadar';
import { TravelStatisticsGrid } from '../components/dashboard/TravelStatisticsGrid';
import { LiveFlightTrackerWidget } from '../components/dashboard/LiveFlightTrackerWidget';

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('radar');
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Full refund in INR will be initiated.')) {
      return;
    }

    setCancellingBookingId(bookingId);
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        alert('Booking cancelled successfully. Refund initiated.');
        loadBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.flight.departureTime) >= now && b.status !== 'CANCELLED'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.flight.departureTime) < now || b.status === 'CANCELLED'
  );

  const activeUpcomingTrip = upcomingBookings[0] || bookings[0];

  const tabs = [
    { id: 'radar', label: 'Live Flight Radar', icon: <Radio className="w-4 h-4" /> },
    { id: 'itineraries', label: `My Trips (${bookings.length})`, icon: <TicketIcon className="w-4 h-4" /> },
    { id: 'loyalty', label: 'SkyMiles & Elite Perks', icon: <Crown className="w-4 h-4" /> },
    { id: 'watchlist', label: 'Fare Drop Watchlist', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'analytics', label: 'Aviation Passport', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Traveler Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0c162d] to-slate-950 border border-brand-500/30 shadow-2xl text-white">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-brand-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Titanium Elite Member
            </span>
            <span className="text-xs font-mono text-slate-400">• 28,450 SkyMiles</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
            Welcome back, {user?.name || 'Traveler'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Track live ADS-B flight telemetry, manage upcoming boarding passes, and redeem SkyMiles perks.
          </p>
        </div>

        {/* Quick Hub Navigation */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/search')}
            variant="glow"
            size="md"
            className="cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Book New Flight
          </Button>
        </div>
      </div>

      {/* Dashboard Section Switcher Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* 1. Global Flight Radar Tab */}
      {activeTab === 'radar' && (
        <div className="space-y-8">
          {/* Live Flight Radar Simulation */}
          <GlobalFlightRadar />

          {/* Active Trip Live Intelligence Widget if active booking exists */}
          {activeUpcomingTrip && (
            <LiveFlightTrackerWidget
              booking={activeUpcomingTrip}
              onViewPass={() => setSelectedBookingForPass(activeUpcomingTrip)}
            />
          )}

          {/* Quick Fare Watcher preview */}
          <FareWatchlistRadar />
        </div>
      )}

      {/* 2. My Itineraries & Boarding Passes Tab */}
      {activeTab === 'itineraries' && (
        <div className="space-y-6">
          {/* Active Trip Widget */}
          {activeUpcomingTrip && (
            <LiveFlightTrackerWidget
              booking={activeUpcomingTrip}
              onViewPass={() => setSelectedBookingForPass(activeUpcomingTrip)}
            />
          )}

          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading your flight records...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <TicketIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                No active reservations found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover lowest fares across 15+ global destinations with instant confirmed seats.
              </p>
              <Button onClick={() => navigate('/search')} variant="glow" size="md">
                Explore Flights
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const depTime = new Date(b.flight.departureTime);
                const arrTime = new Date(b.flight.arrivalTime);

                return (
                  <Card key={b.id} className="p-6 border-slate-200/90 dark:border-slate-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left: Flight Info & Route */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20">
                            PNR: {b.bookingReference}
                          </span>
                          <Badge variant={b.status === 'CONFIRMED' ? 'emerald' : 'rose'}>
                            {b.status}
                          </Badge>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-500">
                            {b.flight.airline} ({b.flight.flightNumber})
                          </span>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-8">
                          <div>
                            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
                              {b.flight.origin.code}
                            </div>
                            <div className="text-xs text-slate-500">{b.flight.origin.city}</div>
                            <div className="text-xs font-mono font-bold text-brand-500 mt-0.5">
                              {depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono text-slate-400">
                              {depTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="w-20 h-[1.5px] bg-slate-300 dark:bg-slate-700 my-1 relative flex items-center justify-center">
                              <Plane className="w-3.5 h-3.5 text-brand-500 rotate-90 absolute" />
                            </div>
                            <span className="text-[9px] uppercase font-bold text-emerald-500">Confirmed</span>
                          </div>

                          <div>
                            <div className="text-2xl font-black font-display text-slate-900 dark:text-white">
                              {b.flight.destination.code}
                            </div>
                            <div className="text-xs text-slate-500">{b.flight.destination.city}</div>
                            <div className="text-xs font-mono font-bold text-brand-500 mt-0.5">
                              {arrTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Passengers & Seats */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">
                          Passengers ({b.tickets.length})
                        </div>
                        <div className="space-y-1">
                          {b.tickets.map((t: Ticket, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-400">
                              <span>{t.passengerName}</span>
                              <span className="font-mono font-bold text-indigo-500">Seat {t.seatNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Total & Actions */}
                      <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Total Paid (INR)</span>
                          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                            ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {b.status === 'CONFIRMED' && (
                            <>
                              <Button
                                onClick={() => setSelectedBookingForPass(b)}
                                variant="glow"
                                size="sm"
                                leftIcon={<TicketIcon className="w-3.5 h-3.5" />}
                              >
                                Boarding Pass
                              </Button>
                              <Button
                                onClick={() => handleCancelBooking(b.id)}
                                variant="ghost"
                                size="sm"
                                isLoading={cancellingBookingId === b.id}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. SkyMiles & Loyalty Privileges Tab */}
      {activeTab === 'loyalty' && (
        <div className="space-y-8">
          <TravelerLoyaltyCard userName={user?.name || 'Prithviraj Sharma'} />
          <TravelStatisticsGrid />
        </div>
      )}

      {/* 4. Fare Watchlist & Price Drop Tab */}
      {activeTab === 'watchlist' && (
        <div className="space-y-8">
          <FareWatchlistRadar />
          <GlobalFlightRadar />
        </div>
      )}

      {/* 5. Aviation Passport & Milestones Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <TravelStatisticsGrid />
          <TravelerLoyaltyCard userName={user?.name || 'Prithviraj Sharma'} />
        </div>
      )}

      {/* Boarding Pass Modal */}
      {selectedBookingForPass && (
        <Modal
          isOpen={!!selectedBookingForPass}
          onClose={() => setSelectedBookingForPass(null)}
          maxWidth="3xl"
          title={`Boarding Passes — Booking ${selectedBookingForPass.bookingReference}`}
        >
          <div className="space-y-6">
            {selectedBookingForPass.tickets.map((ticket: Ticket, idx: number) => (
              <BoardingPass
                key={ticket.id || idx}
                bookingReference={selectedBookingForPass.bookingReference}
                flight={selectedBookingForPass.flight}
                ticket={ticket}
                passengerName={ticket.passengerName}
              />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
