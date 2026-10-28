const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_confirmation',
      'cancellation',
      'schedule_change',
      'journey_reminder',
      'promotional'
    ],
    required: true
  },
  channel: {
    type: String,
    enum: ['in_app', 'email', 'push'],
    default: 'in_app'
  },
  status: {
    type: String,
    enum: ['delivered', 'failed', 'retrying'],
    default: 'delivered'
  },
  retryCount: {
    type: Number,
    default: 0
  },
  isRead: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  metadata: {
    bookingId: { type: String },
    routeInfo: { type: String },
    timestamp: { type: Date, default: Date.now }
  }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
