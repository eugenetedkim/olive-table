// services/identity-service/src/domain/models/User.js

// Import Mongoose for working with MongoDB
const mongoose = require('mongoose'); // Mongoose is an ODM (Object Document Mapper) to define schemas and interact with MongoDB.

// Import bcryptjs for password hashing
const bcrypt = require('bcryptjs'); // bcryptjs securely hashes and compares passwords.

// ----------------------------------------------------------------------------------
// Define the schema (structure of a User document in MongoDB):
// ----------------------------------------------------------------------------------

const UserSchema = new mongoose.Schema({
  // User's email address
  email: {
    type: String, // the value must be a string
    required: true, // Must be provided
    unique: true, // Ensures no two users share the same email
    trim: true, // Trims whitespace
    lowercase: true,  // Converts to lowercase for consistency
  },

  // Hashed password
  password: {
    type: String,
    required: true,
  },

  // User's first name
  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  // User's last name
  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  // Optional profile picture (URL or file path)
  profilePicture: {
    type: String,
  },

  // List of dietary preference tags (.e.g. ["vegan", "gluten-free"])
  dietaryPreferences: [String],

  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now, // means MongoDB will auto-fill with the current date/time on creation
  },

  // Last update timestamp
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}); // Creates a new schema using Mongoose's Schema class. This will define the structure of each User record in the database.

// ----------------------------------------------------------------------------------
// Mongoose "pre-save" Middleware:
// Runs automatically before saving a document.
// Updates 'updatedAt' and hashes password if it's new or changed.
// ----------------------------------------------------------------------------------

UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now(); // Update timestamp

  // Only hash the password if it was modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // Hash the password using the generated salt
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err); // Handle hashing errors

      // Replace plain text password with the hashed password
      this.password = hash;

      // Continue to save the document
      next();
    });
  });
});

// ----------------------------------------------------------------------------------
// Instance method on the User schema:
// This adds a custom function called 'matchPassword' to each User document. It's used to compare a plain-text password (from login input) with the hashed password in the DB.
// ----------------------------------------------------------------------------------

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // bcrypt.compare() takes the entered password and the hashed password. It securely checks if they match and returns true or false.
  return await bcrypt.compare(enteredPassword, this.password);
};

// ----------------------------------------------------------------------------------
// Export the User model:
// This makes the User model available to import and use in other parts of the app, like controllers, services, or routes. Mongoose will associate this model with the "users" collection.
// ----------------------------------------------------------------------------------

module.exports = mongoose.model('User', UserSchema);