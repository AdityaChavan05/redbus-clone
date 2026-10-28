const express = require('express');
const router = express.Router();
const plannerController = require('../controller/routePlanner');

// Route planning & live traffic
router.post('/api/planner/plan', plannerController.planRoute);
router.get('/api/planner/traffic-update', plannerController.updateTrafficSimulation);

// Saved routes
router.post('/api/planner/save', plannerController.saveRoute);
router.get('/api/planner/saved/:userId', plannerController.getSavedRoutes);
router.delete('/api/planner/saved/:id', plannerController.deleteSavedRoute);

module.exports = router;
