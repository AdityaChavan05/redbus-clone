const express = require('express');
const router = express.Router();
const reviewController = require('../controller/routeReview');

// Reviews retrieval & submission
router.get('/api/reviews/route/:routeKey', reviewController.getRouteReviews);
router.post('/api/reviews', reviewController.createReview);
router.put('/api/reviews/:id', reviewController.updateReview);

// Interactions & Moderation
router.post('/api/reviews/:id/upvote', reviewController.upvoteReview);
router.post('/api/reviews/:id/report', reviewController.reportReview);

// Eligible trips for post-journey review
router.get('/api/reviews/eligible-trips/:userId', reviewController.getEligibleTrips);

module.exports = router;
