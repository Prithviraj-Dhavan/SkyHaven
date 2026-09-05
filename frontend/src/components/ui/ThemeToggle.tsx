import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle dark / light mode"
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xs border ${
        theme === 'dark'
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700 shadow-amber-500/10 hover:rotate-12'
          : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-200 shadow-indigo-500/10 hover:-rotate-12'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300" />
      )}
    </button>
  );
};
