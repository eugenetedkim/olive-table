// File path: services/identity-service/src/api/controllers/authController.js

const jwt = require('jsonwebtoken');

/** Old (CommonJS) */
// const User = require('../../domain/models/User');

/** New (ES Modules) */
import User, { IUser } from '../../domain/models/User';

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    // jwt.sign(
    //   payload,
    //   process.env.JWT_SECRET,
    //   { expiresIn: '24' },
    //   (err, token) => {
    //     if (err) throw err;

    //     res.status(201).json({
    //       token,
    //       user: {
    //         id: user.id,
    //         email: user.email,
    //         firstName: user.firstName,
    //         lastName: user.lastName
    //       }
    //     });
    //   }
    // );

    return res.status(201).json({
      message: 'User registered successfully. Please log in.'
    });
  } catch (err) {
    // Improved error handling with proper status codes
    
    // Handle validation errors (missing required fields, etc.)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    // Handle duplicate key errors (typically from unique constraints)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Handle casting errors (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    // Log the error for debugging (in a real app, use a proper logger)
    console.error('Registration error:', err);
    
    // For any other errors, return 500 Internal Server Error
    res.status(500).json({ message: 'Server error occurred during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;

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
    // Improved error handling
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error occurred during login' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Handle case where user ID is valid but no user found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    // Improved error handling
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Server error occurred while retrieving user' });
  }
};