const express = require('express');
const router = express.Router();
const notifController = require('../controller/notification');

// Notifications history & management
router.get('/api/notifications/:userId', notifController.getUserNotifications);
router.post('/api/notifications/send', notifController.sendNotification);
router.put('/api/notifications/:id/read', notifController.markAsRead);
router.put('/api/notifications/read-all/:userId', notifController.markAllAsRead);
router.post('/api/notifications/:id/retry', notifController.retryNotification);

// User notification preferences
router.get('/api/notifications/preferences/:userId', notifController.getPreferences);
router.put('/api/notifications/preferences/:userId', notifController.updatePreferences);

module.exports = router;
