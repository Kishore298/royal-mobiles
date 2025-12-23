const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String
  },
  type: {
    type: String,
    enum: ['low_stock', 'order', 'new_order', 'other'],
    default: 'other'
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed // Store related data like productId, orderId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);