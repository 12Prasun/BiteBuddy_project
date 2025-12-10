const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Review = require('../models/Review');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

// Validation rules for reviews
const validateReview = [
  body('foodItemId').notEmpty().withMessage('Food item ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
];

// Create a new review
router.post('/reviews', verifyToken, validateReview, handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { foodItemId, rating, title, comment } = req.body;
    const userEmail = req.body.userEmail || req.user?.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Check if user already reviewed this item
    const existingReview = await Review.findOne({
      foodItemId,
      userEmail
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    const newReview = await Review.create({
      foodItemId,
      userId: req.user?.id,
      userName: req.body.userName || 'Anonymous',
      userEmail,
      rating,
      title,
      comment,
      verified: !!req.user?.id
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review'
    });
  }
}));

// Get reviews for a specific food item
router.get('/reviews/:foodItemId', asyncHandler(async (req, res) => {
  try {
    const { foodItemId } = req.params;
    const { sortBy = 'helpful', limit = 10, page = 1 } = req.query;

    const sortOptions = {
      newest: { createdAt: -1 },
      helpful: { helpful: -1, createdAt: -1 },
      highest: { rating: -1 },
      lowest: { rating: 1 }
    };

    const sort = sortOptions[sortBy] || sortOptions.helpful;
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      Review.find({ foodItemId })
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Review.countDocuments({ foodItemId }),
      Review.aggregate([
        { $match: { foodItemId: require('mongoose').Types.ObjectId(foodItemId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ])
    ]);

    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    if (stats[0]) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingCounts[rating]++;
      });
    }

    res.json({
      success: true,
      reviews,
      stats: {
        averageRating: stats[0]?.averageRating || 0,
        totalReviews: total,
        ratingDistribution: ratingCounts
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
}));

// Get user's reviews
router.get('/user-reviews', verifyToken, asyncHandler(async (req, res) => {
  try {
    const reviews = await Review.find({ userEmail: req.body.userEmail })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews'
    });
  }
}));

// Update a review
router.put('/reviews/:reviewId', verifyToken, asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userEmail = req.body.userEmail;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.userEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    review.updatedAt = new Date();

    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review'
    });
  }
}));

// Delete a review
router.delete('/reviews/:reviewId', verifyToken, asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userEmail = req.body.userEmail;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.userEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
}));

// Mark review as helpful
router.post('/reviews/:reviewId/helpful', asyncHandler(async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful = true } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (helpful) {
      review.helpful += 1;
    } else {
      review.unhelpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback',
      review
    });
  } catch (error) {
    console.error('Error updating review feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review feedback'
    });
  }
}));

module.exports = router;
