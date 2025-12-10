// Monitoring Configuration for Production
// Tracks application performance metrics

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      dbQueryTime: [],
      memoryUsage: []
    };
    this.startTime = Date.now();
  }

  recordRequest() {
    this.metrics.requests++;
  }

  recordError() {
    this.metrics.errors++;
  }

  recordResponseTime(duration) {
    this.metrics.responseTime.push(duration);
  }

  recordDbQuery(duration) {
    this.metrics.dbQueryTime.push(duration);
  }

  recordMemoryUsage() {
    const usage = process.memoryUsage();
    this.metrics.memoryUsage.push({
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss
    });
  }

  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.responseTime.length);
  }

  getAverageDbQueryTime() {
    if (this.metrics.dbQueryTime.length === 0) return 0;
    const sum = this.metrics.dbQueryTime.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.dbQueryTime.length);
  }

  getErrorRate() {
    if (this.metrics.requests === 0) return 0;
    return ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2);
  }

  getUptime() {
    return Math.round((Date.now() - this.startTime) / 1000); // in seconds
  }

  getMetrics() {
    return {
      uptime: this.getUptime(),
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      errorRate: `${this.getErrorRate()}%`,
      averageResponseTime: `${this.getAverageResponseTime()}ms`,
      averageDbQueryTime: `${this.getAverageDbQueryTime()}ms`,
      currentMemory: process.memoryUsage(),
      memoryHistory: this.metrics.memoryUsage.slice(-10)
    };
  }

  // Middleware to track request performance
  middleware() {
    return (req, res, next) => {
      const start = Date.now();

      this.recordRequest();

      // Override res.json to track response time
      const originalJson = res.json;
      res.json = function(data) {
        const duration = Date.now() - start;
        res.set('X-Response-Time', `${duration}ms`);
        res.locals.duration = duration;

        if (res.statusCode >= 400) {
          res.locals.monitor.recordError();
        }

        return originalJson.call(this, data);
      };

      res.locals.monitor = this;
      next();
    };
  }
}

module.exports = new PerformanceMonitor();
