const Customer = require('../models/customer');

// In-memory fallback user
let mockCustomers = {
  '660000000000000000000001': {
    _id: '660000000000000000000001',
    name: 'Aditya Chavan',
    email: 'adityachavan05@redbus.in',
    phone: '9632712034',
    isVerified: true,
    notificationPreferences: {
      email: true,
      push: true,
      in_app: true,
      promotional: true
    },
    preferredLanguage: 'en',
    preferredTheme: 'theme-light'
  }
};

exports.addnewcustomer = async (req, res) => {
  try {
    const { name, email, googleId, profilepicture } = req.body;
    let existing = null;
    try {
      existing = await Customer.findOne({ email }).lean().exec();
    } catch (e) {}

    if (existing) {
      return res.send(existing);
    }

    const customerData = {
      _id: 'cust_' + Date.now(),
      name: name || 'Traveler',
      email: email || 'user@redbus.in',
      googleId,
      profilepicture,
      isVerified: true,
      notificationPreferences: { email: true, push: true, in_app: true, promotional: true },
      preferredLanguage: 'en',
      preferredTheme: 'theme-light'
    };

    try {
      const customer = new Customer(customerData);
      const newCustomer = await customer.save();
      return res.status(201).json(newCustomer);
    } catch (e) {
      mockCustomers[customerData._id] = customerData;
      return res.status(201).json(customerData);
    }
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    let customer = null;
    try {
      customer = await Customer.findById(id).lean();
    } catch (e) {}

    if (!customer) {
      customer = mockCustomers[id] || mockCustomers['660000000000000000000001'];
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCustomerPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { preferredLanguage, preferredTheme, notificationPreferences, isVerified } = req.body;

    const updates = {};
    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;
    if (preferredTheme) updates.preferredTheme = preferredTheme;
    if (notificationPreferences) updates.notificationPreferences = notificationPreferences;
    if (isVerified !== undefined) updates.isVerified = isVerified;

    try {
      await Customer.findByIdAndUpdate(id, updates);
    } catch (e) {}

    if (mockCustomers[id]) {
      Object.assign(mockCustomers[id], updates);
    } else {
      mockCustomers[id] = { _id: id, ...updates };
    }

    res.status(200).json({ success: true, customer: mockCustomers[id] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};