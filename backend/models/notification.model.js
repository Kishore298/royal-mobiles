const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide notification title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide notification message'],
    trim: true
  },
  type: {
    type: String,
    enum: ['order', 'system', 'alert'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 