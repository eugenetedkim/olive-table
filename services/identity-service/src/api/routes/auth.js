// File path: services/identity-service/src/api/routes/auth.js

// Import Express framework - the most popular Node.js web application framework
// This provides the routing capabilities we're using in this file
const express = require('express');

// Create a new router instance from Express
// Router is a complete middleware and routing system (mini Express application)
// Allows us to define routes in a modular, mountable manner
const router = express.Router();

// Import specific controller methods using object destructuring
// This uses CommonJS module pattern with destructuring assignment
// We're importing only those methods we need, not the entire controller
// The '../' syntax navigates up one directory level then into controllers
const { register, login, getMe } = require('../controllers/authController');

// import auth middleware for protecting routes
// This middleware will verify JWT tokens before allowing access to protected routes
const { authMiddleware } = require('../middleware/auth');

// Route definition for user registration
// @route and @desc are JSDoc-style comments for documentation
// router.post creates an endpoint that responds to HTTP POST requests
// First parameter '/register' is the route path (relative to where this router is mounted)
// Second parameter is the controller function that handles this route
// POST is semantically correct for creating new resources (users)
// @route POST /api/auth/register
// @desc  Register a user
router.post('/register', register);

// Route definition for user login
// Similar pattern for registration route
// No middleware needed as this is a public endpoint
// Returns authentication token when successful
// @route POST /api/auth/login
// @desc  Authenticate user & get token
router.post('/login', login);

// Route definition for getting authenticated user's information
// Includes middleware as first parameter before the controller
// authMiddleware will run before getMe to verify the user is authenticated
// This protects the route from unauthorized access
// GET verb is semantically correct for retrieving resources
// @route GET /api/auth/me
// @desc  Get current user
router.get('/me', authMiddleware, getMe);

// Export the router so it can be mounted in the main application
// This makes all the defined routes available when this file is imported
// In Express, routers can be used as middleware with app.use();
module.exports = router;