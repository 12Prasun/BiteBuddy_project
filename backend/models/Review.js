const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  foodItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'food_items',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  unhelpful: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ReviewSchema.index({ foodItemId: 1, rating: -1 });
ReviewSchema.index({ userEmail: 1 });

module.exports = mongoose.model('review', ReviewSchema);
