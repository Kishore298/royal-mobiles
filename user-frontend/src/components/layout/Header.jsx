import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ThemeToggle from '../ui/ThemeToggle';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();

  const cartItemCount = cart?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Categories', path: '/' },
    { label: 'All Products', path: '/all-products' },
    { label: 'Subcategories', path: '/all-subcategories' },
    { label: 'Contact Us', path: '/contact-us' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090d0b]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-emerald-950/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Name */}
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
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-green-300 dark:to-teal-300 bg-clip-text text-transparent">
                Royal Mobiles
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-700/80 dark:text-emerald-400/80 font-semibold -mt-1 hidden sm:block">
                Premium Accessories
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium cases, chargers, audio..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-emerald-950/70 bg-gray-50/70 dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-[#15231a] transition-all duration-200"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-600 dark:text-emerald-400 bg-primary-50 dark:bg-emerald-950/50 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-[#121a15]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions: Search Trigger (Mobile), Theme Toggle, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#15231a] transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Dark/Light Mode Switch */}
            <ThemeToggle />

            {/* Shopping Cart Pill */}
            <Link
              to="/cart"
              className="relative flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all duration-200 group"
            >
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline font-semibold text-sm">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-white text-primary-700 dark:bg-emerald-300 dark:text-emerald-950 text-xs font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 dark:border-emerald-950/50 animate-fadeIn">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-gray-50 dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;