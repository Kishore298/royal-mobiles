const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/order.controller');

// Public routes
router.post('/', createOrder);

// Admin routes
router.get('/', protect, authorize('admin'), getOrders);
router.get('/:id', protect, authorize('admin'), getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

module.exports = router; 