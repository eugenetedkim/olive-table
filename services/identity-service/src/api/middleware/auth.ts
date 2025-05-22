// File path: services/identity-service/src/api/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/*****************************************
 * No interface definitions in JavaScript *
 *****************************************/

// 1. Define the user data structure (reusable)
interface User {
  userId: string;
  email: string;
}

// 2. Define the complete JWT payload structure
interface JwtPayload {
  user: User
}

// Extend the Express Request type to include our user property
// After the middleware adds the user property to the request, other files need to know about this type.
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // TypeScript uses direct headers object access
    const authHeader = req.headers.authorization;

    // Explicit format check with optional chaining
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Invalid authorization format' });
      return;
    }

    // Explicit token extraction with substring
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Explicit JWT secret validation
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable not set');
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    // Type assertion for decoded JWT
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Type-safe assignment to req.user
    req.user = decoded.user;
    next();
  } catch(error) {
    // Specific handling for different JWT error types
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token'});
    } else {
      console.error('Auth error:', error instanceof Error ? error.message : 'Unknown error');
      res.status(401).json({ message: 'Authentication failed' });
    }
  }
};