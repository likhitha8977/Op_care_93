const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================= Signup =================
exports.signup = async (req, res, next) => {
  try {
    let { fullName, email, password, phone } = req.body;
    let { role } = req.body;

    // Basic normalization
    fullName = (fullName || '').toString().trim();
    email = (email || '').toString().trim().toLowerCase();
    password = (password || '').toString();
    phone = (phone || '').toString().trim();

    // Normalize role to allowed enum values
    const normalizeRole = (r) => {
      if (!r) return 'patient';
      const v = String(r).toLowerCase().trim();
      if (v === 'docter') return 'doctor';
      if (v === 'doc' || v === 'dr') return 'doctor';
      if (['patient','doctor','admin'].includes(v)) return v;
      return 'patient';
    };
    role = normalizeRole(role);

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email and password are required' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ fullName, email, password: hash, phone, role });

    return res.status(201).json({
      message: 'Signup successful',
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    // Duplicate key error (unique email)
    if (err && err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    // Validation error
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// ================= Login =================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '2d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
