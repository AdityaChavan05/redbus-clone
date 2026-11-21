const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for development and production
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Attach socket.io instance to req so controllers can emit real-time events
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists for community photos
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer storage setup for community travel photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `travel_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Community Photo Upload Endpoint
app.post('/api/community/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename
  });
});

// Import all route modules
const customerRoutes = require('./routes/customer');
const routesRoute = require('./routes/route');
const bookingRoute = require('./routes/booking');
const communityRoute = require('./routes/community');
const routePlannerRoute = require('./routes/routePlanner');
const notificationRoute = require('./routes/notification');
const routeReviewRoute = require('./routes/routeReview');
const busRoute = require('./routes/bus');

// Mount routes
app.use(customerRoutes);
app.use(routesRoute);
app.use(bookingRoute);
app.use(communityRoute);
app.use(routePlannerRoute);
app.use(notificationRoute);
app.use(routeReviewRoute);
app.use(busRoute);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'API is running',
    version: '2.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory-resilient',
    timestamp: new Date()
  });
});

// TedBus Overview & Features Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '2.0.0',
    platform: 'redBus Clone MEAN - Elevance Technologies Internship',
    features: [
      'Task 1: Travel Community Stories, Tips, Forums & Admin Moderation',
      'Task 2: Advanced Real-time Notifications, Push & Multi-language Alerts',
      'Task 3: Interactive Route Planning, Waypoints & Live Traffic Simulation',
      'Task 4: Internationalization (English, Kannada, Hindi)',
      'Task 5: Dynamic Theme (Dark & Light Mode)',
      'Task 6: Verified Route Ratings, Completed Journey Reviews & 24h Lock',
      'Part 2: India-Wide Bus Routes (150+ corridors, 24 Private + 11 State RTCs)'
    ],
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.send('TedBus India-Wide Bus Booking API backend with Tasks 1-6 fully integrated!');
});

// Real-time Socket.IO Connection Handler
io.on('connection', (socket) => {
  // Join user room for targeted notifications
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {});
});

// Periodic live traffic update broadcast every 45 seconds (Task 3)
setInterval(() => {
  const trafficFactor = +(0.8 + Math.random() * 0.8).toFixed(2);
  io.emit('traffic_simulation_tick', {
    trafficFactor,
    timestamp: new Date()
  });
}, 45000);

// Resilient MongoDB connection with fast timeout fallback & automatic seeder
const DBURL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/redbus";
const seedDatabase = require('./seedIndiaWide');

mongoose.connect(DBURL, {
  serverSelectionTimeoutMS: 4000
})
.then(async () => {
  console.log("MongoDB connected successfully to TedBus cluster");
  try {
    await seedDatabase();
  } catch (err) {
    console.warn("Auto-seeder note:", err.message);
  }
})
.catch(err => {
  console.warn("MongoDB local/Atlas connection unavailable. Operating in high-performance in-memory mode:", err.message);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  TedBus PRO MEAN Backend listening on http://localhost:${PORT}`);
  console.log(`  India-Wide Corridors & Tasks 1-6 Active`);
  console.log(`=======================================================`);
});

module.exports = { app, server, io };
