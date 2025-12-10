import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../components/PaymentForm';
import '../styles/Payment.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const state = location.state || {};
  const { cartItems = [], userEmail = '', userName = '', totalAmount = 0, orderDate = '' } = state;

  // Fallback to localStorage if state is empty
  const email = userEmail || localStorage.getItem('userEmail');
  const name = userName || localStorage.getItem('userName');
  const total = totalAmount || 0;

  if (!email) {
    return (
      <div className="payment-container">
        <div className="alert alert-danger">
          ❌ You must be logged in to proceed with payment.
          <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="payment-container">
        <div className="alert alert-warning">
          ⚠️ Your cart is empty. Add items before checkout.
          <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>💳 Secure Payment</h1>
        <p>Powered by Stripe</p>
      </div>

      <div className="payment-content">
        {/* Order Summary - Left Side */}
        <div className="payment-summary">
          <h2>Order Summary</h2>
          
          <div className="customer-info">
            <h4>Customer Details</h4>
            <p><strong>Name:</strong> {name || 'User'}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Date:</strong> {new Date().toDateString()}</p>
          </div>

          <div className="order-items">
            <h4>Items ({cartItems.length})</h4>
            <div className="items-list">
              {cartItems.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-size text-muted">x{item.qty} - {item.size}</span>
                  </div>
                  <span className="item-price">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal:</span>
              <span>₹{total}</span>
            </div>
            <div className="price-row">
              <span>Tax (5%):</span>
              <span>₹{(total * 0.05).toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Delivery:</span>
              <span>{total > 500 ? 'Free' : '₹50'}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>₹{(total + (total * 0.05) + (total > 500 ? 0 : 50)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form - Right Side */}
        <div className="payment-form-container">
          <div className="stripe-form">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <Elements stripe={stripePromise}>
              <PaymentForm
                orderDetails={{
                  items: cartItems,
                  email: email,
                  orderId: `order_${Date.now()}`,
                  totalAmount: total + (total * 0.05) + (total > 500 ? 0 : 50)
                }}
                onPaymentSuccess={() => {
                  navigate('/myOrderData', {
                    state: { success: true, message: 'Payment successful!' }
                  });
                }}
                onPaymentError={(err) => {
                  setError(err.message);
                }}
              />
            </Elements>
          </div>

          <div className="payment-security">
            <p>🔒 <strong>Your payment is secure</strong></p>
            <p>All transactions are encrypted and protected by Stripe's security standards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
