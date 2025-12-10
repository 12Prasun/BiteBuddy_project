// Stripe payment service utility
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent for processing payments
 * @param {number} amount - Amount in smallest currency unit (e.g., cents for USD)
 * @param {string} email - Customer email
 * @param {string} orderId - Order ID for reference
 * @returns {Promise}
 */
const createPaymentIntent = async (amount, email, orderId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      receipt_email: email,
      metadata: {
        orderId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify payment intent status
 * @param {string} paymentIntentId - Payment Intent ID
 * @returns {Promise}
 */
const verifyPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      email: paymentIntent.receipt_email,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a customer in Stripe
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {string} phone - Customer phone
 * @returns {Promise}
 */
const createCustomer = async (email, name, phone) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone
    });

    return {
      success: true,
      customerId: customer.id
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Save payment method for future use
 * @param {string} paymentMethodId - Stripe Payment Method ID
 * @param {string} customerId - Stripe Customer ID
 * @returns {Promise}
 */
const attachPaymentMethod = async (paymentMethodId, customerId) => {
  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    return {
      success: true,
      message: 'Payment method saved'
    };
  } catch (error) {
    console.error('Error attaching payment method:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Refund a payment
 * @param {string} paymentIntentId - Payment Intent ID to refund
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @returns {Promise}
 */
const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get payment history for a customer
 * @param {string} email - Customer email
 * @returns {Promise}
 */
const getPaymentHistory = async (email) => {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10
    });

    const customerPayments = paymentIntents.data.filter(
      pi => pi.receipt_email === email
    );

    return {
      success: true,
      payments: customerPayments.map(pi => ({
        id: pi.id,
        amount: pi.amount / 100,
        status: pi.status,
        created: new Date(pi.created * 1000),
        metadata: pi.metadata
      }))
    };
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createPaymentIntent,
  verifyPaymentIntent,
  createCustomer,
  attachPaymentMethod,
  refundPayment,
  getPaymentHistory
};
