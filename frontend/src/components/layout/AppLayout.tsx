import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AiSearchDrawer } from '../home/AiSearchDrawer';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className={`flex-1 ${!isHomePage ? 'pt-4 sm:pt-6' : ''}`}>
        <Outlet />
      </main>
      <Footer />
      {/* Global Natural Language AI Drawer */}
      <AiSearchDrawer />
    </div>
  );
};
