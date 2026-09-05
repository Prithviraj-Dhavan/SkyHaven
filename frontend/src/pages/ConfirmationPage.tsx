import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import { api } from '../services/api';
import { Booking } from '../types';
import { BookingConfirmation } from '../components/booking/BookingConfirmation';
import { Button } from '../components/ui/Button';

export const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lastConfirmedBooking } = useBookingStore();
  const [booking, setBooking] = useState<Booking | null>(lastConfirmedBooking);
  const [isLoading, setIsLoading] = useState(!lastConfirmedBooking);

  useEffect(() => {
    if (!lastConfirmedBooking) {
      const ref = searchParams.get('ref');
      if (ref) {
        api
          .getBookingByRef(ref)
          .then((res: any) => {
            if (res.success && res.data) {
              setBooking(res.data);
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, [lastConfirmedBooking, searchParams]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-400 font-medium">Retrieving confirmed boarding pass...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          No Active Reservation Found
        </h2>
        <p className="text-xs text-slate-500">
          Check your past and upcoming flights in your profile dashboard.
        </p>
        <Button onClick={() => navigate('/my-bookings')} variant="glow">
          Go to My Bookings
        </Button>
      </div>
    );
  }

  return <BookingConfirmation booking={booking} />;
};
