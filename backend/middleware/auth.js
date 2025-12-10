// Authentication middleware
const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    
    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    // Remove 'Bearer ' prefix if present
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(actualToken, jwtSecret);
    
    req.user = decoded.user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }
};

module.exports = {
  verifyToken
};
