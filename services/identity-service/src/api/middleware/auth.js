// File path: services/identity-service/src/api/middleware/auth.js

// Import the 'jsonwebtoken' package using CommonJS module syntax (Node.js standard)
// This makes all exported members of the library available under the 'jwt' namespace
// The library is cryptographically secure and implements RFC 7519 JWT standard
const jwt = require('jsonwebtoken');

// Export the middleware function using the 'exports' object (CommonJS pattern)
// This is different from ES modules' 'export' keyword and makes the function available to other files
// 'exports' is a reference to module.exports - adding properties to it exposes them publicly
exports.authMiddleware = (req, res, next) => {
  // Define a middleware function with Express's signature pattern of (request, response, next)
  // req: Express Request object containing HTTP request details, headers, params, etc.
  // res: Express Response object with methods to send data back to the client
  // next: Callback function that passes control to the next middleware in the pipeline

  // Extract Authorization token using optional chaining operator (?.)
  // req.header() is an Express method that returns the specified HTTP header's value (case-insensitive)
  // Optional chaining (?.) short-circuits if left operand is null/undefined, preventing TypeError
  // replace() is a String prototype method that finds and replaces substrings
  // 'Bearer ' follows the OAuth 2.0 standard format for passing tokens in Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Early return pattern - check if token is falsy (null, undefined, empty string)
  // If no valid token is found, execution stops here - guarding pattern
  if (!token) {
    // res.status(401) sets HTTP status code to 401 Unauthorized (authentication failure)
    // .json() sends a JSON response and automatically sets Content-Type header to application/json
    // Method chaining is used for cleaner, more expressive code
    // This implicitly ends the middleware chain for this request - next() is not called
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // try/catch block for exception handling - JWT verification can throw errors
  // This is crucial for robustness, preventing unhandled promise rejections or exceptions
  try {
    // jwt.verify() is a synchronous operation that:
    // 1. Validates token signature using HMAC-SHA256 by default
    // 2. Checks token expiration (exp claim)
    // 3. Verifies issuer, audience, subject, etc. if configured
    // process.env.JWT_SECRET accesses environment variables (should be at least 32 bytes of entropy)
    // Uses Node's crypto module under the hood for cryptographic operations
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Augment request object with user data from payload
    // JWT payload typically contains 'sub' (subject), 'iat' (issued at), custom claims
    // This is a form of request context propagation - data flows downstream to route handlers
    // We specifically extract the 'user' property from the decoded token payload
    // This mutation of the req object is a common Express pattern but not immutable
    req.user = decoded.user;

    // Invoke next() callback with no arguments to proceed to next middleware
    // This is essential for the Express middleware pipeline to continue
    // Not calling next() would cause the request to hang indefinitely (timeout)
    // next() can also be called with an error object to trigger error-handling middleware
    next();
  } catch (err) {
    // Error handling for token verification failures
    // Common JWT errors: invalid signature, token expired, malformed JSON
    // Each has specific error types but we handle all uniformly here for simplicity
    // No stack trace is exposed to client - security best practice

    // Return 401 Unauthorized - RFC 7235 standard response for authentication failure
    // Different from 403 Forbidden which is for authorization failure (valid credentials but insufficient privileges)
    // The response is sent as application/json with a simple message structure
    res.status(401).json({ message: 'Token is not valid' });
    // Note: no return statement needed here as this is the last line of the function
  }
};