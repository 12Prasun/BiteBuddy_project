const { AppError, asyncHandler, errorHandler } = require('../backend/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.NODE_ENV = 'development';
  });

  describe('AppError', () => {
    test('should create error with status and message', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });

    test('should set isOperational to true by default', () => {
      const error = new AppError('Test error', 400);

      expect(error.isOperational).toBe(true);
    });

    test('should inherit from Error', () => {
      const error = new AppError('Test error', 400);

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('asyncHandler', () => {
    test('should catch promise rejections', async () => {
      const throwingHandler = asyncHandler((req, res, next) => {
        return Promise.reject(new Error('Async error'));
      });

      await throwingHandler(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should work with synchronous errors', async () => {
      const throwingHandler = asyncHandler((req, res, next) => {
        throw new Error('Sync error');
      });

      await throwingHandler(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should pass through successful execution', async () => {
      const successHandler = asyncHandler((req, res, next) => {
        res.status(200).json({ success: true });
      });

      await successHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('errorHandler middleware', () => {
    test('should send error response with status code', () => {
      const error = new AppError('Not found', 404);
      error.isOperational = true;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Not found'
        })
      );
    });

    test('should set default status code to 500', () => {
      const error = new Error('Server error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new AppError('Dev error', 400);

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );
    });

    test('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new AppError('Prod error', 400);

      errorHandler(error, req, res, next);

      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.anything()
        })
      );
    });

    test('should handle non-operational errors', () => {
      const error = new Error('Unknown error');
      error.isOperational = false;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });
  });
});
