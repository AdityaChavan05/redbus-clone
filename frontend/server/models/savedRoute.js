const mongoose = require('mongoose');

const savedRouteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  origin: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  waypoints: [{
    name: String,
    lat: Number,
    lng: Number
  }],
  distanceKm: Number,
  durationMinutes: Number
}, { timestamps: true });

module.exports = mongoose.model('SavedRoute', savedRouteSchema);
