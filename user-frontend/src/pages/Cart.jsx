import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCart, updateCartItemQuantity, removeFromCart, createOrder } from '../services/api';
import Spinner from '../components/ui/Spinner';
import OrderStatusModal from '../components/ui/OrderStatusModal';
import Button from '../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem('checkoutFormData');
    return savedData ? JSON.parse(savedData) : {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    };
  });

  useEffect(() => {
    const fetchCart = () => {
      try {
        const cartData = getCart();
        setCart(cartData);
      } catch (err) {
        console.error('Error fetching cart:', err);
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const updatedCart = updateCartItemQuantity(productId, newQuantity);
      setCart(updatedCart);
      toast.success('Quantity updated');
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = (productId) => {
    try {
      const updatedCart = removeFromCart(productId);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const calculateSubtotal = () => {
    return (Array.isArray(cart) ? cart : []).reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateShipping = () => 0;
  const calculateTax = () => 0;

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateReceiptPDF = (orderData, orderId) => {
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

    // Order & Customer Details
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`Order ID: #${orderId.slice(-6).toUpperCase()}`, 15, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 48);
    doc.text(`Status: RECEIVED`, 15, 54);

    doc.text('Deliver To:', 125, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(orderData.user.name, 125, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${orderData.user.phone}`, 125, 54);
    doc.text(`${orderData.user.address.street}`, 125, 60);
    doc.text(`${orderData.user.address.city}, ${orderData.user.address.state} - ${orderData.user.address.zipCode}`, 125, 66);

    const tableColumn = ['S.No', 'Item', 'Qty', 'Unit Price', 'Total'];
    const tableRows = orderData.orderItems.map((item, idx) => [
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
    doc.text(`Rs. ${Number(orderData.itemsPrice).toFixed(2)}`, 190, finalY, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text(`Total Amount:`, 140, finalY + 10);
    doc.text(`Rs. ${Number(orderData.totalPrice).toFixed(2)}`, 190, finalY + 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Thank you for shopping with Royal Mobiles!', 105, finalY + 25, { align: 'center' });
    doc.text('Customer Support: +91 63691 22194 | royalmobiles1994@gmail.com', 105, finalY + 30, { align: 'center' });

    doc.save(`Royal_Mobiles_Receipt_${orderId.slice(-6)}.pdf`);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const orderData = {
        user: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            country: 'India',
            zipCode: formData.pincode,
          },
        },
        orderItems: (Array.isArray(cart) ? cart : []).map((item) => ({
          product: item._id.toString(),
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.images?.[0] || { url: '' },
        })),
        itemsPrice: Number(calculateSubtotal()),
        shippingPrice: Number(calculateShipping()),
        taxPrice: Number(calculateTax()),
        totalPrice: Number(calculateTotal()),
        orderStatus: 'received',
        paymentInfo: {
          type: 'cod',
          status: 'pending',
          id: '',
          update_time: new Date().toISOString(),
        },
        isPaid: false,
        isDelivered: false,
      };

      const response = await createOrder(orderData);

      setOrderStatus('success');
      generateReceiptPDF(orderData, response.data.data._id);
      setCart([]);
      setShowCheckoutForm(false);
    } catch (error) {
      console.error('Checkout error:', error);
      setOrderStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setOrderStatus(null);
    if (orderStatus === 'success') {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (cart.length === 0 && orderStatus !== 'success') {
    return (
      <div className="max-w-md mx-auto p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#121a15] border border-gray-100 dark:border-emerald-950/70 shadow-sm animate-fadeIn my-8">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-50 dark:bg-emerald-950/60 text-primary-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Looks like you haven't added any accessories to your bag yet. Check out our latest arrivals!
        </p>
        <Link
          to="/"
          className="w-full inline-flex items-center justify-center py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          Explore Categories
        </Link>
        <OrderStatusModal status={orderStatus} onClose={handleModalClose} />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto py-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review your chosen accessories before proceeding to checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Cart Line Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence initial={false}>
            {(Array.isArray(cart) ? cart : []).map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm flex items-center space-x-4 overflow-hidden"
              >
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gray-50 dark:bg-[#16221b] p-2 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={item.images?.[0]?.url || 'https://placehold.co/150x150'}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/150x150';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary-600 dark:text-emerald-400 mt-0.5">
                    ₹{Number(item.price).toFixed(2)} each
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity Stepper */}
                    <div className="flex items-center space-x-2 bg-gray-50 dark:bg-[#16221b] rounded-xl p-1 border border-gray-200/60 dark:border-emerald-950/60">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-[#111914] rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1f3024] active:scale-95 transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </motion.button>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 w-6 text-center select-none">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-[#111914] rounded-lg shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1f3024] active:scale-95 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </motion.button>
                    </div>

                    {/* Line Total & Remove */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => removeItem(item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f3024] transition-colors"
                        title="Remove from Cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm sticky top-28 space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider pb-3 border-b border-gray-100 dark:border-emerald-950/60">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ₹{calculateSubtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                <span>Estimated Delivery:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Standard Shipping
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-emerald-950/60 flex justify-between items-baseline font-extrabold text-base">
                <span className="text-gray-900 dark:text-gray-100">Total:</span>
                <span className="text-xl font-extrabold text-primary-600 dark:text-emerald-400">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCheckoutForm(true)}
              className="w-full text-sm font-bold shadow-md shadow-emerald-500/20"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="pt-3 border-t border-gray-100 dark:border-emerald-950/60 flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Safe & Secure Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal Form */}
      <AnimatePresence>
        {showCheckoutForm && (
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
              className="bg-white dark:bg-[#111914] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gray-100 dark:border-emerald-950/70 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                  Shipping Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Total Payable on Delivery: <span className="font-bold text-primary-600 dark:text-emerald-400">₹{calculateTotal().toFixed(2)}</span>
                </p>
              </div>
              <button
                onClick={() => setShowCheckoutForm(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Kishore Kumar"
                  className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. kishore@gmail.com"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  placeholder="Door number, street name, landmark..."
                  className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2.5 px-3 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="State"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    placeholder="Pincode"
                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-emerald-950/70 bg-white dark:bg-[#16221b] text-slate-900 dark:text-slate-100 py-2 px-3 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckoutForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                >
                  Confirm & Place Order (COD)
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Confirmation Modal */}
      <OrderStatusModal status={orderStatus} onClose={handleModalClose} />
    </div>
  );
};

export default Cart;