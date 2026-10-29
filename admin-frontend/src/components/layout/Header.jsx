import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Layers,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDropdown from '../ui/NotificationDropdown';
import { useNotification } from '../../contexts/NotificationContext';

const Header = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { unreadCount } = useNotification();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
    { label: 'Orders', path: '/orders', icon: ShoppingCart, badge: unreadCount },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Categories', path: '/categories', icon: Package },
    { label: 'Subcategories', path: '/subcategories', icon: Layers },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d0b]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-emerald-950/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-300"></div>
              <img
                src="/royal-logo.png"
                alt="Royal Mobiles"
                className="relative h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-green-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Royal Mobiles
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-emerald-950 text-primary-800 dark:text-emerald-300 border border-primary-200 dark:border-emerald-800/40 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-700/80 dark:text-emerald-400/80 font-semibold -mt-1 hidden sm:block">
                Operations & Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'text-primary-600 dark:text-emerald-400 bg-primary-50 dark:bg-emerald-950/60 shadow-sm font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-[#121a15]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-primary-600 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions: Notifications, Theme Toggle, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Socket Notifications */}
            <NotificationDropdown />

            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* Admin Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-gray-200 dark:border-emerald-950/60 bg-white dark:bg-[#121a15] hover:bg-gray-50 dark:hover:bg-[#17231c] transition-colors shadow-sm focus:outline-none"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-sm font-bold text-xs uppercase">
                  {user?.name ? user.name.slice(0, 2) : <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[100px]">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Master</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#121a15] rounded-2xl shadow-xl border border-gray-100 dark:border-emerald-950/70 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-emerald-950/60">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'admin@royalmobiles.com'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;