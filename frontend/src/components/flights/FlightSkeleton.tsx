import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const FlightSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="p-6 rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-20 h-3" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 flex-1 max-w-lg">
              <div className="space-y-2">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-12 h-3" />
              </div>
              <Skeleton className="w-32 h-4" />
              <div className="space-y-2">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-12 h-3" />
              </div>
            </div>

            <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3">
              <Skeleton className="w-20 h-7" />
              <Skeleton className="w-28 h-10 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
