const SavedRoute = require('../models/savedRoute');

// Built-in city coordinates database for route rendering without API key restrictions
const CITY_COORDS = {
  bangalore: { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  mysore: { name: 'Mysore', lat: 12.2958, lng: 76.6394 },
  chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  hyderabad: { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  goa: { name: 'Goa', lat: 15.2993, lng: 74.1240 },
  pune: { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  mumbai: { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  coimbatore: { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  ooty: { name: 'Ooty', lat: 11.4102, lng: 76.6950 }
};

// Calculate approximate great-circle distance
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

// 1. Calculate main route & alternative routes with real-time traffic simulation
exports.planRoute = async (req, res) => {
  try {
    const { origin, destination, waypoints = [] } = req.body;

    const fromKey = (origin || '').toLowerCase().trim();
    const toKey = (destination || '').toLowerCase().trim();

    const start = CITY_COORDS[fromKey] || { name: origin, lat: 12.9716, lng: 77.5946 };
    const end = CITY_COORDS[toKey] || { name: destination, lat: 15.2993, lng: 74.1240 };

    // Resolve waypoint coordinates
    const resolvedWaypoints = waypoints.map(wp => {
      const key = (wp || '').toLowerCase().trim();
      return CITY_COORDS[key] || { name: wp, lat: start.lat + 0.3, lng: start.lng + 0.2 };
    });

    // Base straight calculation
    let totalBaseKm = 0;
    let prev = start;
    for (const pt of [...resolvedWaypoints, end]) {
      totalBaseKm += haversineDistance(prev.lat, prev.lng, pt.lat, pt.lng);
      prev = pt;
    }
    if (totalBaseKm === 0) totalBaseKm = 350;

    // Route 1: Primary Expressway
    const primaryRoute = {
      id: 'route-express',
      name: 'NH National Expressway (Recommended)',
      distanceKm: totalBaseKm,
      durationMinutes: Math.round((totalBaseKm / 65) * 60 + 20),
      trafficLevel: 'Moderate',
      trafficDelayMin: 15,
      tollCharges: '₹420',
      path: [
        [start.lat, start.lng],
        ...resolvedWaypoints.map(w => [w.lat, w.lng]),
        [end.lat, end.lng]
      ]
    };

    // Route 2: Alternative Bypass Route
    const altDistance = Math.round(totalBaseKm * 1.12);
    const alternativeRoute = {
      id: 'route-bypass',
      name: 'State Highway Bypass (Scenic / Low Traffic)',
      distanceKm: altDistance,
      durationMinutes: Math.round((altDistance / 70) * 60 + 5),
      trafficLevel: 'Low',
      trafficDelayMin: 0,
      tollCharges: '₹180',
      path: [
        [start.lat, start.lng],
        [(start.lat + end.lat) / 2 + 0.35, (start.lng + end.lng) / 2 - 0.4],
        [end.lat, end.lng]
      ]
    };

    res.status(200).json({
      start,
      end,
      waypoints: resolvedWaypoints,
      routes: [primaryRoute, alternativeRoute]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Save Route to User Profile
exports.saveRoute = async (req, res) => {
  try {
    const { userId, routeName, origin, destination, waypoints, distanceKm, durationMinutes } = req.body;
    const newSaved = new SavedRoute({
      userId,
      routeName,
      origin,
      destination,
      waypoints,
      distanceKm,
      durationMinutes
    });
    await newSaved.save();
    res.status(201).json(newSaved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 3. Get User's Saved Routes
exports.getSavedRoutes = async (req, res) => {
  try {
    const { userId } = req.params;
    const routes = await SavedRoute.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Delete Saved Route
exports.deleteSavedRoute = async (req, res) => {
  try {
    await SavedRoute.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};