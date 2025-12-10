import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from './UIComponents';
import '../styles/Checkout.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const Checkout = ({ cartItems, userDetails }) => {
  const navigate = useNavigate();
  const [checkoutStatus, setCheckoutStatus] = useState('ready'); // ready, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Calculate total
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;

  // Create order before payment
  const createOrder = async () => {
    try {
      setCheckoutStatus('processing');
      setErrorMessage('');

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          items: cartItems,
          deliveryAddress: userDetails.address,
          userName: userDetails.name,
          userPhone: userDetails.phone,
          email: userDetails.email,
          totalAmount: total,
          paymentMethod: 'stripe'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      setOrderId(data.orderId);
      setOrderCreated(true);
      return data.orderId;
    } catch (error) {
      setErrorMessage(error.message);
      setCheckoutStatus('error');
      return null;
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setSuccessMessage('Order placed successfully! You will be redirected shortly.');
      setCheckoutStatus('success');

      // Clear cart and redirect after delay
      setTimeout(() => {
        // Clear cart from localStorage/context
        localStorage.removeItem('cart');
        navigate(`/order/${orderId}`, { state: { paymentData } });
      }, 2000);
    } catch (error) {
      console.error('Error after payment:', error);
    }
  };

  const handlePaymentError = (error) => {
    setErrorMessage(error.message || 'Payment failed. Please try again.');
    setCheckoutStatus('error');
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Complete Your Order</h1>
        <p>Secure payment powered by Stripe</p>
      </div>

      <div className="checkout-content">
        {/* Left Column - Order Summary */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {checkoutStatus === 'ready' && !orderCreated && (
            <button
              className="create-order-button"
              onClick={createOrder}
              disabled={cartItems.length === 0}
            >
              Proceed to Payment
            </button>
          )}

          {checkoutStatus === 'processing' && (
            <div className="processing-state">
              <LoadingSpinner />
              <p>Creating your order...</p>
            </div>
          )}

          {orderCreated && (
            <div className="order-created-info">
              <div className="success-badge">✓ Order Created</div>
              <p>Order ID: <strong>{orderId}</strong></p>
              <p>Proceed with payment to confirm your order.</p>
            </div>
          )}

          {/* Order Details */}
          <div className="order-details">
            <h3>Delivery Information</h3>
            <div className="info-item">
              <span>Name:</span>
              <span className="value">{userDetails.name}</span>
            </div>
            <div className="info-item">
              <span>Phone:</span>
              <span className="value">{userDetails.phone}</span>
            </div>
            <div className="info-item">
              <span>Email:</span>
              <span className="value">{userDetails.email}</span>
            </div>
            <div className="info-item">
              <span>Address:</span>
              <span className="value">{userDetails.address}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="items-list">
            <h3>Items ({cartItems.length})</h3>
            {cartItems.map((item, index) => (
              <div key={index} className="item-row">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">x{item.quantity}</span>
                <span className="item-price">₹{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? 'free' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          {deliveryFee === 0 && (
            <div className="free-delivery-badge">
              🚚 Free Delivery (Order > ₹500)
            </div>
          )}
        </div>

        {/* Right Column - Payment Form */}
        <div className="checkout-payment">
          {errorMessage && <ErrorMessage message={errorMessage} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          {orderCreated ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: '', // Will be set by PaymentForm
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm
                orderDetails={{
                  orderId,
                  email: userDetails.email,
                  userPhone: userDetails.phone,
                  userName: userDetails.name,
                  deliveryAddress: userDetails.address,
                  items: cartItems,
                  totalAmount: total,
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                isProcessing={checkoutStatus === 'processing'}
              />
            </Elements>
          ) : (
            <div className="payment-placeholder">
              <p>Create your order first to proceed with payment</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Info */}
      <div className="checkout-mobile-info">
        <p>💡 Order summary and payment form will be displayed below on mobile devices</p>
      </div>
    </div>
  );
};

export default Checkout;
