import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080c0a] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header Navbar */}
      <Header />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <BottomNav />
    </div>
  );
};

export default Layout;