// File path: services/identity-service/src/api/controllers/userController.js

// Import the User model from domain layer
// DDD principle: controllers depend on domain models, not vice versa
// This maintains the correct dependency direction (inward toward domain core)

/** Old (CommonJS) */
// const User = require('../../domain/models/User');

/** New (ES Modules) */
import User, { IUser } from '../../domain/models/User';

// Controller method to retrieve a specific user by ID
// This exposes a domain entity through the API boundary
// @desc and @route are documentation annotations for API context
// Follows RESTful resource pattern for retrieving individual resources
// @desc  Get user by ID
// @route GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    // Extract user ID from route parameters
    // req.params contains values from URL path segments
    // select projection excludes password field for security
    // Mongoose findById is a convenience method for findOne({_id: id})
    const user = await User.findById(req.params.id).select('-password');

    // Guard clause for non-existent resource
    // HTTP 404 Not Found - resource does not exist (RFC 7231)
    // Early return pattern prevents further execution if condition met
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user document as JSON response
    // HTTP 200 OK status is implicit when using res.json()
    // Mongoose handles conversion of document to plain JavaScript object
    res.json(user);
  } catch (err) {
    // MongoDB cast errors (invalid ObjectId) would be caught here
    // HTTP 500 Internal Server Error for server-side failures
    res.status(500).json({ message: err.message });
  }
};

// Controller method for updating user profile
// Implements HTTP PUT semantics for resource update
// Only accessible to authenticated users (enforced by middleware)
exports.updateProfile = async (req, res) => {
  try {
    // Find user by ID (set by auth middleware)
    // This ensures users can only update their own profile
    // No projection used here as we need all fields for updating
    const user = await User.findById(req.user.id);

    // Guard clause for non-existent resource
    // Unlikely in normal operation but handles edge cases
    // Could occur if user was deleted but token still active
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Conditional property updates using short-circuit evaluation
    // Only update fields that are present in request body
    // This implements partial update semantics (PATCH-like behavior)
    // Each line uses the && operator's short-circuiting behavior
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    if (req.body.dietaryPreferences) user.dietaryPreferences = req.body.dietaryPreferences;

    // Special handling for password due to hashing requirement
    // This leverages the pre-save middleware in the User model
    // The middleware will hash the password before saving
    if (req.body.password) user.password = req.body.password;

    // Persist changes to database
    // user.save() executes UPDATE operation in MongoDB
    // Returns updated document with any middleware modifications
    const updatedUser = await user.save();

    // Convert Mongoose document to plain JavaScript object
    // This is necessary to modify the object before sending
    // Mongoose method that performs a deep copy with proper type conversion
    const userResponse = updatedUser.toObject();

    // Remove sensitive data from response
    // Direct object property deletion using delete operator
    // Security best practice - never return passwords in responses
    delete userResponse.password;

    // Return sanitized user object
    // HTTP 200 OK is appropriate for successful update
    res.json(userResponse);
  } catch (err) {
    // HTTP 400 Bad Request for client errors
    // Validation errors would be caught here
    // Different from 500 error in other methods - expects client errors
    res.status(400).json({ message: err.message });
  }
};