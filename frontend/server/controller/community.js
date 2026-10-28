const CommunityPost = require('../models/communityPost');

// In-memory fallback dataset for seamless offline operation
let mockPosts = [
  {
    _id: 'post_001',
    authorId: 'user_rahul',
    authorName: 'Rahul Sharma',
    isVerifiedAuthor: true,
    isVerifiedPassenger: true,
    title: 'Smooth overnight journey from Bengaluru to Goa!',
    content: 'Took the KSRTC Airavat Club Class bus last Friday night. The bus left Majestic on time at 10 PM. Clean blankets, very comfortable pushback seats, and punctual arrival at Panaji by 9 AM. Highly recommend for solo travelers!',
    category: 'Journey Story',
    route: 'Bengaluru to Goa',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop',
    likes: ['user_priya', 'user_anita', '660000000000000000000001'],
    comments: [
      {
        userId: 'user_priya',
        userName: 'Priya Nair',
        text: 'Did they stop for dinner at a decent place with clean restrooms?',
        createdAt: new Date(Date.now() - 3600000 * 5)
      },
      {
        userId: 'user_rahul',
        userName: 'Rahul Sharma',
        text: 'Yes! Stopped around midnight at a clean food plaza on NH48.',
        createdAt: new Date(Date.now() - 3600000 * 3)
      }
    ],
    reports: [],
    status: 'approved',
    shares: 12,
    createdAt: new Date(Date.now() - 3600000 * 24),
    updatedAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    _id: 'post_002',
    authorId: 'user_sneha',
    authorName: 'Sneha Kulkarni',
    isVerifiedAuthor: true,
    isVerifiedPassenger: true,
    title: 'Top 5 tips when traveling with luggage on Mumbai-Pune route',
    content: 'Always reach Dadar TT or Vashi 20 minutes before departure. Tag your bags properly with the driver before boarding. Keep power banks and essentials in your personal backpack as undercarriage lockers are locked throughout the expressway run.',
    category: 'Travel Tip',
    route: 'Mumbai to Pune',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop',
    likes: ['user_rahul', 'user_vikram'],
    comments: [
      {
        userId: 'user_vikram',
        userName: 'Vikram Joshi',
        text: 'Super helpful tip about power banks, learned the hard way once!',
        createdAt: new Date(Date.now() - 3600000 * 8)
      }
    ],
    reports: [],
    status: 'approved',
    shares: 8,
    createdAt: new Date(Date.now() - 3600000 * 48),
    updatedAt: new Date(Date.now() - 3600000 * 48)
  },
  {
    _id: 'post_003',
    authorId: 'user_arun',
    authorName: 'Arun Kumar',
    isVerifiedAuthor: true,
    isVerifiedPassenger: true,
    title: 'Hyderabad to Vijayawada Expressway experience',
    content: 'VRL multi-axle sleeper bus was pristine. Smooth ride along the 6-lane highway. USB charging ports worked at every berth. Reached Benz Circle 15 minutes ahead of schedule.',
    category: 'Route Advice',
    route: 'Hyderabad to Vijayawada',
    imageUrl: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop',
    likes: ['user_sneha', 'user_priya', 'user_arun', 'user_rahul'],
    comments: [],
    reports: [],
    status: 'approved',
    shares: 15,
    createdAt: new Date(Date.now() - 3600000 * 12),
    updatedAt: new Date(Date.now() - 3600000 * 12)
  }
];

// 1. Get posts with category filter, search, and sorting
exports.getPosts = async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let posts = [];

    try {
      const query = { status: 'approved' };
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { route: { $regex: search, $options: 'i' } }
        ];
      }
      const sortOption = sort === 'popular' ? { shares: -1, 'likes.length': -1 } : { createdAt: -1 };
      posts = await CommunityPost.find(query).sort(sortOption).lean();
    } catch (e) {
      // In-memory fallback
      posts = mockPosts.filter(p => p.status === 'approved');
      if (category && category !== 'All') {
        posts = posts.filter(p => p.category === category);
      }
      if (search) {
        const s = search.toLowerCase();
        posts = posts.filter(p =>
          p.title.toLowerCase().includes(s) ||
          p.content.toLowerCase().includes(s) ||
          (p.route && p.route.toLowerCase().includes(s))
        );
      }
      if (sort === 'popular') {
        posts.sort((a, b) => (b.likes.length + (b.shares || 0)) - (a.likes.length + (a.shares || 0)));
      } else {
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    if (!posts || posts.length === 0) {
      posts = mockPosts;
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve posts', error: error.message });
  }
};

// 2. Create new post
exports.createPost = async (req, res) => {
  try {
    const {
      authorId,
      authorName,
      title,
      content,
      category = 'Journey Story',
      route = '',
      imageUrl = '',
      isVerifiedAuthor = true
    } = req.body;

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ message: 'Content must be at least 20 characters long.' });
    }

    if (!isVerifiedAuthor) {
      return res.status(403).json({ message: 'Only verified users are permitted to post community content.' });
    }

    const postObj = {
      _id: 'post_' + Date.now(),
      authorId: authorId || 'user_' + Date.now(),
      authorName: authorName || 'Traveler',
      isVerifiedAuthor: true,
      isVerifiedPassenger: true,
      title: title || 'My Journey Story',
      content: content.trim(),
      category,
      route,
      imageUrl,
      likes: [],
      comments: [],
      reports: [],
      status: 'approved',
      shares: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const dbPost = new CommunityPost(postObj);
      await dbPost.save();
    } catch (e) {
      // In-memory fallback
      mockPosts.unshift(postObj);
    }

    res.status(201).json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

// 3. Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      const post = await CommunityPost.findById(postId);
      if (post) {
        const idx = post.likes.indexOf(userId);
        if (idx > -1) {
          post.likes.splice(idx, 1);
        } else {
          post.likes.push(userId);
        }
        await post.save();
        return res.status(200).json({ likes: post.likes, liked: idx === -1 });
      }
    } catch (e) {}

    // Fallback
    const p = mockPosts.find(item => item._id === postId);
    if (p) {
      const idx = p.likes.indexOf(userId);
      if (idx > -1) {
        p.likes.splice(idx, 1);
      } else {
        p.likes.push(userId);
      }
      return res.status(200).json({ likes: p.likes, liked: idx === -1 });
    }

    res.status(404).json({ message: 'Post not found' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle like', error: error.message });
  }
};

// 4. Add comment
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, userName, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const comment = {
      userId: userId || 'user_anon',
      userName: userName || 'Fellow Traveler',
      text: text.trim(),
      createdAt: new Date()
    };

    try {
      const post = await CommunityPost.findById(postId);
      if (post) {
        post.comments.push(comment);
        await post.save();
        return res.status(201).json(post);
      }
    } catch (e) {}

    // Fallback
    const p = mockPosts.find(item => item._id === postId);
    if (p) {
      p.comments.push(comment);
      return res.status(201).json(p);
    }

    res.status(404).json({ message: 'Post not found' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

// 5. Report post
exports.reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, reason } = req.body;

    const report = {
      userId: userId || 'user_anon',
      reason: reason || 'Inappropriate content',
      createdAt: new Date()
    };

    let post = null;
    try {
      post = await CommunityPost.findById(postId);
      if (post) {
        post.reports.push(report);
        if (post.reports.length >= 3) {
          post.status = 'flagged';
        }
        await post.save();
      }
    } catch (e) {}

    const p = mockPosts.find(item => item._id === postId);
    if (p) {
      p.reports.push(report);
      if (p.reports.length >= 3) {
        p.status = 'flagged';
      }
    }

    res.status(200).json({ message: 'Post reported for moderation review', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to report post', error: error.message });
  }
};

// 6. Get reported / moderation queue posts (Admin / Moderation)
exports.getModerationQueue = async (req, res) => {
  try {
    let flaggedPosts = [];
    try {
      flaggedPosts = await CommunityPost.find({
        $or: [{ status: 'flagged' }, { 'reports.0': { $exists: true } }]
      }).lean();
    } catch (e) {}

    if (!flaggedPosts || flaggedPosts.length === 0) {
      flaggedPosts = mockPosts.filter(p => p.status === 'flagged' || (p.reports && p.reports.length > 0));
    }

    res.status(200).json(flaggedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve moderation queue', error: error.message });
  }
};

// 7. Moderate post action (approve, hide, remove)
exports.moderatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { action } = req.body; // 'approve', 'hide', 'remove'

    try {
      if (action === 'remove') {
        await CommunityPost.findByIdAndDelete(postId);
      } else {
        const post = await CommunityPost.findById(postId);
        if (post) {
          post.status = action === 'approve' ? 'approved' : 'hidden';
          if (action === 'approve') post.reports = [];
          await post.save();
        }
      }
    } catch (e) {}

    const idx = mockPosts.findIndex(p => p._id === postId);
    if (idx > -1) {
      if (action === 'remove') {
        mockPosts.splice(idx, 1);
      } else {
        mockPosts[idx].status = action === 'approve' ? 'approved' : 'hidden';
        if (action === 'approve') mockPosts[idx].reports = [];
      }
    }

    res.status(200).json({ message: `Post ${action}d successfully`, success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to moderate post', error: error.message });
  }
};

// 8. Track social share
exports.trackShare = async (req, res) => {
  try {
    const { postId } = req.params;
    try {
      const post = await CommunityPost.findById(postId);
      if (post) {
        post.shares = (post.shares || 0) + 1;
        await post.save();
      }
    } catch (e) {}

    const p = mockPosts.find(item => item._id === postId);
    if (p) {
      p.shares = (p.shares || 0) + 1;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. Get user community activity for profile page
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    let userPosts = [];
    let likedPosts = [];

    try {
      userPosts = await CommunityPost.find({ authorId: userId }).lean();
      likedPosts = await CommunityPost.find({ likes: userId }).lean();
    } catch (e) {}

    if (userPosts.length === 0) {
      userPosts = mockPosts.filter(p => p.authorId === userId);
    }
    if (likedPosts.length === 0) {
      likedPosts = mockPosts.filter(p => p.likes.includes(userId));
    }

    res.status(200).json({
      posts: userPosts,
      likedPosts,
      stats: {
        totalPosts: userPosts.length,
        totalLikesGiven: likedPosts.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};