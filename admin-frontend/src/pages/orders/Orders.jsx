import React, { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter, Eye, ShoppingBag, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { getOrders, updateOrderStatus, getOrder } from '../../services/api';
import { format } from 'date-fns';

const Orders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    minDate: '',
    maxDate: '',
    minTotal: '',
    maxTotal: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getOrders({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy,
        sortOrder,
        ...filters,
      });
      
      if (response?.data?.data) {
        setOrders(response.data.data);
        setTotalPages(Math.ceil((response.data.pagination?.total || 0) / itemsPerPage));
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const response = await getOrder(orderId);
      if (response?.data?.data) {
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received':
        return 'bg-orange-100 text-orange-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

  const OrderSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-2 py-4 lg:px-4 lg:py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {/* Search, Sort, and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSort('createdAt')}
              className="flex items-center"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
              {sortBy === 'createdAt' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('totalPrice')}
              className="flex items-center"
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
              {sortBy === 'totalPrice' && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="received">Received</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Date
                </label>
                <input
                  type="date"
                  name="minDate"
                  value={filters.minDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Date
                </label>
                <input
                  type="date"
                  name="maxDate"
                  value={filters.maxDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Total
                </label>
                <input
                  type="number"
                  name="minTotal"
                  value={filters.minTotal}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Total
                </label>
                <input
                  type="number"
                  name="maxTotal"
                  value={filters.maxTotal}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading && orders.length === 0 ? (
          Array(5).fill(0).map((_, index) => (
            <OrderSkeleton key={index} />
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-24 h-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              There are no orders available. Orders will appear here when customers place them.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      Order #{order._id.slice(-6)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.orderItems.length} items • ₹{order.totalPrice.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="block w-40 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="received">Received</option>
                    <option value="done">Done</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => handleViewOrderDetails(order._id)}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders; 