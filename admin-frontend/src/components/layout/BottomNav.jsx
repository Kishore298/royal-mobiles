import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Layers,
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

const BottomNav = () => {
  const { unreadCount } = useNotification();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
    { label: 'Orders', path: '/orders', icon: ShoppingCart, badge: unreadCount },
    { label: 'Products', path: '/products', icon: Boxes },
    { label: 'Categories', path: '/categories', icon: Package },
    { label: 'Subcategories', path: '/subcategories', icon: Layers },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0c1410]/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-emerald-950/70 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 group ${
                  isActive
                    ? 'text-primary-600 dark:text-emerald-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-full flex flex-col items-center justify-center relative py-1"
                >
                  {/* Sliding Glowing Pill Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="adminActiveTabIndicator"
                      className="absolute inset-x-1 inset-y-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/40 shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}

                  <div className="relative z-10">
                    <div
                      className={`p-1 rounded-xl transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {item.badge > 0 && (
                      <motion.span
                        key={item.badge}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-1 -right-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center ring-2 ring-white dark:ring-[#0c1410] shadow-sm"
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </motion.span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full z-10">
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
