// Validation middleware and helper functions
const { body, validationResult } = require('express-validator');

// Custom validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  handleValidationErrors,
  validateCreateUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('name')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Name must be between 3 and 50 characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and numbers'),
    body('location')
      .trim()
      .notEmpty()
      .withMessage('Location is required'),
  ],
  
  validateLoginUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Invalid credentials'),
  ],

  validateOrderData: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('order_data')
      .isArray()
      .withMessage('Order data must be an array'),
    body('order_date')
      .notEmpty()
      .withMessage('Order date is required'),
  ],
};
