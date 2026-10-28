const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const reportSchema = new mongoose.Schema({
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

const communityPostSchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  isVerifiedAuthor: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Journey Story'
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Journey Story', 'Travel Tip', 'Destination', 'Route Advice'],
    default: 'Journey Story'
  },
  route: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  likes: [{
    type: String
  }],
  comments: [commentSchema],
  reports: [reportSchema],
  status: {
    type: String,
    enum: ['approved', 'flagged', 'hidden'],
    default: 'approved'
  },
  shares: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  isVerifiedPassenger: {
    type: Boolean,
    default: true
  },
  fraudScore: {
    type: Number,
    default: 0
  },
  fraudFlags: [{
    type: String
  }],
  isFlagged: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);