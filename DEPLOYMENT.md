# Deployment & Infrastructure Guide

Complete guide for deploying BiteBuddy to production with multi-cloud support.

## Quick Start

### Local Development
```bash
cd bitebuddy
docker-compose up
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### AWS Deployment
```bash
# See DEPLOY_AWS.md for complete steps
# Quick summary:
# 1. Create RDS instance
# 2. Launch EC2 with Docker
# 3. Configure ALB + Auto Scaling
# 4. Deploy frontend to S3 + CloudFront
# Estimated setup time: 2-3 hours
# Monthly cost: $500-800
```

### Azure Deployment
```bash
# See DEPLOY_AZURE.md for complete steps
# Quick summary:
# 1. Create Cosmos DB
# 2. Create App Service Plan
# 3. Deploy container to Web App
# 4. Configure Front Door + Application Gateway
# Estimated setup time: 2-3 hours
# Monthly cost: $400-700
```

## Deployment Architecture

### Local Development
```
┌──────────────┐
│ Docker       │
│ Compose      │
└──────┬───────┘
       │
   ┌───┴──────┐
   │          │
┌──▼────┐ ┌──▼────┐
│Backend│ │Frontend│
│:5000  │ │:3000   │
└──┬────┘ └────────┘
   │
┌──▼─────────────┐
│ MongoDB        │
│ Container      │
└────────────────┘
```

### Production (AWS)
```
┌─────────────────┐
│ Route 53 (DNS)  │
└────────┬────────┘
         │
┌────────▼────────┐
│ CloudFront CDN  │
│ (Static Assets) │
└────────┬────────┘
         │
┌────────▼──────────────────────┐
│ Application Load Balancer      │
│ (HTTPS, Route-based, Health)   │
└──┬──────────────────┬──────────┘
   │                  │
┌──▼────────────┐ ┌──▼────────────┐
│ EC2 Instance  │ │ EC2 Instance   │
│ (Auto Scaled) │ │ (Auto Scaled)   │
└──┬────────────┘ └──┬────────────┘
   │                 │
   └────────┬────────┘
            │
      ┌─────▼──────────┐
      │ RDS Database   │
      │ (MongoDB/      │
      │  DocumentDB)   │
      └────────────────┘
```

### Production (Azure)
```
┌──────────────────────────┐
│ Azure Front Door         │
│ (Global, DDoS Protection)│
└──────────┬───────────────┘
           │
┌──────────▼─────────────────┐
│ Application Gateway        │
│ (WAF, Load Balancing)      │
└──┬───────────────────┬─────┘
   │                   │
┌──▼──────────┐   ┌───▼──────────┐
│ App Service │   │ App Service   │
│ Backend     │   │ Frontend      │
│ Container   │   │ Container     │
└──┬──────────┘   └───┬──────────┘
   │                  │
   └────────┬─────────┘
            │
      ┌─────▼──────────┐
      │ Cosmos DB      │
      │ (MongoDB API)  │
      │ Multi-region   │
      └────────────────┘
```

## Deployment Guides

### 1. AWS Deployment Guide
**File**: `DEPLOY_AWS.md`

**Covers**:
- RDS setup and configuration
- EC2 launch templates and auto-scaling
- Application Load Balancer setup
- CloudFront CDN for static assets
- Route 53 DNS configuration
- AWS Certificate Manager for HTTPS
- CloudWatch monitoring and alerts
- Backup and disaster recovery
- Cost optimization

**Infrastructure**: Multi-AZ for high availability
**Scaling**: Auto-scales 2-4 instances based on CPU
**Database**: MongoDB Atlas or AWS DocumentDB
**Monitoring**: CloudWatch with custom metrics

### 2. Azure Deployment Guide
**File**: `DEPLOY_AZURE.md`

**Covers**:
- Container Registry setup
- Cosmos DB configuration (MongoDB API)
- App Service deployment
- Application Gateway configuration
- Azure Front Door for global distribution
- Azure Key Vault for secrets
- Azure DevOps pipeline setup
- Application Insights monitoring
- Custom domain setup

**Infrastructure**: Multi-region capable
**Scaling**: App Service auto-scale rules
**Database**: Cosmos DB with global replication
**Monitoring**: Application Insights and Azure Monitor

## Environment Configuration

### Development Environment
```
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/bitebuddy
PORT=5000
REACT_PORT=3000
LOG_LEVEL=debug
DEBUG=true
```

### Staging Environment
See `config/env.staging` for complete staging configuration:
- Test Stripe keys
- Staging MongoDB instance
- Debug logging enabled
- Higher rate limits for testing
- Full metrics collection

### Production Environment
See `config/env.production` for complete production configuration:
- Production Stripe keys
- MongoDB Atlas connection
- HTTPS enforced
- Minimal logging (errors only)
- Security headers enabled
- Rate limiting strict
- Secure cookies

## Database Management

### Running Migrations
```javascript
// In backend/index.js or migration runner
const MigrationManager = require('./migrations/migrationManager');
const manager = new MigrationManager(mongoConnection);

// Run all pending migrations
await manager.runMigrations();

// Rollback specific migration
await manager.rollbackMigration('001_create_indexes');

// View migration history
const history = await manager.getMigrationHistory();
console.log(history);
```

### Available Migrations

1. **001_create_indexes.js**: Creates database indexes
   - Improves query performance 50-300x
   - Rollback: Drops all indexes

2. **002_add_payment_fields.js**: Adds payment tracking
   - Adds paymentStatus, paymentMethod, transactionId
   - Preserves existing data
   - Rollback: Removes new fields

### Creating New Migrations
```javascript
// Create backend/migrations/003_your_migration.js
module.exports = {
  up: async (db) => {
    // Add your migration logic
    await db.collection('users').updateMany({}, {
      $set: { newField: 'defaultValue' }
    });
  },
  
  down: async (db) => {
    // Rollback logic
    await db.collection('users').updateMany({}, {
      $unset: { newField: 1 }
    });
  }
};
```

## Monitoring & Logging

### Application Logging
```javascript
const logger = require('./backend/utils/logger');

// Different log levels
logger.error('Error occurred', error, { context: 'data' });
logger.warn('Warning message');
logger.info('Information event');
logger.debug('Debug details');

// Logs are written to:
// - Console (development)
// - logs/app.log (all events)
// - logs/error.log (errors only)
```

### Performance Monitoring
```javascript
const monitor = require('./backend/utils/monitor');

// Auto-tracked via middleware
// Or manual tracking:
monitor.recordRequest(path, method);
monitor.recordError(error);
monitor.recordResponseTime(duration);

// Get current metrics
const metrics = monitor.getMetrics();
console.log(`Requests: ${metrics.requests.total}`);
console.log(`Errors: ${metrics.errors.total}`);
console.log(`Avg Response Time: ${metrics.responseTime.average}ms`);
```

### Accessing Logs

**Local**: Check `logs/` directory
```bash
tail -f logs/app.log
tail -f logs/error.log
```

**AWS**: CloudWatch Logs
```bash
# View logs
aws logs tail /aws/ec2/bitebuddy --follow

# Get error logs
aws logs filter-log-events \
  --log-group-name /aws/ec2/bitebuddy \
  --filter-pattern "ERROR"
```

**Azure**: Application Insights
```bash
# Via Azure Portal or CLI
az monitor app-insights metrics show \
  --resource-group bitebuddy-prod \
  --app bitebuddy-insights
```

## Scaling Strategies

### Horizontal Scaling
- Add more application instances (AWS Auto Scaling / Azure App Service)
- Load balance requests across instances
- Use shared database for state

### Vertical Scaling
- Increase instance type (larger CPU/RAM)
- Better for single-threaded bottlenecks

### Database Scaling
- **MongoDB Atlas**: Automatic sharding
- **Cosmos DB**: Partition key optimization
- **Connection Pooling**: Reuse database connections

### Caching
- Implement Redis for sessions
- Cache frequently accessed data
- Use CDN for static assets

## Disaster Recovery

### Backup Strategy

**AWS**:
- RDS automated backups (35-day retention)
- Cross-region replication available
- Point-in-time recovery
- Snapshots before major changes

**Azure**:
- Cosmos DB automatic backup
- Geo-redundant storage
- Point-in-time recovery
- Backup policy configuration

### Rollback Procedures

1. **Application Code**:
   ```bash
   # Revert to previous Docker image
   # ALB automatically routes to new version
   ```

2. **Database**:
   ```bash
   # Run migration rollback
   node scripts/migrate-rollback.js
   ```

3. **Complete Infrastructure**:
   ```bash
   # Restore from snapshot (AWS/Azure)
   ```

## Performance Tuning

### Database Optimization
- Ensure all indexes are created (`001_create_indexes.js`)
- Monitor slow queries
- Use explain() to analyze queries
- Connection pooling enabled

### Frontend Optimization
- React build optimization in `frontend/Dockerfile`
- CloudFront caching for static assets
- Code splitting and lazy loading
- Image optimization

### Backend Optimization
- Request/response middleware timing
- Error handling efficiency
- Memory usage monitoring
- Connection pool sizing

## Security Checklist

- ✅ HTTPS/TLS enabled on all endpoints
- ✅ Environment variables for secrets (no hardcoded keys)
- ✅ CORS properly configured
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation on all routes
- ✅ JWT token validation
- ✅ Secure cookies (HttpOnly, Secure, SameSite)
- ✅ SQL injection prevention (MongoDB with Mongoose)
- ✅ XSS protection via Content Security Policy
- ✅ Regular dependency updates

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] Rollback plan documented

### Deployment
- [ ] Push code to repository
- [ ] CI/CD pipeline triggered
- [ ] Tests run and pass
- [ ] Docker images built
- [ ] Infrastructure health checked
- [ ] Database migrations applied
- [ ] Application deployed
- [ ] Smoke tests passing

### Post-Deployment
- [ ] Monitoring alerts configured
- [ ] Logs being written correctly
- [ ] Application responding normally
- [ ] Database operations working
- [ ] Email notifications sent correctly
- [ ] Payment processing working
- [ ] Frontend loading correctly
- [ ] Performance metrics acceptable

## Troubleshooting

### Common Issues

**Application not starting**
- Check logs: `docker logs <container>`
- Verify environment variables
- Test database connection
- Check port availability

**Database connection failing**
- Verify connection string
- Check database server status
- Verify network access
- Test with MongoDB Compass

**High response time**
- Check database slow queries
- Monitor CPU/memory usage
- Review CDN cache hit ratio
- Analyze network latency

**Payment processing errors**
- Verify Stripe API keys
- Check webhook endpoint
- Review Stripe dashboard
- Check error logs

## Support Resources

- **AWS Documentation**: https://docs.aws.amazon.com
- **Azure Documentation**: https://docs.microsoft.com/azure
- **Docker Documentation**: https://docs.docker.com
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Stripe API**: https://stripe.com/docs/api

## Additional Resources

- `PHASE5.md`: Testing and DevOps setup
- `PHASE6.md`: Phase 6 comprehensive documentation
- `jest.config.js`: Test configuration
- `docker-compose.yml`: Local deployment
- Test files in `tests/` directory
