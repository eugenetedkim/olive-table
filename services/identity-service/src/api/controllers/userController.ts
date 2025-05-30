// File path: services/identity-service/src/api/controllers/userController.ts

import { Request, Response } from 'express';
import User, { IUser } from '../../domain/models/User';
import { AuthenticatedRequest } from '../middleware/auth';

// Controller-specific interface (not exported - only used here)
interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  dietaryPreferences?: string[];
  password?: string;
}

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    // .select('-password') excludes password field from query result
    // Even if forgotten, schema transform automatically removes passwords from API responses
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error instanceof Error ? error.message : String(error));
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Server error occurred'
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest & { body: UpdateProfileBody },
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Type-safe property updates with optional chaining
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    if (req.body.dietaryPreferences) user.dietaryPreferences = req.body.dietaryPreferences;

    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    // Schema transform automatically removes password
    const userResponse = updatedUser.toObject() as Omit<IUser, 'password'>;

    res.json(userResponse);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Profile update error:', error.message);

      if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
        return;
      }
    }

    res.status(400).json({ message: 'Failed to update profile' });
  }
}