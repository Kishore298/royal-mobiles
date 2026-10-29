import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  Filter,
  Eye,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Copy,
  Download,
  MapPin,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { getOrders, updateOrderStatus, getOrder } from '../../services/api';
import { format } from 'date-fns';
import Spinner from '../../components/ui/Spinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const fetchOrders = useCallback(
    async (pageNum) => {
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
    },
    [searchQuery, sortBy, sortOrder, filters, limit]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchOrders(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchOrders(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

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
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
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

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const cleanPhoneForWhatsApp = (rawPhone) => {
    if (!rawPhone) return '';
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            Received
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
            Done
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy • h:mm a');
    } catch (err) {
      return String(date);
    }
  };

  // Generate Styled PDF Receipt
  const generateReceiptPDF = async (orderData, orderId) => {
    const doc = new jsPDF();

    // Brand Header
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74);
    doc.text('Royal Mobiles', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text('Sales & Service • Premium Mobile Accessories', 105, 27, { align: 'center' });

    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.5);
    doc.line(15, 32, 195, 32);

    // Order & Customer Summary
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`Order ID: #${orderId.slice(-6).toUpperCase()}`, 15, 42);
    doc.text(`Full Ref: ${orderId}`, 15, 48);
    doc.text(`Date: ${formatDate(orderData.createdAt)}`, 15, 54);
    doc.text(`Status: ${orderData.orderStatus.toUpperCase()}`, 15, 60);

    doc.text('Bill To & Ship To:', 125, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(orderData.user?.name || 'Customer', 125, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${orderData.user?.phone || 'N/A'}`, 125, 54);
    if (orderData.user?.address) {
      const addr = orderData.user.address;
      doc.text(`${addr.street || ''}`, 125, 60);
      doc.text(`${addr.city || ''}, ${addr.state || ''} - ${addr.zipCode || ''}`, 125, 66);
    }

    // Prepare table rows
    const tableColumn = ['S.No', 'Item', 'Qty', 'Unit Price', 'Total'];
    const tableRows = (orderData.orderItems || []).map((item, idx) => [
      idx + 1,
      item.name,
      item.quantity,
      `Rs. ${Number(item.price).toFixed(2)}`,
      `Rs. ${(Number(item.price) * Number(item.quantity)).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 74,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { valign: 'middle', textColor: [31, 41, 55] },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      },
    });

    const finalY = (doc.lastAutoTable?.finalY || 100) + 10;

    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`Rs. ${(orderData.itemsPrice || orderData.totalPrice).toFixed(2)}`, 190, finalY, { align: 'right' });

    doc.text(`Shipping:`, 140, finalY + 6);
    doc.text(`Rs. ${(orderData.shippingPrice || 0).toFixed(2)}`, 190, finalY + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text(`Total Amount:`, 140, finalY + 14);
    doc.text(`Rs. ${Number(orderData.totalPrice).toFixed(2)}`, 190, finalY + 14, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Thank you for shopping with Royal Mobiles!', 105, finalY + 30, { align: 'center' });
    doc.text('For customer support: +91 63691 22194 | royalmobiles1994@gmail.com', 105, finalY + 35, { align: 'center' });

    doc.save(`Royal_Mobiles_Receipt_${orderId.slice(-6)}.pdf`);
    toast.success('Receipt downloaded successfully');
  };

  // Order Details Modal
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const phone = order.user?.phone || '';
    const cleanedPhone = cleanPhoneForWhatsApp(phone);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="bg-white dark:bg-[#111914] rounded-2xl max-w-2xl w-full border border-gray-100 dark:border-emerald-950/70 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-emerald-950/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-emerald-950/60 text-primary-600 dark:text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  Order #{order._id.slice(-6).toUpperCase()}
                  {getStatusBadge(order.orderStatus)}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateReceiptPDF(order, order._id)}
                className="hidden sm:inline-flex"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Receipt
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#17231c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Customer Information Card */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#16221b] border border-gray-200/70 dark:border-emerald-950/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-600 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {order.user?.name ? order.user.name.slice(0, 2).toUpperCase() : 'CU'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                      {order.user?.name || 'N/A'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.user?.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Quick Call & WhatsApp inside Modal */}
                {phone && (
                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      Call {phone}
                    </a>
                    <a
                      href={`https://wa.me/${cleanedPhone}?text=Hi%20${encodeURIComponent(
                        order.user?.name || ''
                      )},%20regarding%20your%20Royal%20Mobiles%20order%20%23${order._id.slice(-6)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              {order.user?.address && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-emerald-950/60 flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Delivery Address: </span>
                    {order.user.address.street}, {order.user.address.city}, {order.user.address.state} -{' '}
                    {order.user.address.zipCode}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items List */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Ordered Items ({order.orderItems?.length || 0})
              </h3>
              <div className="space-y-2">
                {order.orderItems?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#141f18] border border-gray-100 dark:border-emerald-950/60"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.image?.url ? (
                        <img
                          src={item.image.url}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-contain bg-gray-50 dark:bg-black/40 p-1 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: <span className="font-medium text-gray-700 dark:text-gray-300">{item.quantity}</span>{' '}
                          × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap ml-3">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#16221b] border border-gray-200/70 dark:border-emerald-950/60 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                <span>Items Subtotal:</span>
                <span>₹{(order.itemsPrice || order.totalPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                <span>Shipping:</span>
                <span>₹{(order.shippingPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                <span>Tax:</span>
                <span>₹{(order.taxPrice || 0).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-emerald-950/60 flex justify-between font-extrabold text-base">
                <span className="text-gray-900 dark:text-gray-100">Total Payable:</span>
                <span className="text-primary-600 dark:text-emerald-400">
                  ₹{Number(order.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment & Order Status Control */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#141f18] border border-gray-100 dark:border-emerald-950/60">
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Payment</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
                  {order.paymentInfo?.type || 'COD'} ({order.paymentInfo?.status || 'Pending'})
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Paid: {order.isPaid ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#141f18] border border-gray-100 dark:border-emerald-950/60">
                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Update Status</p>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="w-full text-sm font-semibold py-1.5 px-3 rounded-lg border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-gray-900 dark:text-gray-100 focus:ring-primary-500"
                >
                  <option value="received">Received</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-emerald-950/60 bg-gray-50/50 dark:bg-[#0e1511] flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateReceiptPDF(order, order._id)}
              className="sm:hidden"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Receipt
            </Button>
            <div className="ml-auto">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Orders Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time orders with customer contact and fulfillment actions.
          </p>
        </div>

        {/* Fast Status Tab Filters */}
        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-[#121a15] p-1 rounded-xl border border-gray-200/80 dark:border-emerald-950/70 self-start sm:self-auto">
          {[
            { label: 'All', value: '' },
            { label: 'Received', value: 'received' },
            { label: 'Done', value: 'done' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilters((prev) => ({ ...prev, status: tab.value }));
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filters.status === tab.value
                  ? 'bg-white dark:bg-[#1a271f] text-primary-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search, Sort, Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Universal Search (Order ID, Customer Name, Phone) */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Customer Name, Phone number, or Order ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-950/70 bg-white dark:bg-[#121a15] text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort by Date */}
            <Button
              variant="outline"
              size="md"
              onClick={() => handleSort('createdAt')}
              className="flex-1 sm:flex-none"
            >
              Date
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
              {sortBy === 'createdAt' && (
                <span className="ml-1 text-xs text-primary-600 dark:text-emerald-400 font-bold">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </Button>

            {/* Sort by Total */}
            <Button
              variant="outline"
              size="md"
              onClick={() => handleSort('totalPrice')}
              className="flex-1 sm:flex-none"
            >
              Total
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
              {sortBy === 'totalPrice' && (
                <span className="ml-1 text-xs text-primary-600 dark:text-emerald-400 font-bold">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </Button>

            {/* Filters Toggle Button */}
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filters
            </Button>

            {/* Limit Selector */}
            <div className="flex items-center bg-white dark:bg-[#121a15] px-3 py-2 rounded-xl border border-gray-200 dark:border-emerald-950/70 shadow-sm text-sm">
              <span className="text-gray-500 dark:text-gray-400 text-xs mr-2 font-medium">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-sm font-semibold text-gray-800 dark:text-gray-200 border-none outline-none cursor-pointer p-0 pr-4"
              >
                <option value={25} className="dark:bg-[#121a15]">25</option>
                <option value={50} className="dark:bg-[#121a15]">50</option>
                <option value={100} className="dark:bg-[#121a15]">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Extended Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Min Date
              </label>
              <input
                type="date"
                name="minDate"
                value={filters.minDate}
                onChange={handleFilterChange}
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Max Date
              </label>
              <input
                type="date"
                name="maxDate"
                value={filters.maxDate}
                onChange={handleFilterChange}
                className="w-full text-xs rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ status: '', minDate: '', maxDate: '', minTotal: '', maxTotal: '' });
                  setSearchQuery('');
                  setPage(1);
                }}
                className="w-full text-xs"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Cards List (Customer Name & Phone Prominently Upfront) */}
      <div className="space-y-4">
        {orders.length === 0 && !loading ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No Orders Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Try adjusting your search criteria or date filters.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const customerName = order.user?.name || 'Walk-in / Customer';
            const customerPhone = order.user?.phone || '';
            const cleanedPhone = cleanPhoneForWhatsApp(customerPhone);
            const city = order.user?.address?.city || '';
            const state = order.user?.address?.state || '';

            return (
              <motion.div
                key={order._id}
                whileHover={{ y: -3, scale: 1.004 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:border-primary-400/60 dark:hover:border-emerald-500/50 transition-colors duration-200 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Order ID, Status, Timestamp */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(order._id, 'Order ID copied!')}
                        className="inline-flex items-center text-xs font-mono font-bold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-[#16221b] px-2.5 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#1b2b22] transition-colors"
                        title="Click to copy full ID"
                      >
                        #{order._id.slice(-6).toUpperCase()}
                        <Copy className="w-3 h-3 ml-1.5 text-gray-400" />
                      </motion.button>

                      {getStatusBadge(order.orderStatus)}

                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-auto lg:ml-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {/* UPFRONT CUSTOMER SECTION: Name, Phone, Quick Call/WhatsApp */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#152019] border border-gray-100 dark:border-emerald-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                          {customerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                            {customerName}
                            {city && (
                              <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                                • {city}{state ? `, ${state}` : ''}
                              </span>
                            )}
                          </p>
                          {customerPhone ? (
                            <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
                              📞 {customerPhone}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No phone provided</p>
                          )}
                        </div>
                      </div>

                      {/* Upfront Action Buttons: Call, WhatsApp, Copy Phone */}
                      {customerPhone && (
                        <div className="flex items-center space-x-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-emerald-950/60">
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            href={`tel:${customerPhone}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                            title="Direct Phone Call"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1" />
                            Call
                          </motion.a>

                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            href={`https://wa.me/${cleanedPhone}?text=Hi%20${encodeURIComponent(
                              customerName
                            )},%20regarding%20your%20Royal%20Mobiles%20order%20%23${order._id.slice(-6)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 mr-1" />
                            WhatsApp
                          </motion.a>

                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => copyToClipboard(customerPhone, 'Phone number copied!')}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-[#1a271f] border border-gray-200 dark:border-emerald-950/70 transition-colors"
                            title="Copy Phone Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Order Summary Line: items count & total price */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300 pt-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {order.orderItems?.length || 0} items
                        </span>
                        <span>•</span>
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {order.paymentInfo?.type || 'COD'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1.5">Total:</span>
                        <span className="text-base sm:text-lg font-extrabold text-primary-600 dark:text-emerald-400">
                          ₹{Number(order.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status Change Select & View Details */}
                  <div className="flex items-center justify-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-emerald-950/60 lg:flex-col lg:items-end">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="text-xs font-bold py-2 px-3 rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-gray-50 dark:bg-[#16221b] text-gray-800 dark:text-gray-200 focus:ring-primary-500 shadow-sm cursor-pointer"
                    >
                      <option value="received">Received</option>
                      <option value="done">Done</option>
                    </select>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewOrderDetails(order._id)}
                      className="whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {loading && (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalCount > 0 && orders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-emerald-950/60">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(page * limit, totalCount)}</span> of{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> orders
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs font-semibold px-2 text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Modal Pop-up */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
