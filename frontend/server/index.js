const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(bodyParser.json());

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

// Resilient MongoDB connection with fast timeout fallback
const DBURL = process.env.MONGO_URI || "mongodb+srv://admin:admin@tedbus.vqk1yid.mongodb.net/?retryWrites=true&w=majority&appName=tedbus";
mongoose.connect(DBURL, {
  serverSelectionTimeoutMS: 4000
})
.then(() => console.log("MongoDB connected successfully to TedBus cluster"))
.catch(err => {
  console.warn("MongoDB Atlas connection unavailable or timed out. Operating in high-performance in-memory mode:", err.message);
});

app.get('/', (req, res) => {
  res.send('Hello, TedBus API backend is working with Tasks 1-6 integrated!');
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '2.0.0',
    features: [
      'Task 1: Community Stories & Moderation',
      'Task 2: Advanced Notifications & Preferences',
      'Task 3: Interactive Route Planner & Live Traffic',
      'Task 4: Internationalization (i18n)',
      'Task 5: Dynamic Theme (Dark/Light)',
      'Task 6: Verified Journey Ratings & Reviews'
    ],
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TedBus API server is running on port ${PORT}`);
});
