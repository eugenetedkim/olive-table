// services/api-gateway/src/middleware/auth.js

// ------------------------------------------------------------------------
// Importing Dependencies
// ------------------------------------------------------------------------

const jwt = require('jsonwebtoken'); // JSON Web Token library for token validation
// Provides methods to verify the authenticity and integrity of JWT tokens sent by clients

const config = require('../config'); // Import configuration settings
// Contains the JWT secret key and other configuration needed for token validation

// ------------------------------------------------------------------------
// Authentication Middleware
// ------------------------------------------------------------------------

exports.authMiddleware = (req, res, next) => {
 // This middleware function validates the JWT token before allowing access to protected routes
 console.log('You are in the auth middleware');
 // ------------------------------------------------------------------------
 // Token Extraction
 // ------------------------------------------------------------------------
 
 // Get token from the Authorization header
 const token = req.header('Authorization')?.replace('Bearer ', '');
 // Uses optional chaining (?.) to safely access the Authorization header
 // Removes the 'Bearer ' prefix to extract just the token string
 
 // ------------------------------------------------------------------------
 // Token Presence Check
 // ------------------------------------------------------------------------
 
 // Check if token exists
 if (!token) {
   // If no token was provided in the request
   return res.status(401).json({ message: 'No token, authorization denied' });
   // Returns a 401 Unauthorized response with a descriptive message
   // This prevents unauthenticated requests from accessing protected resources
 }
 
 // ------------------------------------------------------------------------
 // Token Validation
 // ------------------------------------------------------------------------
 
 try {
   // Attempt to verify the token's authenticity
   const decoded = jwt.verify(token, config.jwt.secret);
   // Uses the JWT library to validate the token signature using the secret from config
   // If successful, returns the decoded payload containing user information
   
   // Attach user data to the request object
   req.user = decoded.user;
   // Makes the authenticated user's information available to downstream route handlers
   // This allows subsequent handlers to know which user is making the request
   
   // Proceed to the next middleware or route handler
   next();
   // If token is valid, allow the request to proceed to the proxied service
 } catch (err) {
   // If token verification fails (expired, invalid signature, malformed)
   res.status(401).json({ message: 'Token is not valid' });
   // Returns a 401 Unauthorized response with a descriptive message
   // This prevents requests with invalid tokens from accessing protected resources
 }
};