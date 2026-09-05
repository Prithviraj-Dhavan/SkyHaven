import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center mx-auto">
          <Plane className="w-8 h-8 -rotate-45" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white">
            404 — Flight Off Course
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            The destination or route you requested does not exist on the SkyHaven flight matrix.
          </p>
        </div>
        <Link to="/">
          <Button variant="glow" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Radar & Flights
          </Button>
        </Link>
      </div>
    </div>
  );
};
