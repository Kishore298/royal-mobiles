import React from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmationModal = ({ isOpen, onClose, orderDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h2>
          <div className="mb-6">
            <p className="text-gray-600">
              Your order has been successfully placed and the retailer will contact you shortly.
              Please be patient.
            </p>
            <p className="text-gray-600 mt-2">
              Order ID: {orderDetails?.orderId}
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <Link
              to="/contact"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal; 