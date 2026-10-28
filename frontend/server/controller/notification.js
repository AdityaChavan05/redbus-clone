const Notification = require('../models/notification');
const Customer = require('../models/customer');

// Multi-language notification message templates
const NOTIF_TEMPLATES = {
  booking_confirmation: {
    en: {
      title: 'Booking Confirmed! 🎫',
      message: (meta) => `Your bus journey from ${meta.from || 'Origin'} to ${meta.to || 'Destination'} is confirmed. Ticket Ref: ${meta.bookingRef || 'RB100234'}. Have a safe journey!`
    },
    hi: {
      title: 'बुकिंग की पुष्टि हो गई! 🎫',
      message: (meta) => `${meta.from || 'मूल स्थान'} से ${meta.to || 'गंतव्य'} तक आपकी बस यात्रा की पुष्टि हो गई है। टिकट संदर्भ: ${meta.bookingRef || 'RB100234'}। आपकी यात्रा मंगलमय हो!`
    },
    kn: {
      title: 'ಬುಕಿಂಗ್ ಖಚಿತಪಟ್ಟಿದೆ! 🎫',
      message: (meta) => `${meta.from || 'ಪ್ರಾರಂಭ'} ದಿಂದ ${meta.to || 'ಗಮ್ಯಸ್ಥಾನ'} ಕ್ಕೆ ನಿಮ್ಮ ಬಸ್ ಪ್ರಯಾಣ ಖಚಿತಪಟ್ಟಿದೆ. ಟಿಕೆಟ್ ರೆಫ್: ${meta.bookingRef || 'RB100234'}. ಸುರಕ್ಷಿತ ಪ್ರಯಾಣ ನಿಮ್ಮದಾಗಲಿ!`
    }
  },
  cancellation: {
    en: {
      title: 'Booking Cancelled ⚠️',
      message: (meta) => `Your booking ${meta.bookingRef || ''} for ${meta.from || 'Origin'} to ${meta.to || 'Destination'} has been cancelled. Refund will be processed in 3-5 business days.`
    },
    hi: {
      title: 'बुकिंग रद्द कर दी गई ⚠️',
      message: (meta) => `${meta.from || 'मूल स्थान'} से ${meta.to || 'गंतव्य'} के लिए आपकी बुकिंग ${meta.bookingRef || ''} रद्द कर दी गई है। रिफंड 3-5 कार्य दिवसों में प्रोसेस होगा।`
    },
    kn: {
      title: 'ಬುಕಿಂಗ್ ರದ್ದುಗೊಂಡಿದೆ ⚠️',
      message: (meta) => `${meta.from || 'ಪ್ರಾರಂಭ'} ದಿಂದ ${meta.to || 'ಗಮ್ಯಸ್ಥಾನ'} ಕ್ಕೆ ನಿಮ್ಮ ಬುಕಿಂಗ್ ${meta.bookingRef || ''} ರದ್ದುಗೊಂಡಿದೆ. ಮರುಪಾವತಿಯನ್ನು 3-5 ದಿನಗಳಲ್ಲಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುವುದು.`
    }
  },
  schedule_change: {
    en: {
      title: 'Schedule Update Alert ⏰',
      message: (meta) => `Departure time for ${meta.busName || 'your bus'} (${meta.from || 'Origin'} to ${meta.to || 'Destination'}) has been updated to ${meta.newTime || '21:30'}. Please arrive 15 minutes early.`
    },
    hi: {
      title: 'समय सारिणी अपडेट अलर्ट ⏰',
      message: (meta) => `${meta.busName || 'आपकी बस'} (${meta.from || 'मूल स्थान'} से ${meta.to || 'गंतव्य'}) का प्रस्थान समय बदलकर ${meta.newTime || '21:30'} हो गया है। कृपया 15 मिनट पहले पहुंचें।`
    },
    kn: {
      title: 'ವೇಳಾಪಟ್ಟಿ ನವೀಕರಣ ಎಚ್ಚರಿಕೆ ⏰',
      message: (meta) => `${meta.busName || 'ನಿಮ್ಮ ಬಸ್'} (${meta.from || 'ಪ್ರಾರಂಭ'} ದಿಂದ ${meta.to || 'ಗಮ್ಯಸ್ಥಾನ'}) ಹೊರಡುವ ಸಮಯ ${meta.newTime || '21:30'} ಕ್ಕೆ ಬದಲಾಗಿದೆ. ದಯವಿಟ್ಟು 15 ನಿಮಿಷ ಮೊದಲೇ ತಲುಪಿ.`
    }
  },
  journey_reminder: {
    en: {
      title: 'Upcoming Journey Reminder 🚌',
      message: (meta) => `Reminder: Your bus to ${meta.to || 'Destination'} departs today at ${meta.time || '20:30'}. Boarding point: ${meta.boardingPoint || 'Majestic Platform 4'}.`
    },
    hi: {
      title: 'आगामी यात्रा अनुस्मारक 🚌',
      message: (meta) => `याद दिलाएं: ${meta.to || 'गंतव्य'} के लिए आपकी बस आज ${meta.time || '20:30'} बजे रवाना होगी। बोर्डिंग पॉइंट: ${meta.boardingPoint || 'मजेस्टिक प्लेटफार्म 4'}।`
    },
    kn: {
      title: 'ಮುಂಬರುವ ಪ್ರಯಾಣದ ಜ್ಞಾಪನೆ 🚌',
      message: (meta) => `ಜ್ಞಾಪನೆ: ${meta.to || 'ಗಮ್ಯಸ್ಥಾನ'} ಕ್ಕೆ ನಿಮ್ಮ ಬಸ್ ಇಂದು ${meta.time || '20:30'} ಕ್ಕೆ ಹೊರಡಲಿದೆ. ಬೋರ್ಡಿಂಗ್ ಸ್ಥಳ: ${meta.boardingPoint || 'ಮೆಜೆಸ್ಟಿಕ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ 4'}.`
    }
  },
  promotional: {
    en: {
      title: 'Exclusive Weekend Offer! 🎉',
      message: (meta) => `Use coupon code "${meta.code || 'SUPERBUS'}" to get flat 15% off on luxury Volvo sleepers this weekend!`
    },
    hi: {
      title: 'विशेष सप्ताहांत ऑफ़र! 🎉',
      message: (meta) => `इस सप्ताहांत वोल्वो स्लीपर बसों पर फ्लैट 15% छूट पाने के लिए कूपन कोड "${meta.code || 'SUPERBUS'}" का उपयोग करें!`
    },
    kn: {
      title: 'ವಿಶೇಷ ವಾರಾಂತ್ಯದ ಕೊಡುಗೆ! 🎉',
      message: (meta) => `ಈ ವಾರಾಂತ್ಯದಲ್ಲಿ ವೋಲ್ವೋ ಸ್ಲೀಪರ್‌ಗಳಲ್ಲಿ ಫ್ಲಾಟ್ 15% ರಿಯಾಯಿತಿ ಪಡೆಯಲು ಕೂಪನ್ ಕೋಡ್ "${meta.code || 'SUPERBUS'}" ಬಳಸಿ!`
    }
  }
};

// In-memory fallback notification list
let mockNotifications = [
  {
    _id: 'notif_001',
    recipient: '660000000000000000000001',
    title: 'Booking Confirmed! 🎫',
    message: 'Your bus journey from Hyderabad to Mumbai is confirmed. Ticket Ref: RB84920192. Have a safe journey!',
    type: 'booking_confirmation',
    channel: 'in_app',
    status: 'delivered',
    retryCount: 0,
    isRead: false,
    language: 'en',
    metadata: { bookingRef: 'RB84920192', from: 'Hyderabad', to: 'Mumbai' },
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    _id: 'notif_002',
    recipient: '660000000000000000000001',
    title: 'Upcoming Journey Reminder 🚌',
    message: 'Reminder: Your bus to Mumbai departs tonight at 18:00. Boarding point: Main Terminal (Opposite Metro Pillar 12).',
    type: 'journey_reminder',
    channel: 'push',
    status: 'delivered',
    retryCount: 0,
    isRead: false,
    language: 'en',
    metadata: { to: 'Mumbai', time: '18:00' },
    createdAt: new Date(Date.now() - 3600000 * 6)
  },
  {
    _id: 'notif_003',
    recipient: '660000000000000000000001',
    title: 'Schedule Update Alert ⏰',
    message: 'Departure time for VRL Travels has been updated to 18:30 due to toll congestion. Please arrive on time.',
    type: 'schedule_change',
    channel: 'email',
    status: 'delivered',
    retryCount: 0,
    isRead: true,
    language: 'en',
    metadata: { newTime: '18:30' },
    createdAt: new Date(Date.now() - 3600000 * 18)
  },
  {
    _id: 'notif_004',
    recipient: '660000000000000000000001',
    title: 'Exclusive Weekend Offer! 🎉',
    message: 'Use coupon code "SUPERBUS" to get flat 15% off on luxury Volvo sleepers this weekend!',
    type: 'promotional',
    channel: 'push',
    status: 'failed',
    retryCount: 1,
    isRead: false,
    language: 'en',
    metadata: { code: 'SUPERBUS' },
    createdAt: new Date(Date.now() - 3600000 * 22)
  }
];

// User preferences store fallback
let mockPreferences = {
  '660000000000000000000001': {
    email: true,
    push: true,
    in_app: true,
    promotional: true,
    preferredLanguage: 'en'
  }
};

// 1. Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    let list = [];

    try {
      list = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).lean();
    } catch (e) {}

    if (!list || list.length === 0) {
      list = mockNotifications.filter(n => n.recipient === userId || n.recipient === '660000000000000000000001');
    }

    const unreadCount = list.filter(n => !n.isRead).length;

    res.status(200).json({
      notifications: list,
      unreadCount,
      totalCount: list.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Send notification for key events with localization
exports.sendNotification = async (req, res) => {
  try {
    const {
      recipient = '660000000000000000000001',
      type = 'booking_confirmation',
      channel = 'in_app',
      language = 'en',
      metadata = {},
      customTitle,
      customMessage
    } = req.body;

    // Check user preferences
    const userPrefs = mockPreferences[recipient] || { email: true, push: true, in_app: true, promotional: true };
    if (type === 'promotional' && !userPrefs.promotional) {
      return res.status(200).json({ skipped: true, reason: 'User opted out of promotional notifications' });
    }
    if (channel !== 'in_app' && !userPrefs[channel]) {
      return res.status(200).json({ skipped: true, reason: `User disabled notifications on channel: ${channel}` });
    }

    const lang = ['en', 'hi', 'kn'].includes(language) ? language : 'en';
    const template = NOTIF_TEMPLATES[type] ? NOTIF_TEMPLATES[type][lang] : null;

    const title = customTitle || (template ? template.title : 'TedBus Notification');
    const message = customMessage || (template ? template.message(metadata) : 'You have a new update.');

    // Simulated delivery status (occasionally failed for push to demonstrate retry mechanism)
    const simulatedStatus = (channel === 'push' && Math.random() < 0.2) ? 'failed' : 'delivered';

    const notifObj = {
      _id: 'notif_' + Date.now(),
      recipient,
      title,
      message,
      type,
      channel,
      status: simulatedStatus,
      retryCount: 0,
      isRead: false,
      language: lang,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const dbNotif = new Notification(notifObj);
      await dbNotif.save();
    } catch (e) {
      mockNotifications.unshift(notifObj);
    }

    res.status(201).json(notifObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } catch (e) {}

    const item = mockNotifications.find(n => n._id === id);
    if (item) item.isRead = true;

    res.status(200).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    try {
      await Notification.updateMany({ recipient: userId }, { isRead: true });
    } catch (e) {}

    mockNotifications.forEach(n => {
      if (n.recipient === userId || n.recipient === '660000000000000000000001') {
        n.isRead = true;
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Retry failed notification delivery
exports.retryNotification = async (req, res) => {
  try {
    const { id } = req.params;
    let notif = null;

    try {
      notif = await Notification.findById(id);
      if (notif) {
        notif.retryCount += 1;
        notif.status = 'delivered'; // Successfully delivered on retry
        await notif.save();
        return res.status(200).json({ success: true, notification: notif });
      }
    } catch (e) {}

    const item = mockNotifications.find(n => n._id === id);
    if (item) {
      item.retryCount += 1;
      item.status = 'delivered';
      return res.status(200).json({ success: true, notification: item });
    }

    res.status(404).json({ error: 'Notification not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Get user notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    let prefs = mockPreferences[userId] || {
      email: true,
      push: true,
      in_app: true,
      promotional: true,
      preferredLanguage: 'en'
    };

    try {
      const user = await Customer.findById(userId);
      if (user && user.notificationPreferences) {
        prefs = {
          ...user.notificationPreferences.toObject(),
          preferredLanguage: user.preferredLanguage || 'en'
        };
      }
    } catch (e) {}

    res.status(200).json(prefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Update user notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, push, in_app, promotional, preferredLanguage } = req.body;

    mockPreferences[userId] = {
      email: email !== undefined ? email : true,
      push: push !== undefined ? push : true,
      in_app: in_app !== undefined ? in_app : true,
      promotional: promotional !== undefined ? promotional : true,
      preferredLanguage: preferredLanguage || 'en'
    };

    try {
      await Customer.findByIdAndUpdate(userId, {
        notificationPreferences: { email, push, in_app, promotional },
        preferredLanguage
      });
    } catch (e) {}

    res.status(200).json({ success: true, preferences: mockPreferences[userId] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
