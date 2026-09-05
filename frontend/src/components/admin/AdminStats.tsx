import React from 'react';
import { DollarSign, Ticket, Plane, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { AdminStats as AdminStatsType } from '../../types';
import { Card } from '../ui/Card';

export const AdminStats: React.FC<{ stats: AdminStatsType['overview'] }> = ({ stats }) => {
  const cards = [
    {
      label: 'Gross Ticket Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      change: '+18.4% vs last month',
      icon: <span className="font-bold text-lg font-mono text-emerald-500">₹</span>,
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    },
    {
      label: 'Total Flight Bookings',
      value: stats.totalBookings.toString(),
      change: `${stats.confirmedBookings} confirmed`,
      icon: <Ticket className="w-5 h-5 text-brand-500" />,
      bg: 'bg-brand-500/10 border-brand-500/20 text-brand-500',
    },
    {
      label: 'Fleet Load Factor',
      value: `${stats.loadFactorPercent}%`,
      change: `${stats.bookedSeats} / ${stats.totalSeats} seats`,
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
    },
    {
      label: 'Active Scheduled Flights',
      value: stats.activeFlights.toString(),
      change: '100% on-time dispatch',
      icon: <Plane className="w-5 h-5 text-sky-500" />,
      bg: 'bg-sky-500/10 border-sky-500/20 text-sky-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c, idx) => (
        <Card key={idx} className="p-6 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {c.label}
            </span>
            <div className={`p-2 rounded-xl border ${c.bg}`}>{c.icon}</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-3">
            {c.value}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">{c.change}</div>
        </Card>
      ))}
    </div>
  );
};
