import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  glass = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl transition-all duration-300',
          glass
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
          hoverable &&
            'hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/30 dark:hover:border-brand-500/30',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
