import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../styles/PaymentForm.css';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from './UIComponents';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
    },
  },
  hidePostalCode: false,
};

const PaymentForm = ({ 
  orderDetails, 
  onPaymentSuccess, 
  onPaymentError,
  isProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [cardholderName, setCardholderName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Calculate totals
  const subtotal = orderDetails.items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;

  const handleCreateIntent = async () => {
    try {
      setPaymentStatus('processing');
      setErrorMessage('');

      // Call backend to create payment intent
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          email: orderDetails.email,
          orderId: orderDetails.orderId,
          metadata: {
            orderId: orderDetails.orderId,
            customerEmail: orderDetails.email
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      return data.clientSecret;
    } catch (error) {
      setErrorMessage(error.message);
      setPaymentStatus('error');
      onPaymentError?.(error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Payment system not ready. Please refresh and try again.');
      return;
    }

    if (!cardholderName.trim()) {
      setErrorMessage('Please enter cardholder name');
      return;
    }

    try {
      setPaymentStatus('processing');
      setErrorMessage('');

      // Create or get payment intent
      let secret = clientSecret;
      if (!secret) {
        secret = await handleCreateIntent();
        if (!secret) return;
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: orderDetails.email,
            phone: orderDetails.userPhone,
          },
        },
        save_payment_method: saveCard,
      });

      if (error) {
        setErrorMessage(error.message);
        setPaymentStatus('error');
        onPaymentError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        // Verify payment on backend
        const verifyResponse = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderId: orderDetails.orderId,
            amount: total,
            email: orderDetails.email
          })
        });

        if (verifyResponse.ok) {
          setSuccessMessage('Payment successful! Your order is confirmed.');
          setPaymentStatus('success');
          setCardholderName('');
          elements.getElement(CardElement).clear();
          
          // Callback to parent component
          onPaymentSuccess?.({
            paymentIntentId: paymentIntent.id,
            amount: total,
            status: 'succeeded'
          });
        } else {
          throw new Error('Failed to verify payment');
        }
      } else if (paymentIntent.status === 'requires_action') {
        setErrorMessage('Payment requires additional authentication. Please complete the process.');
        setPaymentStatus('error');
      } else {
        setErrorMessage('Payment could not be completed. Please try again.');
        setPaymentStatus('error');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Payment processing failed');
      setPaymentStatus('error');
      onPaymentError?.(error);
    }
  };

  return (
    <div className="payment-form-container">
      <h3 className="payment-form-title">Payment Details</h3>

      {/* Order Summary */}
      <div className="payment-summary">
        <h4>Order Summary</h4>
        <div className="summary-items">
          {orderDetails.items.map((item, index) => (
            <div key={index} className="summary-item">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="summary-divider"></div>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total Amount</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="payment-form">
        {/* Cardholder Name */}
        <div className="form-group">
          <label htmlFor="cardholderName">Cardholder Name</label>
          <input
            id="cardholderName"
            type="text"
            placeholder="John Doe"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            disabled={paymentStatus === 'processing' || isProcessing}
            required
            className="form-input"
          />
        </div>

        {/* Email Display */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={orderDetails.email}
            disabled
            className="form-input"
          />
        </div>

        {/* Card Element */}
        <div className="form-group">
          <label htmlFor="card-element">Card Details</label>
          <div className="card-element-wrapper" id="card-element">
            <CardElement 
              options={CARD_ELEMENT_OPTIONS}
              onChange={(event) => {
                if (event.error) {
                  setErrorMessage(event.error.message);
                } else {
                  setErrorMessage('');
                }
              }}
            />
          </div>
        </div>

        {/* Save Card Checkbox */}
        <div className="form-group checkbox">
          <input
            id="saveCard"
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            disabled={paymentStatus === 'processing' || isProcessing}
          />
          <label htmlFor="saveCard">Save this card for future payments</label>
        </div>

        {/* Status Messages */}
        {errorMessage && <ErrorMessage message={errorMessage} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        {/* Submit Button */}
        <button
          type="submit"
          className="payment-button"
          disabled={!stripe || paymentStatus === 'processing' || paymentStatus === 'success' || isProcessing}
        >
          {paymentStatus === 'processing' || isProcessing ? (
            <>
              <LoadingSpinner /> Processing...
            </>
          ) : paymentStatus === 'success' ? (
            '✓ Payment Successful'
          ) : (
            `Pay ₹${total.toFixed(2)}`
          )}
        </button>
      </form>

      {/* Security Info */}
      <div className="payment-security-info">
        <p>🔒 Your payment information is secure. We use industry-standard encryption.</p>
      </div>
    </div>
  );
};

export default PaymentForm;
