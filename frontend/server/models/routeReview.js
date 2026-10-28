const mongoose = require('mongoose');

const reviewReportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const routeReviewSchema = new mongoose.Schema({
  routeKey: {
    type: String,
    required: true,
    index: true
  },
  busName: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  bookingId: {
    type: String,
    required: true
  },
  journeyDate: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true,
    minlength: 20
  },
  upvotes: [{
    type: String
  }],
  reports: [reviewReportSchema],
  reportCount: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isVerifiedPassenger: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

routeReviewSchema.index({ routeKey: 1, isHidden: 1, createdAt: -1 });

module.exports = mongoose.model('RouteReview', routeReviewSchema);
