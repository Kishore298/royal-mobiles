import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const OrderStatusModal = ({ status, onClose, type }) => {
    if (!status) return null;

    const isSuccess = status === 'success';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full p-8 text-center transform transition-all scale-100">
                <div className={`mx-auto flex items-center justify-center h-24 w-24 rounded-full mb-6 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? (
                        <CheckCircle className="h-16 w-16 text-green-600 animate-bounce" />
                    ) : (
                        <XCircle className="h-16 w-16 text-red-600" />
                    )}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {isSuccess ? 'Order Placed!' : 'Order Failed'}
                </h3>
                <p className="text-gray-600 mb-8">
                    {isSuccess
                        ? 'Your order has been placed successfully. A receipt is downloading...'
                        : 'Something went wrong. Please try again.'}
                </p>
                <button
                    onClick={onClose}
                    className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-colors ${isSuccess
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                            : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                        }`}
                >
                    {isSuccess ? 'Continue Shopping' : 'Close'}
                </button>
            </div>
        </div>
    );
};

export default OrderStatusModal;
