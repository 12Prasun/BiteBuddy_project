const express = require('express')
const router = express.Router()
const { asyncHandler } = require('../middleware/errorHandler');

// Get food items and categories
router.post('/foodData', asyncHandler(async (req, res) => {
  try {
    if (!global.food_items || !global.foodCategory) {
      return res.status(503).json({
        success: false,
        message: "Food data not loaded from database"
      });
    }

    res.json({
      success: true,
      foodItems: global.food_items,
      foodCategories: global.foodCategory
    });
  } catch (error) {
    console.error('Error fetching food data:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching food data"
    });
  }
}))

// Get food items with optional filtering
router.get('/foodData', asyncHandler(async (req, res) => {
  try {
    const { category } = req.query;

    if (!global.food_items) {
      return res.status(503).json({
        success: false,
        message: "Food data not loaded from database"
      });
    }

    let foodData = global.food_items;

    // Filter by category if provided
    if (category) {
      foodData = foodData.filter(item => item.CategoryName === category);
    }

    res.json({
      success: true,
      count: foodData.length,
      foodItems: foodData,
      foodCategories: global.foodCategory
    });
  } catch (error) {
    console.error('Error fetching food data:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching food data"
    });
  }
}))

module.exports = router;