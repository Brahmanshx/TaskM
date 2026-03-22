const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/emailService');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check for existing unexpired OTP
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const timeSinceCreated = Date.now() - existingOtp.createdAt.getTime();
      if (timeSinceCreated < 60000) { // 1 minute cooldown
        return res.status(429).json({ message: 'Please wait before requesting another OTP' });
      }
      await Otp.deleteMany({ email });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    await Otp.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    });

    const emailSent = await sendOtpEmail(email, otp);

    // Check if user exists (for UI — login vs signup)
    const userExists = await User.findOne({ email });

    res.json({
      message: emailSent ? 'OTP sent to your email' : 'OTP generated (check server logs in dev mode)',
      isNewUser: !userExists,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: 'Too many failed attempts. Request a new OTP.' });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid — delete it
    await Otp.deleteMany({ email });

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name: name || '' });
    } else if (name && !user.name) {
      user.name = name;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      message: 'Authentication successful',
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({ user: { id: req.user._id, email: req.user.email, name: req.user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user info' });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { name }, { new: true });
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { sendOtp, verifyOtp, getMe, updateProfile };
