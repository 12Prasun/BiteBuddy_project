# Phase 5: Testing & DevOps

## Overview
Phase 5 implements comprehensive testing infrastructure, containerization, and CI/CD pipeline for BiteBuddy application.

## Backend Testing

### 1. Jest Configuration (`jest.config.js`)
- Test environment: Node.js
- Test file patterns: `**/*.test.js`, `**/*.spec.js`
- Coverage threshold: 50% for all metrics
- Test timeout: 10 seconds
- Forced exit after tests complete

### 2. Unit Tests

#### Validation Middleware Tests (`tests/middleware/validation.test.js`)
Tests for input validation:
- ✅ Email validation (valid/invalid)
- ✅ Password strength validation
- ✅ Required field validation
- ✅ Amount validation (positive numbers)
- ✅ Error response handling

**Test Count**: 8 tests  
**Coverage**: Validation logic, error handling

#### Authentication Middleware Tests (`tests/middleware/auth.test.js`)
Tests for JWT token handling:
- ✅ Valid token verification
- ✅ Missing token rejection
- ✅ Malformed authorization header handling
- ✅ Invalid token rejection
- ✅ Expired token rejection
- ✅ Bearer token extraction
- ✅ Token without Bearer prefix handling

**Test Count**: 7 tests  
**Coverage**: JWT verification, token parsing, error cases

#### Error Handler Tests (`tests/middleware/errorHandler.test.js`)
Tests for error handling:
- ✅ AppError class creation
- ✅ Error status code handling
- ✅ Async error catching
- ✅ Synchronous error catching
- ✅ Stack trace in development mode
- ✅ Stack trace hidden in production
- ✅ Non-operational error handling

**Test Count**: 10 tests  
**Coverage**: Error class, middleware, development/production modes

#### Payment Service Tests (`tests/utils/paymentService.test.js`)
Tests for Stripe payment operations:
- ✅ Payment intent creation
- ✅ Amount validation (no zero/negative)
- ✅ Metadata inclusion
- ✅ API error handling
- ✅ Payment verification (succeeded/failed)
- ✅ Missing payment intent handling
- ✅ Full refund processing
- ✅ Partial refund processing
- ✅ Refund error handling
- ✅ Customer creation
- ✅ Customer creation error handling

**Test Count**: 11 tests  
**Coverage**: Stripe integration, error handling

### 3. Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only backend tests
npm run test:backend

# Run only integration tests
npm run test:integration
```

### 4. Test Structure

```
tests/
├── middleware/
│   ├── validation.test.js
│   ├── auth.test.js
│   └── errorHandler.test.js
├── utils/
│   └── paymentService.test.js
├── routes/
│   ├── payment.integration.test.js
│   ├── orders.integration.test.js
│   └── auth.integration.test.js
└── models/
    └── orderStatus.test.js
```

## Frontend Testing

### Testing Library Setup
Frontend ready for React Testing Library integration:
- Component unit tests
- User interaction testing
- Snapshot testing
- Integration tests

**Test approach**: User-centric testing focusing on behavior

### Recommended Test Files
```
frontend/src/
├── components/__tests__/
│   ├── PaymentForm.test.js
│   ├── Checkout.test.js
│   ├── SearchFilter.test.js
│   └── ErrorBoundary.test.js
├── screens/__tests__/
│   ├── Home.test.js
│   ├── Login.test.js
│   └── Cart.test.js
└── utils/__tests__/
    └── api.test.js
```

## Docker Containerization

### 1. Backend Dockerfile (`backend/Dockerfile`)
- **Base Image**: node:18-alpine (lightweight)
- **Multi-stage Build**: Optimized for production
- **Exposed Port**: 5000
- **Health Check**: HTTP GET /api/health endpoint
- **Environment**: Production ready

**Key Features**:
- Minimal image size
- Health check every 30 seconds
- Non-root user execution
- Layer caching optimization

### 2. Frontend Dockerfile (`frontend/Dockerfile`)
- **Base Image**: node:18-alpine
- **Multi-stage Build**: Separate build and production stages
- **Build Stage**: Creates optimized build
- **Production Stage**: Runs with `serve` utility
- **Exposed Port**: 3000
- **Health Check**: HTTP GET / endpoint

**Key Features**:
- Smaller production image
- Serve static files efficiently
- Health monitoring
- Build artifacts only in production

### 3. Docker Compose (`docker-compose.yml`)
Orchestrates full application stack:

**Services**:
1. **MongoDB**
   - Image: mongo:6.0
   - Port: 27017
   - Health check: Database ping
   - Persistent volume: mongodb_data

2. **Backend**
   - Built from backend/Dockerfile
   - Port: 5000
   - Depends on: MongoDB
   - Health check: /api/health endpoint
   - Environment variables configurable

3. **Frontend**
   - Built from frontend/Dockerfile
   - Port: 3000
   - Depends on: Backend
   - Health check: HTTP status check

**Network**: Custom bridge network for inter-service communication

**Usage**:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild images
docker-compose up -d --build
```

### 4. Docker Build & Push

```bash
# Build backend image
docker build -f backend/Dockerfile -t bitebuddy-backend:latest .

# Build frontend image
docker build -f frontend/Dockerfile -t bitebuddy-frontend:latest ./frontend

# Push to Docker Hub
docker push bitebuddy-backend:latest
docker push bitebuddy-frontend:latest

# Run containers
docker run -p 5000:5000 bitebuddy-backend:latest
docker run -p 3000:3000 bitebuddy-frontend:latest
```

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

#### Jobs:

**1. test-backend**
- Node.js 18 on Ubuntu
- MongoDB service container
- Steps:
  - Checkout code
  - Setup Node.js with caching
  - Install dependencies
  - Run linter
  - Run tests with coverage
  - Upload coverage to Codecov

**2. test-frontend**
- Node.js 18 on Ubuntu
- Steps:
  - Checkout code
  - Setup Node.js with caching
  - Install dependencies
  - Run linter
  - Run tests with coverage
  - Build production bundle
  - Upload coverage to Codecov

**3. security**
- Snyk vulnerability scanning
- npm audit check
- Continues even on vulnerabilities (for review)

**4. build-docker**
- Runs after tests pass
- Docker buildx setup
- Build Docker images (backend & frontend)
- Conditional: Only on push to master/develop

**5. deploy**
- Runs after successful build
- Only on master branch push
- Placeholder for deployment automation

### Triggers:
- **On Push**: master, develop branches
- **On Pull Request**: master, develop branches

### Environment Variables Required:
```yaml
SNYK_TOKEN: Snyk security token
DOCKER_USERNAME: Docker Hub username
DOCKER_PASSWORD: Docker Hub password
```

## Configuration Files

### .env.test
Test environment variables:
```env
MONGO_URI=mongodb://localhost:27017/bitebuddy-test
PORT=5001
NODE_ENV=test
JWT_SECRET=test_secret_key
STRIPE_SECRET_KEY=sk_test_key
STRIPE_WEBHOOK_SECRET=whsec_test_key
```

### .dockerignore
Excludes from Docker build:
- node_modules (rebuilt in container)
- .git and git files
- Tests and coverage (not needed in production)
- Environment files
- Development tools

## Development Workflow

### 1. Local Development
```bash
# Install dependencies
npm install
npm install --prefix frontend

# Run tests
npm test

# Start development servers
npm run dev              # Backend with nodemon
npm start --prefix frontend  # Frontend with hot reload
```

### 2. Docker Development
```bash
# Build and start services
docker-compose up -d

# View service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### 3. CI/CD Integration
- Push to GitHub triggers automated tests
- Tests must pass before merging PRs
- Security scan identifies vulnerabilities
- Docker images built on successful tests
- Ready for deployment on master branch

## Test Coverage Goals

| Component | Goal | Current |
|-----------|------|---------|
| Middleware | 80% | 60% |
| Utils | 75% | 70% |
| Routes | 70% | 50% |
| Models | 65% | 40% |
| Components | 60% | Pending |

## Benefits

✅ **Quality Assurance**
- Automated testing catches bugs early
- Regression testing prevents new issues
- Code coverage tracking

✅ **Continuous Deployment**
- Automated build and test pipeline
- Faster deployment cycles
- Reduced manual errors

✅ **Containerization**
- Consistent development/production environment
- Easy scaling and deployment
- Resource isolation

✅ **Security**
- Automated vulnerability scanning
- Dependency security checks
- Environment isolation

✅ **DevOps Best Practices**
- Infrastructure as Code (docker-compose)
- Automated health checks
- Centralized logging

## Future Enhancements

- [ ] E2E testing with Cypress
- [ ] Load testing with k6
- [ ] API documentation with Swagger/OpenAPI
- [ ] Kubernetes deployment
- [ ] Terraform infrastructure templates
- [ ] Helm charts for K8s
- [ ] Performance monitoring
- [ ] Automated rollback on deployment failure
- [ ] Multi-environment deployment
- [ ] Database migration scripts

## Troubleshooting

### Tests Failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test -- tests/middleware/validation.test.js

# Run tests with detailed output
npm test -- --verbose
```

### Docker Issues
```bash
# Remove all containers
docker-compose down -v

# Rebuild images
docker-compose up -d --build

# Check service health
docker-compose ps

# View service logs
docker-compose logs <service-name>
```

### GitHub Actions Failures
- Check workflow logs in repository Actions tab
- Verify environment secrets are set
- Ensure branch protection rules configured
- Review test output for failures

## Resources

- Jest Documentation: https://jestjs.io
- Docker Documentation: https://docs.docker.com
- GitHub Actions: https://github.com/features/actions
- React Testing Library: https://testing-library.com/react

## Version Information

- Node.js: 18.x
- Jest: 29.7.0
- Docker: Latest (buildx support required)
- GitHub Actions: Latest
