# Phase 4: Payment Integration with Stripe

## Overview
Phase 4 implements secure payment processing using Stripe, receipt generation, and email notifications for completed transactions.

## Backend Implementation

### 1. Payment Service (`backend/utils/paymentService.js`)
Stripe payment wrapper with core functions:
- **createPaymentIntent()** - Creates Stripe payment intent for specific amount and order
- **verifyPaymentIntent()** - Verifies payment status with Stripe
- **createCustomer()** - Creates Stripe customer profile for recurring payments
- **attachPaymentMethod()** - Saves payment method for future use
- **refundPayment()** - Processes full or partial refunds
- **getPaymentHistory()** - Retrieves customer's payment history

### 2. Receipt Generator (`backend/utils/receiptGenerator.js`)
PDF and HTML receipt generation:
- **generateReceiptPDF()** - Creates professional PDF receipt using PDFKit
- **generateReceiptHTML()** - Creates responsive HTML receipt for email

Receipt includes:
- Order details and ID
- Customer and delivery information
- Item list with quantities and prices
- Price breakdown (subtotal, tax, delivery fee)
- Payment information and transaction ID
- Professional branding and footer

### 3. Payment Routes (`backend/Routes/Payment.js`)
RESTful endpoints for payment processing:

#### POST `/api/payment/create-intent`
Creates Stripe payment intent
- **Request**: amount, email, orderId
- **Validation**: Verifies order exists
- **Response**: clientSecret, paymentIntentId
- **Use**: Frontend calls this before card payment

#### POST `/api/payment/verify`
Verifies payment and updates order
- **Request**: paymentIntentId, orderId
- **Function**: 
  - Confirms with Stripe
  - Updates OrderStatus model
  - Sends receipt email
- **Response**: Payment status and confirmation

#### POST `/api/payment/history`
Gets customer's payment history
- **Request**: email
- **Response**: Array of payments with details

#### POST `/api/payment/refund`
Processes refund for order
- **Request**: paymentIntentId, orderId, reason
- **Validation**: 
  - Verifies order exists
  - Prevents refund of delivered orders
- **Action**: Updates payment status, adds cancel event
- **Response**: Refund ID and amount

#### POST `/api/payment/webhook`
Handles Stripe webhook events
- **payment_intent.succeeded**: Updates order payment status
- **payment_intent.payment_failed**: Records failed payment
- **charge.refunded**: Sends refund notification email
- **Security**: Verifies webhook signature

### 4. Email Integration
Receipt and payment notification emails sent via Nodemailer:
- **Order confirmation** with receipt HTML
- **Payment status** updates
- **Refund notifications** with processing details

## Frontend Implementation

### 1. Payment Form Component (`frontend/src/components/PaymentForm.js`)
Secure card payment interface using Stripe Elements:
- **CardElement**: Secure card input with Stripe encryption
- **Features**:
  - Cardholder name validation
  - Order summary display
  - Save card for future use option
  - Real-time error feedback
  - Loading and success states
  - Security information display

**Props**:
- `orderDetails` - Order information
- `onPaymentSuccess` - Callback after successful payment
- `onPaymentError` - Error handler
- `isProcessing` - Processing state flag

**Methods**:
- `handleCreateIntent()` - Calls backend to create payment intent
- `handleSubmit()` - Processes payment with Stripe

### 2. Checkout Component (`frontend/src/components/Checkout.js`)
Complete checkout flow with order creation and payment:
- **Two-column layout**:
  - Left: Order summary (sticky on desktop)
  - Right: Payment form
- **Features**:
  - Order creation before payment
  - Order summary with items and pricing
  - Delivery information display
  - Free delivery threshold indicator (> ₹500)
  - Payment success handling
  - Error handling and retry capability

**Integration**:
- Uses Elements provider for Stripe
- Calls `/api/orders` to create order
- Calls `/api/payment/verify` after successful payment
- Redirects to order detail page after payment

### 3. Styling
- **PaymentForm.css** - Payment form and card element styling
- **Checkout.css** - Two-column checkout layout with responsive design
- Mobile-first approach with breakpoints at 992px, 768px, 576px

## Environment Configuration

### Backend (.env)
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Frontend (.env)
```env
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_public_key
```

## Dependencies Added

### Backend
- **stripe** (v12.10.0) - Stripe API client
- **pdfkit** (v0.13.0) - PDF generation

### Frontend
- **@stripe/react-stripe-js** (v2.4.0) - React Stripe integration
- **@stripe/stripe-js** (v1.46.0) - Stripe JavaScript library

## Security Considerations

### PCI Compliance
- ✅ Card data never touches your server
- ✅ Stripe Elements handle card input
- ✅ All communication encrypted with HTTPS
- ✅ Server never stores card details

### Authentication
- ✅ JWT token required for payment endpoints
- ✅ Order verification before payment acceptance
- ✅ Webhook signature verification

### Webhook Security
- ✅ STRIPE_WEBHOOK_SECRET used to verify webhook authenticity
- ✅ Signature validation on every webhook event
- ✅ Prevents replay attacks

## Payment Flow

```
1. User adds items to cart
2. User clicks "Checkout"
3. Checkout component creates order via POST /api/orders
4. Order ID returned and stored
5. PaymentForm renders with order details
6. User enters card details (securely via Stripe)
7. User clicks "Pay"
8. PaymentForm calls POST /api/payment/create-intent
9. Backend returns clientSecret
10. PaymentForm confirms payment with Stripe
11. Stripe returns payment result
12. PaymentForm calls POST /api/payment/verify
13. Backend:
    - Verifies with Stripe
    - Updates OrderStatus to "confirmed"
    - Sends receipt email
14. Frontend shows success message
15. Redirects to order detail page
```

## Error Handling

### Frontend
- Card validation errors displayed in real-time
- Network error messages with retry option
- Payment failure messages with reason
- Graceful fallback if Stripe not loaded

### Backend
- Order verification before payment
- Stripe API error handling
- Email sending failures don't block payment confirmation
- Comprehensive logging for debugging

## Testing Stripe Payments

### Test Card Numbers
- **Visa**: 4242 4242 4242 4242
- **Declined Card**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### Test Expiry & CVC
- Any future date (e.g., 12/25)
- Any 3-digit CVC (e.g., 123)

### Webhook Testing
Use Stripe CLI to forward events:
```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
stripe trigger payment_intent.succeeded
```

## Configuration Steps

### 1. Stripe Dashboard Setup
- Get API keys from https://dashboard.stripe.com
- Create webhook endpoint pointing to `/api/payment/webhook`
- Get webhook signing secret

### 2. Environment Variables
Set in `.env`:
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### 3. Install Dependencies
```bash
npm install
npm install --prefix frontend
```

### 4. Run Application
```bash
npm start              # Starts backend
npm start --prefix frontend  # Starts frontend
```

## Features Implemented

✅ Secure card payment processing  
✅ Payment intent creation and verification  
✅ Order creation before payment  
✅ Receipt generation (HTML and PDF)  
✅ Receipt email sending  
✅ Refund processing  
✅ Webhook event handling  
✅ Payment history retrieval  
✅ Error handling and validation  
✅ Mobile-responsive checkout  
✅ Save card for future use option  
✅ Real-time payment status  

## Future Enhancements

- [ ] Wallet payment methods (Apple Pay, Google Pay)
- [ ] Multiple currency support
- [ ] Subscription management
- [ ] Payment history in user dashboard
- [ ] Invoice generation and download
- [ ] Payment method management UI
- [ ] Installment payment options
- [ ] Multiple payment gateway support

## Related Files

### Backend
- `backend/Routes/Payment.js` - Payment endpoints
- `backend/utils/paymentService.js` - Stripe operations
- `backend/utils/receiptGenerator.js` - Receipt generation
- `backend/models/OrderStatus.js` - Order model with payment fields
- `backend/index.js` - Payment routes mounting
- `backend/.env.example` - Configuration template

### Frontend
- `frontend/src/components/PaymentForm.js` - Payment form component
- `frontend/src/components/Checkout.js` - Checkout page component
- `frontend/src/styles/PaymentForm.css` - Payment form styling
- `frontend/src/styles/Checkout.css` - Checkout page styling
- `frontend/package.json` - Dependencies

## Troubleshooting

### "Stripe not loaded" error
- Check `REACT_APP_STRIPE_PUBLIC_KEY` in .env
- Restart frontend development server after env change

### Webhook events not received
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint in Stripe dashboard
- Use Stripe CLI to test webhook forwarding

### Email not sent
- Verify email credentials in .env
- Check email service configuration in emailService.js
- Review backend logs for email errors

### Order not created
- Verify user authentication token
- Check order creation endpoint logs
- Ensure MongoDB OrderStatus model initialized

## Version Information

- Node.js: >= 14.0.0
- Express: >= 4.18.0
- React: >= 18.0.0
- Stripe: >= 12.0.0
- MongoDB: 4.0+
