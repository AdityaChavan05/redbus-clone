const SavedRoute = require('../models/savedRoute');

// Built-in coordinate database for Indian cities
const CITY_COORDS = {
  bangalore: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  bengaluru: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  mysore: { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  mysuru: { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  hyderabad: { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  goa: { name: 'Goa (Panaji)', lat: 15.2993, lng: 74.1240 },
  panaji: { name: 'Goa (Panaji)', lat: 15.2993, lng: 74.1240 },
  pune: { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  mumbai: { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  coimbatore: { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  ooty: { name: 'Ooty', lat: 11.4102, lng: 76.6950 },
  vijayawada: { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  visakhapatnam: { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  tirupati: { name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  humnabad: { name: 'Humnabad', lat: 17.7667, lng: 77.1333 }
};

// Calculate Haversine distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// In-memory store for user saved routes
let mockSavedRoutes = [
  {
    _id: 'sr_001',
    userId: '660000000000000000000001',
    routeName: 'Bengaluru to Goa via Hubballi',
    origin: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    destination: { name: 'Goa (Panaji)', lat: 15.2993, lng: 74.1240 },
    waypoints: [{ name: 'Tumakuru', lat: 13.3422, lng: 77.1017 }],
    distanceKm: 560,
    durationMinutes: 580,
    createdAt: new Date()
  }
];

// Dynamic traffic simulation state
let simulatedTrafficFactor = 1.0;

// 1. Calculate main route & alternatives with waypoints and live traffic
exports.planRoute = async (req, res) => {
  try {
    const { origin = 'Bengaluru', destination = 'Goa', waypoints = [] } = req.body;

    const fromKey = origin.toLowerCase().trim();
    const toKey = destination.toLowerCase().trim();

    const start = CITY_COORDS[fromKey] || { name: origin, lat: 12.9716, lng: 77.5946 };
    const end = CITY_COORDS[toKey] || { name: destination, lat: 15.2993, lng: 74.1240 };

    // Resolve waypoint coordinates
    const resolvedWaypoints = (Array.isArray(waypoints) ? waypoints : []).map((wp, idx) => {
      const key = (typeof wp === 'string' ? wp : wp.name || '').toLowerCase().trim();
      const offsetLat = start.lat + (end.lat - start.lat) * ((idx + 1) / (waypoints.length + 1));
      const offsetLng = start.lng + (end.lng - start.lng) * ((idx + 1) / (waypoints.length + 1));
      return CITY_COORDS[key] || {
        name: typeof wp === 'string' ? wp : wp.name || `Stop ${idx + 1}`,
        lat: offsetLat + (idx % 2 === 0 ? 0.15 : -0.15),
        lng: offsetLng + (idx % 2 === 0 ? 0.2 : -0.2)
      };
    });

    // Base distance calculation across waypoints
    let totalBaseKm = 0;
    let prev = start;
    const allStops = [...resolvedWaypoints, end];
    for (const pt of allStops) {
      totalBaseKm += haversineDistance(prev.lat, prev.lng, pt.lat, pt.lng);
      prev = pt;
    }
    if (totalBaseKm < 50) totalBaseKm = 380;

    // Traffic congestion and delay variations
    const primaryDelay = Math.round(15 * simulatedTrafficFactor);
    const primaryTraffic = simulatedTrafficFactor > 1.3 ? 'Heavy' : (simulatedTrafficFactor > 1.0 ? 'Moderate' : 'Low');

    // Route 1: NH National Expressway (Primary Recommended)
    const primaryRoute = {
      id: 'route-nh-expressway',
      name: 'National Expressway (NH Corridor)',
      tag: 'Fastest & Recommended',
      distanceKm: totalBaseKm,
      durationMinutes: Math.round((totalBaseKm / 65) * 60 + primaryDelay),
      trafficLevel: primaryTraffic,
      trafficDelayMin: primaryDelay,
      tollCharges: '₹420',
      roadQuality: '4-6 Lane Divided Highway',
      path: [
        [start.lat, start.lng],
        ...resolvedWaypoints.map(w => [w.lat, w.lng]),
        [end.lat, end.lng]
      ]
    };

    // Route 2: State Highway Bypass (Alternative 1: Low Traffic / Scenic)
    const altDistance = Math.round(totalBaseKm * 1.14);
    const altDelay = 5;
    const alternativeRoute = {
      id: 'route-state-bypass',
      name: 'State Highway Bypass Corridor',
      tag: 'Low Traffic / Toll-Free',
      distanceKm: altDistance,
      durationMinutes: Math.round((altDistance / 68) * 60 + altDelay),
      trafficLevel: 'Low',
      trafficDelayMin: altDelay,
      tollCharges: '₹140',
      roadQuality: 'Scenic State Highway',
      path: [
        [start.lat, start.lng],
        [(start.lat + end.lat) / 2 + 0.35, (start.lng + end.lng) / 2 - 0.45],
        ...resolvedWaypoints.map(w => [w.lat + 0.2, w.lng - 0.2]),
        [end.lat, end.lng]
      ]
    };

    // Route 3: Coastal / Country Highway (Alternative 2: Green Route)
    const scenicDistance = Math.round(totalBaseKm * 1.25);
    const scenicRoute = {
      id: 'route-scenic-corridor',
      name: 'Countryside Scenic Route',
      tag: 'Pleasant & Fewer Delays',
      distanceKm: scenicDistance,
      durationMinutes: Math.round((scenicDistance / 55) * 60),
      trafficLevel: 'Low',
      trafficDelayMin: 0,
      tollCharges: '₹0 (Toll-Free)',
      roadQuality: 'Two-Lane Hill / Coastal Pass',
      path: [
        [start.lat, start.lng],
        [(start.lat + end.lat) / 2 - 0.3, (start.lng + end.lng) / 2 + 0.5],
        [end.lat, end.lng]
      ]
    };

    res.status(200).json({
      start,
      end,
      waypoints: resolvedWaypoints,
      routes: [primaryRoute, alternativeRoute, scenicRoute],
      trafficCondition: primaryTraffic
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Dynamic live traffic update simulation
exports.updateTrafficSimulation = async (req, res) => {
  try {
    // Cycle traffic factor between 0.9 (Light), 1.2 (Moderate), 1.6 (Heavy)
    simulatedTrafficFactor = simulatedTrafficFactor === 1.0 ? 1.5 : (simulatedTrafficFactor === 1.5 ? 0.9 : 1.0);
    const condition = simulatedTrafficFactor >= 1.5 ? 'Heavy Congestion' : (simulatedTrafficFactor >= 1.2 ? 'Moderate Delay' : 'Clear Highway');
    
    res.status(200).json({
      success: true,
      trafficFactor: simulatedTrafficFactor,
      condition,
      message: `Live highway traffic updated: ${condition}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Save route to user profile
exports.saveRoute = async (req, res) => {
  try {
    const { userId = '660000000000000000000001', routeName, origin, destination, waypoints, distanceKm, durationMinutes } = req.body;
    
    const newRoute = {
      _id: 'sr_' + Date.now(),
      userId,
      routeName: routeName || `${origin.name} to ${destination.name}`,
      origin,
      destination,
      waypoints: waypoints || [],
      distanceKm,
      durationMinutes,
      createdAt: new Date()
    };

    try {
      const dbSaved = new SavedRoute(newRoute);
      await dbSaved.save();
    } catch (e) {
      mockSavedRoutes.unshift(newRoute);
    }

    res.status(201).json(newRoute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 4. Get user's saved routes
exports.getSavedRoutes = async (req, res) => {
  try {
    const { userId } = req.params;
    let routes = [];

    try {
      routes = await SavedRoute.find({ userId }).sort({ createdAt: -1 }).lean();
    } catch (e) {}

    if (!routes || routes.length === 0) {
      routes = mockSavedRoutes.filter(r => r.userId === userId || r.userId === '660000000000000000000001');
    }

    res.status(200).json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Delete saved route
exports.deleteSavedRoute = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await SavedRoute.findByIdAndDelete(id);
    } catch (e) {}

    const idx = mockSavedRoutes.findIndex(r => r._id === id);
    if (idx > -1) mockSavedRoutes.splice(idx, 1);

    res.status(200).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};