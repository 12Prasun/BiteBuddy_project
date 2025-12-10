const express = require('express')
const router = express.Router()
const Order = require('../models/Orders')
const { validateOrderData, handleValidationErrors } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../middleware/auth');

// Create or update order
router.post('/orderData', validateOrderData, handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { email, order_data, order_date } = req.body;

    if (!order_data || order_data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order data cannot be empty"
      });
    }

    // Add order date to the beginning of order data
    const orderDataWithDate = [...order_data];
    orderDataWithDate.unshift({ Order_date: order_date });

    // Check if user has existing orders
    let userOrders = await Order.findOne({ email });

    if (!userOrders) {
      // Create new order document
      const newOrder = await Order.create({
        email,
        order_data: [orderDataWithDate]
      });
      
      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        orderId: newOrder._id
      });
    } else {
      // Update existing order
      await Order.findOneAndUpdate(
        { email },
        { $push: { order_data: orderDataWithDate } },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Order added successfully"
      });
    }

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: "Error processing order"
    });
  }
}))

// Get user's orders
router.post('/myOrderData', handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const userOrders = await Order.findOne({ email });

    if (!userOrders) {
      return res.json({
        success: true,
        message: "No orders found",
        orderData: null
      });
    }

    res.json({
      success: true,
      orderData: userOrders
    });

  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders"
    });
  }
}))

// Alternative endpoint (removed duplicate myorderData)
// Use /myOrderData instead for consistency

module.exports = router;