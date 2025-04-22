// services/identity-service/src/index.js

// ------------------------------------------------------------------------
// Importing Dependencies (Third-Party Modules)
// ------------------------------------------------------------------------

const express = require('express'); // Express framework for routing and server handling
// Express is the core web framework used to create the server, define routing logic and handle HTTP requests

const cors = require('cors'); // CORS middleware to allow cross-origin requests
// Enables Cross-Origin Resource Sharing, allowing requests from different origins (e.g., frontend applications)

const morgan = require('morgan'); // HTTP request logger middleware for logging API calls
// Logs incoming HTTP requests to the console in a developer-friendly format, useful for monitoring and debugging

// ------------------------------------------------------------------------
// Importing Internal Modules (Custom Project Code)
// ------------------------------------------------------------------------

const { connectDB } = require('./infrastructure/db/mongoose');  // Database connection utility
// Handles the connection MongoDB using Mongoose ODM, abstracting the connection details and error handling.

const authRoutes = require('./api/routes/auth');  // Authentication route handlers
// Contains routes for login, register, and other authentication-related endpoints.

const userRoutes = require('./api/routes/users'); // User management route handlers
// Contains routes for user profile management, user data retrieval, and other user-related ooperations.

// ------------------------------------------------------------------------
// Express App Initialization
// ------------------------------------------------------------------------

const app = express();

// ------------------------------------------------------------------------
// Database Connection
// ------------------------------------------------------------------------

// Connect to Database
connectDB();
// Establishes connection to the MongoDB database using the connection utility
// This allows the service to perform CRUD operations on user data

// ------------------------------------------------------------------------
// Global Middleware Setup
// ------------------------------------------------------------------------

app.use(cors());  // Enables Cross-Origin Resource Sharing (CORS) for handling cross-origin requests
// Allows frontend applications from different domains to interact with this service

app.use(morgan('dev')); // Logs HTTP requests in the "dev" format for development purposes
// Provides detailed logging of incoming requests for debugging and monitoring 

app.use(express.json()); // Parses incoming requests with JSON payloads
// Automatically parses JSON request bodies into JavaScript objects accessible via req.body

// ------------------------------------------------------------------------
// Routes Registration
// ------------------------------------------------------------------------

app.use('/api/auth', authRoutes); // Mount authentication routes at /api/auth path
// Routes for register, login, password reset, and other authentication operations

app.use('/api/users', userRoutes);  // Mount user management routes at /api/users path
// Routes for user profile management, user data retrieval, and other user operations

// ------------------------------------------------------------------------
// Health Check Route
// ------------------------------------------------------------------------

// Health Check Endpoint (Standard route for checking service health)
app.get('/health', (req, res) => {
  // Simple check to verify if the identity service is alive
  res.status(200).json({ status: 'ok' }); // Responds with a '200 OK' status and 'status: ok' message
 });

 // ------------------------------------------------------------------------
// Global Error Handler
// ------------------------------------------------------------------------

// Error handling middleware to catch and process any errors that occur during request handling
app.use((err, req, res, next) => {
  console.error(err.stack); // Logs the error stack for debugging purposes
  res.status(500).json({
    message: 'Something went wrong!', // Generic error message for the client
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
    // Only includes detailed error information in development environment for security
  });
 });
 
 // ------------------------------------------------------------------------
 // Start Server
 // ------------------------------------------------------------------------
 
 const PORT = process.env.PORT || 3001; // Use PORT from environment variable or default to 3001
 app.listen(PORT, () => {
  // Logs a message indicating that the Identity Service has started successfully
  console.log(`Identity Service running on port ${PORT}`);
 });