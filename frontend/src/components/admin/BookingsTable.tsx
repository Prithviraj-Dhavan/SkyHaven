import React, { useState, useEffect } from 'react';
import { Ticket, DollarSign, Calendar, User, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../ui/Badge';

export const BookingsTable: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminBookings(1, 50);
      if (res.success && res.data) {
        setBookings(res.data.bookings);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            Live Platform Bookings ({bookings.length})
          </h3>
          <p className="text-xs text-slate-500">Real-time inspection of customer reservations and payments.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">Reference</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Flight & Route</th>
              <th className="p-4">Passengers & Seats</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                  Loading reservations...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                  No reservations recorded yet.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-brand-500">
                    {b.bookingReference}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white">{b.customerName}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{b.customerEmail}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="font-mono text-xs font-bold text-brand-500">{b.flightNumber}</span>
                    <span className="text-slate-400 text-[11px] block">{b.route}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {b.passengers.map((p: string, i: number) => (
                      <div key={i} className="text-[11px] font-medium">{p}</div>
                    ))}
                  </td>
                  <td className="p-4 font-bold font-mono text-slate-900 dark:text-white">
                    ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <Badge variant={b.status === 'CONFIRMED' ? 'emerald' : b.status === 'CANCELLED' ? 'rose' : 'amber'}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-[11px] font-semibold text-slate-900 dark:text-white">
                      {b.paymentStatus}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">
                      {b.paymentMethod}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
