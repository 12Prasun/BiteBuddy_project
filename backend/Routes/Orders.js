const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const OrderStatus = require('../models/OrderStatus');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');
const crypto = require('crypto');

// Generate unique order ID
const generateOrderId = () => {
  return 'ORD' + Date.now() + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Create new order with tracking
router.post('/orders', verifyToken, asyncHandler(async (req, res) => {
  try {
    const {
      userName,
      userPhone,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod = 'card',
      notes = ''
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    const orderId = generateOrderId();

    const newOrder = await OrderStatus.create({
      orderId,
      email: req.body.email,
      userName,
      userPhone,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      notes,
      estimatedDelivery: new Date(Date.now() + 45 * 60000), // 45 minutes from now
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        message: 'Order created and awaiting confirmation'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
}));

// Get order by order ID
router.get('/orders/:orderId', asyncHandler(async (req, res) => {
  try {
    const order = await OrderStatus.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
}));

// Get user's orders
router.post('/my-orders', handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const orders = await OrderStatus.find({ email })
      .sort({ createdAt: -1 });

    // Get summary stats
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      onTheWay: orders.filter(o => o.status === 'on_the_way').length,
      delivered: orders.filter(o => o.status === 'delivered').length
    };

    res.json({
      success: true,
      orders,
      stats
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
}));

// Update order status (Admin/Staff only)
router.put('/orders/:orderId/status', asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, transactionId, message } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await OrderStatus.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.status;
    order.status = status;

    if (transactionId) order.transactionId = transactionId;

    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    // Update status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      message: message || `Order status updated from ${previousStatus} to ${status}`
    });

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
}));

// Mark payment as completed
router.put('/orders/:orderId/payment', asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionId, paymentStatus = 'completed' } = req.body;

    const order = await OrderStatus.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentStatus = paymentStatus;
    if (transactionId) order.transactionId = transactionId;

    if (paymentStatus === 'completed' && order.status === 'pending') {
      order.status = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        message: 'Payment received. Order confirmed'
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated',
      order
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment'
    });
  }
}));

// Cancel order
router.put('/orders/:orderId/cancel', asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason = 'User requested cancellation' } = req.body;

    const order = await OrderStatus.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      message: reason
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
}));

module.exports = router;
