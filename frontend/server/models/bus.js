const mongoose = require('mongoose');

const boardingDropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, default: '' },
  landmark: { type: String, default: '' },
  date: { type: String, default: '' }
}, { _id: false });

const busSchema = new mongoose.Schema({
  operatorname: { type: String, required: true, index: true },
  busname: { type: String, default: 'Super Express' },
  bustype: { type: String, required: true },
  operatorType: { type: String, enum: ['private', 'government'], default: 'private', index: true },
  departure: { type: String, required: true, index: true },
  arrival: { type: String, required: true, index: true },
  busdeparturetime: { type: String, required: true },
  busarrivaltime: { type: String, required: true },
  duration: { type: String, required: true },
  seatprice: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  totalratings: { type: Number, default: 500 },
  totalSeatsCapacity: { type: Number, default: 42 },
  seatsRemaining: { type: Number, default: 28 },
  singleSeats: { type: Number, default: 10 },
  isVolvo: { type: Boolean, default: false },
  isPrimo: { type: Boolean, default: false },
  isFreeCancel: { type: Boolean, default: true },
  category: { type: String, enum: ['ac', 'non-ac'], default: 'ac', index: true },
  busFormat: { type: String, enum: ['sleeper', 'semi-sleeper', 'seater', 'hybrid'], default: 'sleeper', index: true },
  layoutType: { type: String, default: 'volvo-42' },
  superBusBadge: { type: String, default: '' },
  livetracking: { type: Number, default: 1 },
  reschedulable: { type: Number, default: 1 },
  boarding_points: [{ type: String }],
  dropping_points: [{ type: String }],
  boardingStops: [boardingDropSchema],
  droppingStops: [boardingDropSchema],
  amenities: [{
    icon: { type: String, default: '🔌' },
    name: { type: String, default: 'Charging Point' }
  }],
  photos: [{
    baseName: String,
    url: String,
    title: String,
    category: String
  }]
}, { timestamps: true });

// Compound index for fast corridor searches
busSchema.index({ departure: 1, arrival: 1, operatorType: 1 });
busSchema.index({ departure: 1, arrival: 1, seatprice: 1 });
busSchema.index({ departure: 1, arrival: 1, rating: -1 });

module.exports = mongoose.model('Bus', busSchema);
