import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plane, Ticket, TrendingUp, ShieldAlert, BarChart3, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AdminStats as AdminStatsType } from '../types';
import { AdminStats } from '../components/admin/AdminStats';
import { FlightManager } from '../components/admin/FlightManager';
import { BookingsTable } from '../components/admin/BookingsTable';
import { FeedbackTable } from '../components/admin/FeedbackTable';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'bookings' | 'feedback'>('overview');
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && (!user || !isAdmin)) {
      navigate('/login?redirect=/admin');
      return;
    }

    if (user && isAdmin) {
      api
        .getAdminStats()
        .then((res: any) => {
          if (res.success && res.data) {
            setStats(res.data);
          }
        })
        .catch((e: any) => console.error(e))
        .finally(() => setIsLoading(false));
    }
  }, [user, isAdmin, isAuthLoading, navigate]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading Administrator Telemetry...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center rounded-3xl bg-white dark:bg-[#0c1322] border border-rose-500/20 space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Administrator Access Required
        </h2>
        <p className="text-xs text-slate-500">
          Sign in with admin credentials (<code>admin@skyhaven.com</code>) to access platform controls.
        </p>
        <Button onClick={() => navigate('/login')} variant="glow">
          Sign In as Administrator
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Telemetry & KPIs', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'flights', label: 'Fleet Schedules (CRUD)', icon: <Plane className="w-4 h-4" /> },
    { id: 'bookings', label: 'Platform Bookings', icon: <Ticket className="w-4 h-4" /> },
    { id: 'feedback', label: 'User Feedback', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-[#0c1322] border border-indigo-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono uppercase font-bold">
              Root Console
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black font-display text-white mt-1">
            SkyHaven Operations & Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time fleet performance, flight dispatch schedules, and customer reservations.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(id: string) => setActiveTab(id as any)} />
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <AdminStats stats={stats.overview} />

          {/* Route Performance Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Top Performing Routes (By Volume)
                  </h3>
                </div>

                <div className="space-y-3">
                  {stats.routePerformance.map((route: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold font-mono">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white font-mono">
                            {route.route}
                          </div>
                          <div className="text-[10px] text-slate-500">{route.airline} • {route.flightNumber}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {route.totalBookings} Bookings
                        </div>
                        <div className="text-[10px] text-emerald-500 font-semibold">
                          ₹{Number(route.basePrice).toLocaleString('en-IN')} base fare
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recent Bookings Stream */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-6 border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display mb-4 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-brand-500" />
                  Recent Customer Stream
                </h3>

                <div className="space-y-3">
                  {stats.recentBookings.slice(0, 5).map((b: any) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                          {b.customerName}
                        </div>
                        <div className="text-[10px] text-brand-500 font-mono">
                          {b.bookingReference} • {b.flightNumber}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Flight Schedules Tab Content */}
      {activeTab === 'flights' && <FlightManager />}

      {/* Platform Bookings Tab Content */}
      {activeTab === 'bookings' && <BookingsTable />}

      {/* User Feedback Tab Content */}
      {activeTab === 'feedback' && <FeedbackTable />}
    </div>
  );
};
