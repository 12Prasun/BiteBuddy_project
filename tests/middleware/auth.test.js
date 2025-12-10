const jwt = require('jsonwebtoken');
const { verifyToken } = require('../backend/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;
  const testSecret = 'test_secret_key';

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = testSecret;
  });

  test('should verify valid token', () => {
    const token = jwt.sign({ userId: '123', email: 'test@example.com' }, testSecret);
    req.headers.authorization = `Bearer ${token}`;

    verifyToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('123');
    expect(next).toHaveBeenCalled();
  });

  test('should reject missing token', () => {
    req.headers.authorization = undefined;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('should reject malformed authorization header', () => {
    req.headers.authorization = 'InvalidFormat';

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('should reject invalid token', () => {
    req.headers.authorization = 'Bearer invalid_token_string';

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('should reject expired token', () => {
    const expiredToken = jwt.sign(
      { userId: '123' },
      testSecret,
      { expiresIn: '-1h' }
    );
    req.headers.authorization = `Bearer ${expiredToken}`;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('should extract Bearer token correctly', () => {
    const token = jwt.sign({ userId: '123' }, testSecret);
    req.headers.authorization = `Bearer ${token}`;

    verifyToken(req, res, next);

    expect(req.user.userId).toBe('123');
  });

  test('should handle token without Bearer prefix', () => {
    const token = jwt.sign({ userId: '123' }, testSecret);
    req.headers.authorization = token;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
