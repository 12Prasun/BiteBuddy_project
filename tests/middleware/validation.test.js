const { body, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../backend/middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should pass valid email', async () => {
    req.body = { email: 'test@example.com' };
    
    await body('email').isEmail().run(req);
    
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });

  test('should reject invalid email', async () => {
    req.body = { email: 'invalid-email' };
    
    await body('email').isEmail().run(req);
    
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  test('should validate password strength', async () => {
    const passwordValidation = body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[!@#$%^&*]/)
      .withMessage('Password must contain special character');

    req.body = { password: 'weak' };
    await passwordValidation.run(req);
    
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  test('should accept strong password', async () => {
    const passwordValidation = body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[!@#$%^&*]/)
      .withMessage('Password must contain special character');

    req.body = { password: 'Strong@Pass123' };
    await passwordValidation.run(req);
    
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });

  test('handleValidationErrors should return errors', async () => {
    req.body = { email: 'invalid' };
    await body('email').isEmail().run(req);

    handleValidationErrors(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  test('handleValidationErrors should call next on valid data', async () => {
    req.body = { email: 'valid@example.com' };
    await body('email').isEmail().run(req);

    handleValidationErrors(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('should validate required fields', async () => {
    const nameValidation = body('name')
      .notEmpty()
      .withMessage('Name is required');

    req.body = { name: '' };
    await nameValidation.run(req);
    
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  test('should validate amount is positive number', async () => {
    const amountValidation = body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0');

    req.body = { amount: -50 };
    await amountValidation.run(req);
    
    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });
});
