import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
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
    fetchNotifications,
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

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center overflow-y-scroll justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Order Details #{order._id.slice(-6)}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Name: {order.user.name}</p>
                <p>Email: {order.user.email}</p>
                <p>Phone: {order.user.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>{order.user.address.street}</p>
                <p>{order.user.address.city}, {order.user.address.state} {order.user.address.zipCode}</p>
                <p>{order.user.address.country}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              <div className="mt-2 space-y-2">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">₹{order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">₹{order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">₹{order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t">
                <span className="text-gray-900">Total</span>
                <span className="text-primary-600">₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Type: {order.paymentInfo.type.toUpperCase()}</p>
                <p>Status: {order.paymentInfo.status}</p>
                <p>Payment ID: {order.paymentInfo.id}</p>
                <p>Paid: {order.isPaid ? 'Yes' : 'No'}</p>
                {order.paidAt && <p>Paid At: {format(new Date(order.paidAt), 'PPpp')}</p>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>Status: {order.orderStatus}</p>
                <p>Delivered: {order.isDelivered ? 'Yes' : 'No'}</p>
                {order.deliveredAt && <p>Delivered At: {format(new Date(order.deliveredAt), 'PPpp')}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative notification-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 lg:w-80 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification._id);
                      }}
                      className="ml-4 text-gray-400 hover:text-gray-500"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={() => fetchNotifications()}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown; 