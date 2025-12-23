import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ArrowUpDown, Filter, Eye, ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { getOrders, updateOrderStatus, getOrder } from '../../services/api';
import { format } from 'date-fns';
import Spinner from '../../components/ui/Spinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    minDate: '',
    maxDate: '',
    minTotal: '',
    maxTotal: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const response = await getOrders({
        page: pageNum,
        limit,
        search: searchQuery,
        sortBy,
        sortOrder,
        ...filters,
      });

      const newOrders = response?.data?.data || [];
      const total = response?.data?.pagination?.total || 0;

      setOrders(newOrders);
      setTotalCount(total);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, sortOrder, filters, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchOrders]); // fetchOrders depends on filter/search/limit

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchOrders(newPage);
  };

  const totalPages = Math.ceil(totalCount / limit);

  const handleSearch = (e) => {
    e.preventDefault();
    // Effect triggers fetch
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      // Refresh list or update local state
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center py-4 lg:py-8 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
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
    <div className="px-2 py-4 lg:px-4 lg:py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {/* Search, Sort, and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
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

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {/* Sort Buttons Group */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleSort('createdAt')}
                className="flex-1 sm:flex-none flex items-center justify-center"
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
                className="flex-1 sm:flex-none flex items-center justify-center"
              >
                Total
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {sortBy === 'totalPrice' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
            </div>

            {/* Filters & Limit Group */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none flex items-center justify-center"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-primary-100 hover:border-primary-400 transition-colors relative min-w-[120px]">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 font-semibold bg-transparent outline-none py-0 pl-1 pr-6 appearance-none w-full"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
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
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-24 h-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
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
                    className="block w-24 md:w-40 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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

        {loading && (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && orders.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, totalCount)}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
              className="flex items-center disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600 px-2">
                Page {page} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
              className="flex items-center disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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