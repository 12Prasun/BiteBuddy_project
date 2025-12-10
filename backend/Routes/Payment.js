const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');
const paymentService = require('../utils/paymentService');
const OrderStatus = require('../models/OrderStatus');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { generateReceiptHTML } = require('../utils/receiptGenerator');
const { sendEmail } = require('../utils/emailService');

// Validation rules
const validatePayment = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('orderId').notEmpty().withMessage('Order ID is required')
];

// Create payment intent
router.post('/payment/create-intent', validatePayment, handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { amount, email, orderId, description } = req.body;

    // Verify order exists
    const order = await OrderStatus.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create payment intent
    const result = await paymentService.createPaymentIntent(
      amount,
      email,
      orderId,
      { description: description || 'Food Order' }
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
}));

// Verify payment
router.post('/payment/verify', validatePayment, handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Verify with Stripe
    const result = await paymentService.verifyPaymentIntent(paymentIntentId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Update order payment status
    if (result.status === 'succeeded') {
      const order = await OrderStatus.findOne({ orderId });
      if (order) {
        order.paymentStatus = 'completed';
        order.transactionId = paymentIntentId;
        if (order.status === 'pending') {
          order.status = 'confirmed';
          order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date(),
            message: 'Payment received. Order confirmed'
          });
        }
        await order.save();

        // Send receipt email
        try {
          const receiptHTML = generateReceiptHTML(order);
          await sendEmail({
            to: order.email,
            subject: `Order Receipt - BiteBuddy #${order.orderId}`,
            html: receiptHTML
          });
        } catch (emailError) {
          console.error('Error sending receipt email:', emailError);
          // Don't fail the payment if email fails
        }
      }
    }

    res.json({
      success: true,
      status: result.status,
      message: `Payment ${result.status}`
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
}));

// Get payment history
router.post('/payment/history', asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await paymentService.getPaymentHistory(email);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      payments: result.payments
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history'
    });
  }
}));

// Refund payment
router.post('/payment/refund', asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId, orderId, reason } = req.body;

    // Verify order and user permission
    const order = await OrderStatus.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund delivered orders'
      });
    }

    // Process refund
    const result = await paymentService.refundPayment(paymentIntentId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Update order
    order.paymentStatus = 'refunded';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      message: `Refund processed: ${reason || 'Customer requested refund'}`
    });
    await order.save();

    res.json({
      success: true,
      refundId: result.refundId,
      amount: result.amount,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund'
    });
  }
}));

// Webhook for Stripe events
router.post('/payment/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order if exists
        if (paymentIntent.metadata.orderId) {
          const order = await OrderStatus.findOne({ orderId: paymentIntent.metadata.orderId });
          if (order && order.paymentStatus !== 'completed') {
            order.paymentStatus = 'completed';
            order.transactionId = paymentIntent.id;
            await order.save();
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        if (failedPayment.metadata.orderId) {
          const order = await OrderStatus.findOne({ orderId: failedPayment.metadata.orderId });
          if (order) {
            order.paymentStatus = 'failed';
            await order.save();
          }
        }
        break;

      case 'charge.refunded':
        const refundedCharge = event.data.object;
        console.log('Charge refunded:', refundedCharge.id);
        
        // Send refund notification email if order info available
        try {
          const order = await OrderStatus.findOne({ transactionId: refundedCharge.payment_intent });
          if (order) {
            await sendEmail({
              to: order.email,
              subject: `Refund Processed - BiteBuddy Order #${order.orderId}`,
              html: `
                <h2>Refund Confirmation</h2>
                <p>Your refund has been processed successfully.</p>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Refund Amount:</strong> ₹${(refundedCharge.amount / 100).toFixed(2)}</p>
                <p>The refund will appear in your account within 3-5 business days.</p>
                <p>Thank you for your understanding!</p>
              `
            });
          }
        } catch (emailError) {
          console.error('Error sending refund email:', emailError);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook'
    });
  }
}));

module.exports = router;
