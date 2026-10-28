const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  password: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  // Notification preferences (Task 2)
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    in_app: {
      type: Boolean,
      default: true
    },
    promotional: {
      type: Boolean,
      default: true
    }
  },
  // Language & Theme preferences (Tasks 4 & 5)
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  preferredTheme: {
    type: String,
    default: 'theme-light'
  }
}, { timestamps: true });

module.exports = mongoose.model('Customers', customerSchema);