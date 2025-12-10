const express = require('express')
const router = express.Router()
const User = require('../models/User')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validateCreateUser, validateLoginUser, handleValidationErrors } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const jwtSecret = process.env.JWT_SECRET || "MynameisEndtoEndYouTubeChannel$#"

// Create User / Sign Up
router.post("/createuser", validateCreateUser, handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = await User.create({
      name: req.body.name,
      password: secPassword,
      email: req.body.email,
      location: req.body.location
    });

    // Create JWT token
    const data = {
      user: {
        id: newUser.id
      }
    };
    const authToken = jwt.sign(data, jwtSecret);

    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      authToken: authToken 
    });

  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({ success: false, message: "Email already registered" });
    } else {
      res.status(500).json({ success: false, message: "Error creating user" });
    }
  }
}))

// Login User
router.post("/loginuser", validateLoginUser, handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare passwords
    const pwdCompare = await bcrypt.compare(password, userData.password);
    if (!pwdCompare) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Create JWT token
    const data = {
      user: {
        id: userData.id
      }
    };
    const authToken = jwt.sign(data, jwtSecret);

    res.json({ 
      success: true,
      message: "Logged in successfully",
      authToken: authToken,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
}))

module.exports = router;