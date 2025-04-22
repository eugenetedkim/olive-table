// File path: services/identity-service/src/api/controllers/authController.js

// Import the jsonwebtoken library for token-based authentication (stateless auth pattern)
// JWT implements the claim-based identity model from RFC 7519
const jwt = require('jsonwebtoken');

// Imports the User model from domain layer
// This is a cross-layer dependency pointing inward (toward domain)
// Following Dependency Inversion Principle - API depends on domain abstractions
const User = require('../../domain/models/User');

// Controller method for user registration
// @desc and @route are JSDoc-style annotations providing API documentation
// exports.register creates a named export using CommonJS module pattern
// async keyword creates an asynchronous function returning a Promise implicitly
// req/res are Express.js conventional parameter names for request/response objects
// @desc  Register a user
// @route Post /api/auth/register
exports.register = async (req, res) => {
  // try/catch pattern for asynchronous error handling
  // This is a defensive programming technique essential for API robustness
  try {
    // Object destructuring assignment - ES6 feature extracting specific properties
    // This unpacks values from the request body sent by client (typically JSON)
    // Implicitly assumes a body-parser middleware has already parsed the request
    const { email, password, firstName, lastName } = req.body;

    // Check for existing user by email (unique constraint enforcement)
    // User.findOne is a Mongoose query method returning a Promise
    // The query uses MongoDB's query syntax with a filter object
    // await suspends execution until Promise resolves (ES2017 feature)
    let user = await User.findOne({ email });

    // Guard clause pattern - early return for error condition
    // HTTP 400 Bad Request - client error (RFC 7231 standard)
    // Prevents duplicate user registration - business rule enforcement
    // Check if user exists
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new domain entity instance
    // This instantiates a Mongoose document from model schema
    // The User constructor is provided by Mongoose's model factory
    // Object literal syntax for concise property initialization
    // Create a new user
    user = new User({
      email,
      password, // Will be hashed by pre-save middleware defined in User model
      firstName,
      lastName,
    });

    // Persist entity to database
    // user.save() is a Mongoose method that executes an INSERT operation
    // await ensures we don't proceed until database operation completes
    // This could trigger validation defined in the User schema
    await user.save();

    // Prepare JWT payload with minimal necessary data
    // Object nesting used to namespace the user data
    // Only user ID is included in token to minimize token size and exposure
    // Following principle of least privilege in information exposure
    // Generate JWT
    const payload = {
      user: {
        id: user.id // Mongoose virtualizes MongoDB's _id as id
      }
    };

    // Sign JWT token asynchronously (callback-based API)
    // jwt.sign creates a digitally signed token with specified payload
    // process.env.JWT_SECRET accesses environment configuration (12-factor app principle)
    // expiresIn sets token TTL (Time To Live) - security best practice to limit exposure
    // The callback executes after token generation completes
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24' }, // Token expiration - temporal security boundary
      (err, token) => {
        // Error propagation in callback - throws to outer catch block
        if (err) throw err;

        // Success response with 201 Created status (RFC 7231)
        // 201 is semantically correct for resource creation operations
        // Response includes both authentication token and user data
        // User password is omitted from response for security
        res.status(201).json({
          token,  // Shorthand property assignment (ES6 feature)
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }
    );
  } catch (err) {
    // Generic error handler for any uncaught exceptions
    // HTTP 500 Interal Server Error - server failure (RFC 7231)
    // Exposes only error message, not stack trace (security consideration)
    // In production, would typically log the error for monitoring
    res.status(500).json({ message: err.message });
  }
};

// Controller method for user authentication (login)
// Uses same pattern as register but validates credentials instead
// async/await enables linear code flow despite asynchronous operations
// @desc  Authentication user & get token
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    // Extract credentials from request body
    // Destructuring assignment for concise property access
    const { email, password } = req.body;

    // Find user by email identifier
    // Mongoose query returns null if no document matches
    const user = await User.findOne({ email });

    // Authentication failure - user not found
    // HTTP 401 Unauthorized - authentication failure (RFC 7235)
    // Generic error message avoids user enumeration vulnerability
    // (does not confirm whether email exists in system)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password using method defined on User model
    // matchPassword likely uses bcrypt.compare for secure hash comparison
    // Timing-safe comparison prevents timing attack vulnerabilities
    // await handles the Promise returned by async password verification
    const isMatch = await user.matchPassword(password);

    // Authentication failure - wrong password
    // Same error message as non-existent user (security by obscurity)
    // Consistent response timing is important to prevent timing attacks
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Same JWT generation logic as in register
    // Authentication tokens are identical regardless of creation context
    // JWT "sub" claim is implicitly provided by user ID
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign JWT token with same parameters as registration
    // Asynchronous operation using callback pattern
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;

        // HTTP 200 OK - successful operation (RFC 7231)
        // Login uses 200 instead of 201 as no resource is created
        // Returns same data structure as register for API consistency
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      }
    );
  } catch (err) {
    // Generic server error handler
    // Production systems would include more detailed logging here
    res.status(500).json({ message: err.message });
  }
};

// Controller method to retrieve authenticated user's profile
// Much simpler as it only performs a read operation
// Used to verify token validity and get current user data
exports.getMe = async (req, res) => {
  try {
    // req.user was set by authMiddleware during token verification
    // Context propagation through request object is common in Express
    // select('-password') excludes the password field from returned document
    // Projection optimization - only return necessary fields
    const user = await User.findById(req.user.id).select('-password');

    // Returns user document directly with HTTP 200 OK status (implicit)
    // Mongoose document is automatically converted to JSON by Express
    res.json(user);
  } catch (err) {
    // Standard error handling pattern consistent across controllers
    res.status(500).json({ message: err.message });
  }
};