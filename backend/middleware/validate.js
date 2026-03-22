const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const validateEmail = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  handleValidationErrors,
];

const validateOtp = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric'),
  handleValidationErrors,
];

const validateTask = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('deadline').isISO8601().withMessage('Valid deadline is required'),
  body('importance').optional().isInt({ min: 1, max: 5 }).withMessage('Importance must be 1-5'),
  body('effort').optional().isIn(['small', 'medium', 'large']).withMessage('Effort must be small, medium, or large'),
  handleValidationErrors,
];

const validateGoal = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('type').isIn(['day-to-day', 'short-term', 'long-term']).withMessage('Invalid goal type'),
  body('targetDate').isISO8601().withMessage('Valid target date is required'),
  handleValidationErrors,
];

module.exports = { validateEmail, validateOtp, validateTask, validateGoal };
