import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import { getOrder } from '../../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotification();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    if (notification.type === 'order' && notification.data?.orderId) {
      try {
        const response = await getOrder(notification.data.orderId);
        if (response?.data?.data) {
          setSelectedOrder(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    }
  };

  return (
    <div className="relative notification-dropdown">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/60 bg-white dark:bg-[#121a15] text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-[#17231c] transition-colors shadow-sm focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0c1410] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#121a15] rounded-2xl shadow-xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-gray-100 dark:border-emerald-950/70 py-2 z-50 overflow-hidden"
          >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-emerald-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 dark:bg-emerald-950 text-primary-600 dark:text-emerald-400 border border-primary-200 dark:border-emerald-800/40">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-emerald-950/40">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                No new notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3.5 hover:bg-gray-50 dark:hover:bg-[#17231c] transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    !notification.read ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium">
                      {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification._id);
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#1f3024] transition-colors"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Order Details modal if triggered from notification */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#121a15] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-emerald-950/70 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Order #{selectedOrder._id.slice(-6)}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#16221b] border border-gray-100 dark:border-emerald-950/60">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedOrder.user?.name}</p>
                <p className="text-gray-600 dark:text-gray-400">{selectedOrder.user?.phone}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {selectedOrder.user?.address?.street}, {selectedOrder.user?.address?.city}
                </p>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-emerald-950/60">
                <span>Total:</span>
                <span className="text-primary-600 dark:text-emerald-400">₹{selectedOrder.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;