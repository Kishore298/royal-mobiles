import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import SearchBar from '../ui/SearchBar';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact-us';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0 ml-[20%] w-[80%] md:w-auto">
        <Header />
        {!isContactPage && (
          <div className="py-2 mt-2 px-4">
            <SearchBar />
          </div>
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 