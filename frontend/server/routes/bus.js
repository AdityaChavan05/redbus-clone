const express = require('express');
const router = express.Router();
const Bus = require('../models/bus');
const BusOperator = require('../models/operator');
const { OPERATORS, ALL_BUSES_DATASET, CITY_STOPS, CORRIDOR_SPECS } = require('../data/indiaWideDataset');

// Escape special regex characters in user search inputs
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper to convert HH:mm string to minutes from midnight
function timeToMinutes(tStr) {
  if (!tStr) return 0;
  const match = tStr.match(/(\d+):(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

// 1. Search & Filter India-wide Buses
router.get('/api/buses', async (req, res) => {
  try {
    const from = (req.query.from || req.query.departure || '').trim();
    const to = (req.query.to || req.query.arrival || '').trim();
    const date = (req.query.date || '').trim();
    const operator = (req.query.operator || '').trim();
    const operatorType = (req.query.operatorType || '').trim(); // 'private' or 'government'
    const category = (req.query.category || '').toLowerCase().trim(); // 'ac' or 'non-ac'
    const busFormat = (req.query.busFormat || req.query.format || '').toLowerCase().trim(); // 'sleeper', 'seater', etc.
    const sortBy = (req.query.sortBy || req.query.sort || '').toLowerCase().trim();
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || Infinity;
    const timeFilter = (req.query.time || '').toLowerCase().trim(); // 'morning', 'afternoon', 'evening', 'night'

    let buses = [];

    // Try querying MongoDB first
    try {
      const mongoQuery = {};
      if (from) {
        mongoQuery.departure = { $regex: new RegExp(escapeRegex(from), 'i') };
      }
      if (to) {
        mongoQuery.arrival = { $regex: new RegExp(escapeRegex(to), 'i') };
      }
      if (operator) {
        mongoQuery.operatorname = { $regex: new RegExp(escapeRegex(operator), 'i') };
      }
      if (operatorType) {
        mongoQuery.operatorType = operatorType;
      }
      if (category && (category === 'ac' || category === 'non-ac')) {
        mongoQuery.category = category;
      }
      if (busFormat) {
        mongoQuery.busFormat = { $regex: new RegExp(escapeRegex(busFormat), 'i') };
      }

      const dbResults = await Bus.find(mongoQuery).lean().exec();
      if (dbResults && dbResults.length > 0) {
        buses = dbResults;
      }
    } catch (dbErr) {
      // In-memory fallback
    }

    // If MongoDB returned no results or was offline, query the in-memory dataset
    if (buses.length === 0) {
      buses = ALL_BUSES_DATASET.filter(bus => {
        if (from && !bus.departure.toLowerCase().includes(from.toLowerCase())) {
          return false;
        }
        if (to && !bus.arrival.toLowerCase().includes(to.toLowerCase())) {
          return false;
        }
        if (operator && !bus.operatorname.toLowerCase().includes(operator.toLowerCase())) {
          return false;
        }
        if (operatorType && bus.operatorType !== operatorType) {
          return false;
        }
        if (category && bus.category !== category) {
          return false;
        }
        if (busFormat && !bus.busFormat.toLowerCase().includes(busFormat)) {
          return false;
        }
        return true;
      });
    }

    // If the user searches for any custom city pair that has no seeded corridor, dynamically generate realistic services
    if (buses.length === 0 && from && to) {
      const fromStops = CITY_STOPS[from] || [`${from} Central Bus Station`, `${from} Highway Bypass`];
      const toStops = CITY_STOPS[to] || [`${to} Main Bus Terminal`, `${to} City Bypass`];

      // Automatically assign KSRTC for Karnataka, MSRTC for Maharashtra, etc., along with VRL and NueGo
      const dynamicOps = [
        from.toLowerCase().includes('bengaluru') || to.toLowerCase().includes('bengaluru')
          ? { name: 'KSRTC Karnataka', type: 'government', rating: 4.9, badge: 'Airavat Club Class' }
          : { name: 'VRL Travels', type: 'private', rating: 4.8, badge: 'Volvo 9600 Multi-Axle' },
        { name: 'IntrCity SmartBus', type: 'private', rating: 4.8, badge: 'Lounge Access' },
        { name: 'NueGo Electric', type: 'private', rating: 4.7, badge: 'Green Electric' },
        { name: 'SRS Travels', type: 'private', rating: 4.5, badge: 'Executive Sleeper' }
      ];

      buses = dynamicOps.map((op, idx) => ({
        _id: `dyn_bus_${idx}_${Date.now()}`,
        operatorname: op.name,
        busname: `${op.name} Express`,
        bustype: idx === 0 ? 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)' : 'BharatBenz AC Sleeper (2+1)',
        operatorType: op.type,
        departure: from,
        arrival: to,
        busdeparturetime: idx === 0 ? '21:00' : (idx === 1 ? '22:15' : '19:30'),
        busarrivaltime: idx === 0 ? '07:00' : (idx === 1 ? '08:15' : '05:30'),
        duration: '10h 00m',
        seatprice: 1150 + idx * 250,
        rating: op.rating,
        totalratings: 1800 + idx * 400,
        totalSeatsCapacity: 36,
        seatsRemaining: 24,
        singleSeats: 8,
        isVolvo: idx === 0,
        isPrimo: true,
        isFreeCancel: true,
        category: 'ac',
        busFormat: 'sleeper',
        layoutType: 'sleeper-36',
        superBusBadge: op.badge,
        livetracking: 1,
        reschedulable: 1,
        boarding_points: fromStops,
        dropping_points: toStops,
        boardingStops: fromStops.map((name, sIdx) => ({ name, time: `09:${sIdx * 20} PM`, landmark: 'Central Stop', date: 'Today' })),
        droppingStops: toStops.map((name, sIdx) => ({ name, time: `06:${sIdx * 20} AM`, landmark: 'Terminal Gate', date: 'Tomorrow' })),
        amenities: [
          { icon: '🛏️', name: 'Blanket & Pillow' },
          { icon: '🔌', name: 'USB Charging Point' },
          { icon: '📍', name: 'Live GPS Tracking' }
        ]
      }));
    }

    // Apply Price Filtering
    buses = buses.filter(b => b.seatprice >= minPrice && b.seatprice <= maxPrice);

    // Apply Time Filtering
    if (timeFilter) {
      buses = buses.filter(b => {
        const mins = timeToMinutes(b.busdeparturetime);
        if (timeFilter === 'morning') return mins >= 360 && mins < 720; // 06:00 - 12:00
        if (timeFilter === 'afternoon') return mins >= 720 && mins < 1080; // 12:00 - 18:00
        if (timeFilter === 'evening') return mins >= 1080 && mins < 1440; // 18:00 - 24:00
        if (timeFilter === 'night') return mins < 360; // 00:00 - 06:00
        return true;
      });
    }

    // Apply Sorting
    if (sortBy === 'price_asc') {
      buses.sort((a, b) => a.seatprice - b.seatprice);
    } else if (sortBy === 'price_desc') {
      buses.sort((a, b) => b.seatprice - a.seatprice);
    } else if (sortBy === 'rating_desc') {
      buses.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'departure_asc') {
      buses.sort((a, b) => timeToMinutes(a.busdeparturetime) - timeToMinutes(b.busdeparturetime));
    }

    // Format for both RedBus response conventions: array or { buses: [...] }
    return res.status(200).json({
      success: true,
      totalCount: buses.length,
      buses: buses,
      from,
      to,
      date: date || new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bus listings',
      error: error.message
    });
  }
});

// 2. Get Single Bus Details by ID
router.get('/api/buses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let bus = null;

    try {
      bus = await Bus.findById(id).lean().exec();
    } catch (e) {}

    if (!bus) {
      bus = ALL_BUSES_DATASET.find(b => b._id === id);
    }

    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    return res.json(bus);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get All Operators (Categorized: Private vs Government)
router.get('/api/operators', async (req, res) => {
  try {
    const type = req.query.type; // 'private' or 'government'
    let ops = [];

    try {
      const q = type ? { type } : {};
      ops = await BusOperator.find(q).lean().exec();
    } catch (e) {}

    if (!ops || ops.length === 0) {
      ops = type ? OPERATORS.filter(o => o.type === type) : OPERATORS;
    }

    return res.json(ops);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Get Indian Cities & Corridors Autocomplete
router.get('/api/cities', (req, res) => {
  const cities = Object.keys(CITY_STOPS).sort();
  return res.json({
    cities,
    popularCorridors: CORRIDOR_SPECS
  });
});

// 5. Get Popular Routes list
router.get('/api/routes', (req, res) => {
  return res.json(CORRIDOR_SPECS);
});

module.exports = router;
