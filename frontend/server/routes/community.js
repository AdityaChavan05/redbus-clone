const express = require('express');
const router = express.Router();
const communityController = require('../controller/community');

// Posts listing & creation
router.get('/api/community', communityController.getPosts);
router.get('/api/community/posts', communityController.getPosts);
router.post('/api/community', communityController.createPost);
router.post('/api/community/posts', communityController.createPost);

// Interactions
router.post('/api/community/posts/:postId/like', communityController.toggleLike);
router.post('/api/community/:postId/like', communityController.toggleLike);
router.post('/api/community/posts/:postId/comments', communityController.addComment);
router.post('/api/community/:postId/comments', communityController.addComment);
router.post('/api/community/posts/:postId/report', communityController.reportPost);
router.post('/api/community/posts/:postId/share', communityController.trackShare);

// Moderation & Admin
router.get('/api/community/moderation', communityController.getModerationQueue);
router.post('/api/community/moderate/:postId', communityController.moderatePost);

// Profile activity
router.get('/api/community/activity/:userId', communityController.getUserActivity);

module.exports = router;