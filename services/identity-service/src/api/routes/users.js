// File path: services/identity-service/src/api/routes/users.js

// Import Express framework
// Express provides routing capabilities through its Router class
// This is a CommonJS module import (Node.js standard)
const express = require('express');

// Create a modular, mountable set of routes
// The router instance is a complete middleware and routing system
// It will contain all user-related routes
const router = express.Router();

// Import controller methods for user operations
// Object destructuring syntax extracts only the specific methods needed
// The relative path navigates to the controllers directory
// Each imported function will handle a specific route
const { updateProfile, getUserById } = require('../controllers/userController');

// Import authentication middleware
// This middleware will be used to protect routes that require authentication
// Relative path points to the middleware directory
const { authMiddleware } = require('../middleware/auth');

// Define route for retrieving a user by ID
// Route uses dynamic parameter :id which will be available as req.params.id
// GET verb follows RESTful conventions for retrieving resources
// No auth middleware means this route is publicly accessible
// @route GET /api/users/:id
// @desc  GET user by ID
router.get('/:id', getUserById);

// Define route for updating the authenticated user's profile
// PUT verb follows RESTful conventions for updating an existing resource
// authMiddleware ensures only authenticated users can access this route
// The middleware will execute before the controller function
// Path doesn't include :id because it uses the authenticated user's ID
// @route PUT /api/users/profile
// @desc  Update user profile
router.put('/profile', authMiddleware, updateProfile);

// Export the configured router
// This makes the routes available to be mounted in the main application
// Will be mounted at a base path (e.g., '/api/users') in the main app
module.exports = router;