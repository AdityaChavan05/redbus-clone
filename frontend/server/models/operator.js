const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['private', 'government'],
    required: true,
    default: 'private'
  },
  state: {
    type: String,
    default: 'All India'
  },
  rating: {
    type: Number,
    default: 4.5
  },
  totalRatings: {
    type: Number,
    default: 1200
  },
  fleetCount: {
    type: Number,
    default: 150
  },
  isPrimo: {
    type: Boolean,
    default: false
  },
  badge: {
    type: String,
    default: ''
  },
  amenitiesOffered: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('BusOperator', operatorSchema);
