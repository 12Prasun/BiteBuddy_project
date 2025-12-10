# BiteBuddy Project - Development Guide

## Recent Improvements

### Phase 1 - Backend Security & Validation ✅
- Moved hardcoded MongoDB URI to environment variables
- Created JWT secret in `.env` file
- Added CORS configuration via environment variables
- Implemented password strength validation
- Created centralized validation middleware
- Enhanced error handling and logging
- Standardized API response format

### Phase 2 - Frontend Improvements ✅
- Created Error Boundary component for crash handling
- Added Loading Spinner and UI feedback components
- Implemented SearchFilter component with category filtering
- Created Pagination component for future use
- Improved Navbar with better responsive design
- Added Empty State component for better UX
- Created API utility functions with centralized configuration
- Enhanced responsive CSS with mobile-first approach
- Improved hover effects and transitions
- Added accessibility improvements (ARIA labels)
- Better carousel styling and carousel captions

### Phase 3 - New Features & Notifications ✅
- **Reviews & Ratings System**
  - ReviewModel with rating aggregation
  - Review routes (CRUD operations)
  - Frontend ReviewSection component
  - Rating distribution display
  - Helpful/unhelpful feedback system

- **Order Tracking & Status**
  - OrderStatus model with status history
  - Enhanced order routes with tracking
  - Frontend OrderTracking component
  - Real-time status updates
  - Delivery timeline visualization
  - Order cancellation support

- **Email Notifications**
  - Email templates for order confirmations
  - Status update notifications
  - Welcome emails
  - Password reset emails
  - Review reminder emails
  - Email service utility (Nodemailer)

### Phase 4 - Payment Integration with Stripe 🟡
- **Stripe Payment Processing**
  - Payment service wrapper (createPaymentIntent, verifyPaymentIntent, etc.)
  - Payment routes with 5 endpoints (create-intent, verify, history, refund, webhook)
  - Secure card payment via Stripe Elements
  - Payment intent creation and verification

- **Receipt Generation**
  - PDF receipt generation with PDFKit
  - HTML receipt templates
  - Professional receipt styling
  - Automatic email receipt sending

- **Frontend Payment Components**
  - PaymentForm component with Stripe integration
  - Checkout component with order creation flow
  - Order summary display
  - Responsive payment UI
  - Real-time payment status feedback

- **Webhook Integration**
  - Stripe webhook handler for payment events
  - payment_intent.succeeded handling
  - payment_intent.payment_failed handling
  - charge.refunded handling
  - Email notifications on refund

- **Dependencies Updated**
  - Added Nodemailer for email sending

## File Structure

```
backend/
├── middleware/
│   ├── validation.js        (Input validation rules)
│   ├── errorHandler.js      (Error handling utilities)
│   └── auth.js              (Authentication middleware)
├── Routes/
│   ├── CreateUser.js        (User signup/login)
│   ├── DisplayData.js       (Food items and categories)
│   ├── OrderData.js         (Legacy order routes)
│   ├── Reviews.js           (Reviews CRUD operations)
│   └── Orders.js            (Order tracking and status)
├── models/
│   ├── User.js              (User schema)
│   ├── Orders.js            (Legacy orders schema)
│   ├── OrderStatus.js       (Enhanced order with tracking)
│   └── Review.js            (Reviews schema)
├── utils/
│   ├── emailService.js      (Email sending utility)
│   └── emailTemplates.js    (Email HTML templates)
├── config.js                (Configuration file)
├── db.js                    (Database connection)
└── index.js                 (Server entry point)

frontend/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.js     (Error handling)
│   │   ├── SearchFilter.js      (Search & filter UI)
│   │   ├── ReviewSection.js     (Reviews display & form)
│   │   ├── OrderTracking.js     (Order status tracking)
│   │   ├── Navbar.js            (Navigation)
│   │   ├── Card.js              (Food item card)
│   │   ├── UIComponents.js      (Loading, Empty, Error states)
│   │   ├── Pagination.js        (Pagination control)
│   │   └── ContextReducer.js    (Cart state management)
│   ├── screens/
│   │   ├── Home.js              (Main page)
│   │   ├── Login.js             (Login page)
│   │   ├── Signup.js            (Registration page)
│   │   ├── Cart.js              (Shopping cart)
│   │   └── MyOrder.js           (Order history)
│   ├── utils/
│   │   └── api.js               (API configuration & helpers)
│   ├── styles/
│   │   └── responsive.css       (Responsive design styles)
│   └── App.js                   (Main App component)
└── package.json
```

## Environment Variables (.env)

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bitebuddy?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/createuser` - Create new user (signup)
- `POST /api/loginuser` - Login user

### Food Data
- `POST /api/foodData` - Get all food items and categories
- `GET /api/foodData?category=CategoryName` - Get food items by category

### Reviews
- `POST /api/reviews` - Create a new review (requires auth)
- `GET /api/reviews/:foodItemId` - Get reviews for a food item
- `GET /api/user-reviews` - Get user's reviews (requires auth)
- `PUT /api/reviews/:reviewId` - Update a review (requires auth)
- `DELETE /api/reviews/:reviewId` - Delete a review (requires auth)
- `POST /api/reviews/:reviewId/helpful` - Mark review as helpful/unhelpful

### Orders (New Enhanced Routes)
- `POST /api/orders` - Create new order with tracking (requires auth)
- `GET /api/orders/:orderId` - Get order details by ID
- `POST /api/my-orders` - Get user's order history
- `PUT /api/orders/:orderId/status` - Update order status (admin)
- `PUT /api/orders/:orderId/payment` - Update payment status
- `PUT /api/orders/:orderId/cancel` - Cancel an order

### Health
- `GET /api/health` - Check API status

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Next Steps (Upcoming Phases)

### Phase 2 - Frontend Improvements
- [ ] Add search and filtering UI
- [ ] Implement pagination
- [ ] Add loading states and error boundaries
- [ ] Improve responsive design

### Phase 3 - Features
- [ ] Payment integration (Stripe/PayPal)
- [ ] User reviews and ratings
- [ ] Order tracking with status
- [ ] Email notifications

### Phase 4 - Testing & Documentation
- [ ] Unit tests with Jest
- [ ] Integration tests
- [ ] API documentation with Swagger
- [ ] End-to-end tests

### Phase 5 - Deployment
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Database migration scripts
- [ ] Monitoring and logging

## Development Setup

1. Install dependencies:
```bash
npm install
cd frontend && npm install
```

2. Create `.env` file in backend folder with required variables

3. Start backend (from root):
```bash
npm start
```

4. Start frontend (in separate terminal):
```bash
cd frontend && npm start
```

## Database Models

### User Model
- name (String, required)
- email (String, required)
- password (String, required)
- location (String, required)
- date (Date, default: now)

### Orders Model
- email (String, required, unique)
- order_data (Array, required)

## Testing the API

### Create User
```bash
curl -X POST http://localhost:5000/api/createuser \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Test1234",
    "location": "New York"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/loginuser \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test1234"
  }'
```

### Get Food Data
```bash
curl -X POST http://localhost:5000/api/foodData
```

## Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI in .env file
- Verify MongoDB Atlas IP whitelist includes your IP
- Ensure credentials are correct

### JWT Token Invalid
- Clear browser localStorage and login again
- Check JWT_SECRET in .env matches signing secret
- Verify token hasn't expired

### CORS Errors
- Update CORS_ORIGIN in .env to match your frontend URL
- Check browser console for specific origin issues

## Contributing Guidelines

1. Create a new branch for features: `git checkout -b feature/feature-name`
2. Make changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to remote: `git push origin feature/feature-name`
5. Create pull request with detailed description

## Support

For issues or questions, create an issue in the GitHub repository.
