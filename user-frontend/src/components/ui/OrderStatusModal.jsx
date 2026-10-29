import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

const OrderStatusModal = ({ status, onClose }) => {
  const isSuccess = status === 'success';

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="bg-white dark:bg-[#111914] rounded-3xl max-w-sm w-full p-8 text-center border border-gray-100 dark:border-emerald-950/70 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
              className={`mx-auto flex items-center justify-center h-20 w-20 rounded-2xl mb-6 shadow-md ${
                isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-12 w-12" />
              ) : (
                <XCircle className="h-12 w-12" />
              )}
            </motion.div>

            <h3
              className={`text-2xl font-extrabold mb-2 ${
                isSuccess ? 'text-primary-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isSuccess ? 'Order Confirmed!' : 'Order Failed'}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {isSuccess
                ? 'Thank you for shopping with Royal Mobiles! Your order receipt has been generated and downloaded.'
                : 'Something went wrong while processing your order. Please check your network and try again.'}
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={onClose}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
                isSuccess
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-emerald-500/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
              }`}
            >
              {isSuccess ? 'Continue Shopping' : 'Dismiss'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderStatusModal;
