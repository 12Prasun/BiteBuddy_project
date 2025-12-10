// Application configuration
module.exports = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb+srv://bitebuddy:project@cluster0.rfeu7is.mongodb.net/bitebuddy?retryWrites=true&w=majority',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'MynameisEndtoEndYouTubeChannel$#',
  jwtExpire: '7d',

  // Bcrypt
  saltRounds: 10,

  // Pagination
  itemsPerPage: 10,

  // API Limits
  maxRequestSize: '10kb',
  maxJsonSize: '10kb',
};
