// src/api/controllers/authController.js
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../../domain/models/User';
import { AuthenticatedRequest } from '../middleware/auth';

// Module-level type guard for errors with numberic code
const hasErrorCode = (err: unknown): err is { code: number } => {
  return typeof err == 'object' &&
         err !== null &&
         'code' in err &&
         typeof err.code === 'number';
}

// Controller-specific interfaces (not exported - only used here)
interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully. Please log in.'
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Registration error:', error.message);
    }

    // MongoDB duplicate key error using module-level type guard
    if (hasErrorCode(error) && error.code === 11000) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    res.status(500).json({ message: 'Server error occurred during registration' });
  }
}

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable not set');
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '24h' },
      (err: Error | null, token?: string) => {
        if (err) {
          console.error('JWT signing error:', err);
          res.status(500).json({ message: 'Token generation failed' });
          return;
        }

        // Use toObject to get a plain object (password removed by schema transform)
        const userResponse = user.toObject() as Omit<IUser, 'password'>;

        res.json({
          token,
          user: userResponse
        });
      }
    );
  } catch (error) {
    // Reuse the same type guard for consistent error handling
    if (hasErrorCode(error)) {
      console.error('Database error in login:', error.code);
      res.status(500).json({ message: 'Database error occurred during login' });
      return;
    }

    console.error('Login error:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: 'Server error occurred during login' });
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    // Same type guard used consistently across all functions
    if (hasErrorCode(error)) {
      console.error('Database error in getMe:', error.code);
      res.status(500).json({ message: 'Database error occurred while retrieving user' });
      return;
    }

    console.error('GetMe error:', error instanceof Error ? error.message: String(error));
    res.status(500).json({ message: 'Server error occurred while retrieving user' });
  }
};