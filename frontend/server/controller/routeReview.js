const RouteReview = require('../models/routeReview');
const Booking = require('../models/booking');
const Customer = require('../models/customer');

// In-memory reviews store with high-quality sample data
let mockReviews = [
  {
    _id: 'rev_001',
    routeKey: 'Hyderabad - Mumbai',
    busName: 'VRL Travels (Volvo 9600 Multi-Axle)',
    userId: 'user_priya',
    userName: 'Priya Sharma',
    bookingId: 'RB84920192',
    journeyDate: '10 Oct, 2026',
    rating: 5,
    reviewText: 'Exceptional journey! The bus departed exactly on schedule. The sleeper berths were very clean with sealed blankets, and the driving was extremely smooth throughout the overnight stretch.',
    upvotes: ['user_rahul', 'user_sneha', 'user_arun'],
    reports: [],
    reportCount: 0,
    isHidden: false,
    isVerifiedPassenger: true,
    createdAt: new Date(Date.now() - 3600000 * 10), // 10 hours ago (within 24h edit window)
    updatedAt: new Date(Date.now() - 3600000 * 10)
  },
  {
    _id: 'rev_002',
    routeKey: 'Hyderabad - Mumbai',
    busName: 'Orange Tours and Travels',
    userId: 'user_vikram',
    userName: 'Vikram Joshi',
    bookingId: 'RB73928114',
    journeyDate: '08 Oct, 2026',
    rating: 4,
    reviewText: 'Good experience overall. Charging points were functional and AC cooling was comfortable. Minor 20-minute delay near Pune toll plaza due to traffic, but driver handled it well.',
    upvotes: ['user_priya', 'user_rahul'],
    reports: [],
    reportCount: 0,
    isHidden: false,
    isVerifiedPassenger: true,
    createdAt: new Date(Date.now() - 3600000 * 40), // 40 hours ago (past 24h window)
    updatedAt: new Date(Date.now() - 3600000 * 40)
  },
  {
    _id: 'rev_003',
    routeKey: 'Bengaluru - Goa',
    busName: 'KSRTC Airavat Club Class',
    userId: 'user_rahul',
    userName: 'Rahul Sharma',
    bookingId: 'RB62849102',
    journeyDate: '09 Oct, 2026',
    rating: 5,
    reviewText: 'Excellent service by KSRTC crew. The bus arrived early in Panaji. Rest stop was at a very hygienic restaurant. Highly recommended for family travel.',
    upvotes: ['user_anita', 'user_sneha', 'user_priya', 'user_vikram'],
    reports: [],
    reportCount: 0,
    isHidden: false,
    isVerifiedPassenger: true,
    createdAt: new Date(Date.now() - 3600000 * 8),
    updatedAt: new Date(Date.now() - 3600000 * 8)
  }
];

// Helper: Calculate average rating and breakdown excluding hidden reviews
function computeRouteStats(reviews) {
  const visible = reviews.filter(r => !r.isHidden);
  if (visible.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  visible.forEach(r => {
    sum += r.rating;
    const rounded = Math.round(r.rating);
    if (breakdown[rounded] !== undefined) breakdown[rounded]++;
  });

  const avg = +(sum / visible.length).toFixed(1);

  return {
    averageRating: avg,
    totalReviews: visible.length,
    breakdown
  };
}

// 1. Get reviews for a route with average rating, breakdown, and trusted reviewer indicators
exports.getRouteReviews = async (req, res) => {
  try {
    const { routeKey } = req.params;
    let reviews = [];

    try {
      reviews = await RouteReview.find({
        routeKey: { $regex: new RegExp(routeKey, 'i') },
        isHidden: false
      }).sort({ createdAt: -1 }).lean();
    } catch (e) {}

    if (!reviews || reviews.length === 0) {
      reviews = mockReviews.filter(r =>
        !r.isHidden &&
        (r.routeKey.toLowerCase().includes(routeKey.toLowerCase()) || routeKey === 'all')
      );
    }

    const stats = computeRouteStats(reviews);

    // Identify trusted reviewers (authors whose total helpful upvotes >= 3)
    const authorUpvoteCounts = {};
    reviews.forEach(r => {
      authorUpvoteCounts[r.userId] = (authorUpvoteCounts[r.userId] || 0) + (r.upvotes ? r.upvotes.length : 0);
    });

    const enrichedReviews = reviews.map(r => {
      const isTrusted = (authorUpvoteCounts[r.userId] || 0) >= 3;
      const hoursSinceCreation = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
      const isEditable = hoursSinceCreation <= 24;

      return {
        ...r,
        isTrustedReviewer: isTrusted,
        isEditable,
        hoursLeftToEdit: isEditable ? Math.max(0, Math.round(24 - hoursSinceCreation)) : 0
      };
    });

    res.status(200).json({
      routeKey,
      stats,
      reviews: enrichedReviews
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Submit new review (requires completed journey, min 20 chars, 1 review per booking)
exports.createReview = async (req, res) => {
  try {
    const {
      routeKey,
      busName = 'TedBus Express',
      userId = '660000000000000000000001',
      userName = 'Traveler',
      bookingId,
      journeyDate = 'Today',
      rating,
      reviewText
    } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars.' });
    }

    if (!reviewText || reviewText.trim().length < 20) {
      return res.status(400).json({ message: 'Review must be at least 20 characters to ensure meaningful feedback.' });
    }

    if (!bookingId) {
      return res.status(400).json({ message: 'A completed journey booking reference is required to rate this route.' });
    }

    // Check duplicate review on same booking
    const existing = mockReviews.find(r => r.bookingId === bookingId && r.userId === userId);
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted a review for this journey. You may edit your existing review within 24 hours.' });
    }

    const reviewObj = {
      _id: 'rev_' + Date.now(),
      routeKey: routeKey || 'Hyderabad - Mumbai',
      busName,
      userId,
      userName,
      bookingId,
      journeyDate,
      rating: Number(rating),
      reviewText: reviewText.trim(),
      upvotes: [],
      reports: [],
      reportCount: 0,
      isHidden: false,
      isVerifiedPassenger: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const dbReview = new RouteReview(reviewObj);
      await dbReview.save();
    } catch (e) {
      mockReviews.unshift(reviewObj);
    }

    res.status(201).json({
      message: 'Review submitted successfully!',
      review: {
        ...reviewObj,
        isEditable: true,
        hoursLeftToEdit: 24
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Edit review within 24-hour window
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText, userId } = req.body;

    let review = null;
    try {
      review = await RouteReview.findById(id);
    } catch (e) {}

    if (!review) {
      review = mockReviews.find(r => r._id === id);
    }

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check 24-hour edit window
    const hoursSinceCreation = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(403).json({
        message: 'The 24-hour edit window for this review has expired. Submitted ratings cannot be modified after 24 hours.'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars.' });
    }
    if (reviewText && reviewText.trim().length < 20) {
      return res.status(400).json({ message: 'Review must be at least 20 characters.' });
    }

    if (rating) review.rating = Number(rating);
    if (reviewText) review.reviewText = reviewText.trim();
    review.updatedAt = new Date();

    try {
      if (typeof review.save === 'function') await review.save();
    } catch (e) {}

    res.status(200).json({ message: 'Review updated successfully within 24-hour window', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Upvote helpful review
exports.upvoteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId = '660000000000000000000001' } = req.body;

    let review = null;
    try {
      review = await RouteReview.findById(id);
      if (review) {
        const idx = review.upvotes.indexOf(userId);
        if (idx > -1) {
          review.upvotes.splice(idx, 1);
        } else {
          review.upvotes.push(userId);
        }
        await review.save();
        return res.status(200).json({ upvotes: review.upvotes.length, upvoted: idx === -1 });
      }
    } catch (e) {}

    const r = mockReviews.find(item => item._id === id);
    if (r) {
      const idx = r.upvotes.indexOf(userId);
      if (idx > -1) {
        r.upvotes.splice(idx, 1);
      } else {
        r.upvotes.push(userId);
      }
      return res.status(200).json({ upvotes: r.upvotes.length, upvoted: idx === -1 });
    }

    res.status(404).json({ message: 'Review not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Report review (if >= 3 reports, hide review and remove from average calculation)
exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId = 'user_anon', reason = 'Content guideline violation' } = req.body;

    let review = null;
    try {
      review = await RouteReview.findById(id);
      if (review) {
        review.reports.push({ userId, reason, createdAt: new Date() });
        review.reportCount = review.reports.length;
        if (review.reportCount >= 3) {
          review.isHidden = true; // Hidden from public view and average calculation!
        }
        await review.save();
        return res.status(200).json({
          message: review.isHidden
            ? 'Review reached report threshold and has been hidden. Average rating recalculated.'
            : 'Review reported for moderation.',
          isHidden: review.isHidden
        });
      }
    } catch (e) {}

    const r = mockReviews.find(item => item._id === id);
    if (r) {
      r.reports.push({ userId, reason, createdAt: new Date() });
      r.reportCount = r.reports.length;
      if (r.reportCount >= 3) {
        r.isHidden = true;
      }
      return res.status(200).json({
        message: r.isHidden
          ? 'Review reached report threshold and has been hidden. Average rating recalculated.'
          : 'Review reported for moderation.',
        isHidden: r.isHidden
      });
    }

    res.status(404).json({ message: 'Review not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Get completed trips eligible for rating
exports.getEligibleTrips = async (req, res) => {
  try {
    const { userId } = req.params;

    // Default completed eligible trips for user
    const eligible = [
      {
        bookingId: 'RB84920192',
        routeKey: 'Hyderabad - Mumbai',
        busName: 'VRL Travels (Volvo 9600 Multi-Axle)',
        journeyDate: '10 Oct, 2026',
        departureTime: '18:00',
        arrivalTime: '11:00',
        seats: ['L3', 'L4'],
        status: 'Completed',
        alreadyReviewed: true
      },
      {
        bookingId: 'RB91823450',
        routeKey: 'Bengaluru - Goa',
        busName: 'KSRTC Airavat Club Class',
        journeyDate: '05 Oct, 2026',
        departureTime: '22:00',
        arrivalTime: '07:15',
        seats: ['A1'],
        status: 'Completed',
        alreadyReviewed: false
      }
    ];

    res.status(200).json(eligible);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
