import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCart, updateCartItemQuantity, removeFromCart, createOrder } from '../services/api';
import Spinner from '../components/ui/Spinner';
import OrderStatusModal from '../components/ui/OrderStatusModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // 'success' | 'error' | null

  // Initialize form data from sessionStorage or defaults
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
    const fetchCart = async () => {
      try {
        const cartData = getCart();
        setCart(cartData);
      } catch (err) {
        setError('Failed to load cart');
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Save form data to sessionStorage whenever it changes
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
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = (productId) => {
    try {
      const updatedCart = removeFromCart(productId);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
      console.error('Error removing item:', err);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateReceiptPDF = (orderData, orderId) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74); // Green color
    doc.text('Royal Mobiles', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Order Receipt', 105, 30, { align: 'center' });

    // Order Details
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderId}`, 15, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 50);
    doc.text(`Status: Received`, 15, 55);

    // Customer Details
    doc.text('Bill To:', 130, 45);
    doc.text(orderData.user.name, 130, 50);
    doc.text(orderData.user.phone, 130, 55);
    doc.text(orderData.user.address.street, 130, 60);
    doc.text(`${orderData.user.address.city}, ${orderData.user.address.state} - ${orderData.user.address.zipCode}`, 130, 65);

    // Items Table
    const tableColumn = ["Item", "Quantity", "Price", "Total"];
    const tableRows = orderData.orderItems.map(item => [
      item.name,
      item.quantity,
      `Rs. ${item.price}`,
      `Rs. ${item.price * item.quantity}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.text(`Subtotal: Rs. ${orderData.itemsPrice}`, 140, finalY);
    doc.text(`Total: Rs. ${orderData.totalPrice}`, 140, finalY + 7); // Bold this?

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Thank you for shopping with Royal Mobiles!', 105, finalY + 20, { align: 'center' });
    doc.text('For support: royalmobiles1994@gmail.com', 105, finalY + 25, { align: 'center' });

    doc.save(`Order_Receipt_${orderId}.pdf`);
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
            zipCode: formData.pincode
          }
        },
        orderItems: (Array.isArray(cart) ? cart : []).map(item => ({
          product: item._id.toString(),
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.images?.[0] || { url: '' }
        })),
        itemsPrice: Number(calculateSubtotal()),
        shippingPrice: Number(calculateShipping()),
        taxPrice: Number(calculateTax()),
        totalPrice: Number(calculateTotal()),
        orderStatus: 'received',
        paymentInfo: {
          type: 'cod', // Keeping 'cod' as legacy type or 'others', but functionally 'received'
          status: 'pending',
          id: '',
          update_time: new Date().toISOString()
        },
        isPaid: false,
        isDelivered: false
      };

      const response = await createOrder(orderData);

      // Success Handlers
      setOrderStatus('success');
      generateReceiptPDF(orderData, response.data.data._id);

      setCart([]);
      setShowCheckoutForm(false);
      // Data persists in session explicitly as per user request
      setFormData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      });

    } catch (error) {
      console.error('Checkout error:', error);
      setOrderStatus('error');
      // toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setOrderStatus(null);
    if (orderStatus === 'success') {
      // Redirect or just stay
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-red-500">{error}</p></div>;

  if (cart.length === 0 && orderStatus !== 'success') { // Keep cart view hidden if success modal is showing
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-gray-500">
        <ShoppingCart className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-center mb-6">Looks like you haven't added any items to your cart yet.</p>
        <Link to="/" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Continue Shopping
        </Link>
        <OrderStatusModal status={orderStatus} onClose={handleModalClose} />
      </div>
    );
  }

  return (
    <div className="py-4 lg:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {(Array.isArray(cart) ? cart : []).map((item) => (
              <div key={item._id} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="h-24 w-24 flex-shrink-0">
                  <img
                    src={item.images?.[0]?.url || 'https://placehold.co/150x150'}
                    alt={item.name}
                    className="h-full w-full object-cover rounded-md"
                    onError={(e) => { e.target.src = 'https://placehold.co/150x150'; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Price: ₹{item.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-100">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-100">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeItem(item._id)} className="ml-4 text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">Excluded</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutForm(true)}
                disabled={isLoading}
                className="w-full mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={() => setShowCheckoutForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                  {isLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Modal */}
      <OrderStatusModal status={orderStatus} onClose={handleModalClose} />
    </div>
  );
};

export default Cart; 