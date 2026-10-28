
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redbus';

app.use(cors());
app.use(express.json());

// Bus Route Schema
const BusRouteSchema = new mongoose.Schema({
  operatorname: { type: String, required: true },
  bustype: { type: String, required: true },
  departure: { type: String, required: true, index: true },
  arrival: { type: String, required: true, index: true },
  busdeparturetime: { type: String, required: true },
  busarrivaltime: { type: String, required: true },
  duration: { type: String, required: true },
  seatprice: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  totalratings: { type: Number, default: 500 },
  totalSeatsCapacity: { type: Number, default: 42 },
  seatsRemaining: { type: Number, default: 32 },
  isVolvo: { type: Boolean, default: true },
  isPrimo: { type: Boolean, default: true },
  isFreeCancel: { type: Boolean, default: true },
  category: { type: String, default: 'ac' },
  busFormat: { type: String, default: 'sleeper' },
  boarding_points: [{ type: String }],
  dropping_points: [{ type: String }]
});

const Bus =
  mongoose.models.Bus || mongoose.model('Bus', BusRouteSchema);

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'API is running',
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Search buses
app.get('/api/buses', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is not connected. Please start MongoDB.'
      });
    }

    const from =
      typeof req.query.from === 'string' ? req.query.from.trim() : '';

    const to =
      typeof req.query.to === 'string' ? req.query.to.trim() : '';

    const query = {};

    if (from) {
      query.departure = {
        $regex: `^${escapeRegex(from)}$`,
        $options: 'i'
      };
    }

    if (to) {
      query.arrival = {
        $regex: `^${escapeRegex(to)}$`,
        $options: 'i'
      };
    }

    const buses = await Bus.find(query).limit(100).lean();

    return res.status(200).json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);

    return res.status(500).json({
      message: 'Failed to fetch buses.'
    });
  }
});

// Escape special regex characters in user input
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Start server, even if MongoDB is unavailable
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to Database (MongoDB)');
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    console.error('Check whether MongoDB is installed and running.');
  });
