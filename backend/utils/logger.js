// Logging Configuration
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = process.env.LOG_DIR || path.join(__dirname, '../logs');
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  }

  writeToFile(filename, message) {
    const filepath = path.join(this.logDir, filename);
    fs.appendFileSync(filepath, message + '\n', 'utf8');
  }

  log(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.logLevel]) {
      return;
    }

    const formatted = this.formatMessage(level, message, meta);

    // Console output
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](formatted);

    // File output
    this.writeToFile('app.log', formatted);

    // Separate error logs
    if (level === 'error') {
      this.writeToFile('error.log', formatted);
    }
  }

  error(message, error = null) {
    const meta = error ? { error: error.message, stack: error.stack } : {};
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();

      // Log request
      this.info('Incoming Request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.info('Request Completed', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`
        });
      });

      next();
    };
  }

  // Error logging middleware
  errorLogger() {
    return (err, req, res, next) => {
      this.error('Request Error', {
        method: req.method,
        path: req.path,
        error: err.message,
        statusCode: err.statusCode || 500
      });
      next(err);
    };
  }
}

module.exports = new Logger();
