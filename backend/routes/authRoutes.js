const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe, updateProfile } = require('../controllers/authController');
const { validateEmail, validateOtp } = require('../middleware/validate');
const { otpLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

router.post('/send-otp', otpLimiter, validateEmail, sendOtp);
router.post('/verify-otp', validateOtp, verifyOtp);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

module.exports = router;
