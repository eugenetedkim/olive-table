// services/identity-service/src/domain/models/User.ts                              
import mongoose, { Document, Schema } from 'mongoose';                                          // [1] Package import (ES6)
import bcryptjs from 'bcryptjs';                                                                // [2] Package import (ES6)

// TypeScript addition: Interface definition                              
export interface IUser extends Document {                                                       // [TS-1] Interface declaration
  email: string;                                                                                // [4] Email field type
  password: string;                                                                             // [5] Password field type
  firstName: string;                                                                            // [6] First name field type
  lastName: string;                                                                             // [7] Last name field type
  profilePicture?: string;                                                                      // [8] Profile picture field type
  dietaryPreferences?: string[];                                                                // [9] Dietary preferences field type
  friends?: mongoose.Types.ObjectId[];                                                          // [10] Friends field type
  createdAt: Date;                                                                              // [11] Created date field type
  updatedAt: Date;                                                                              // [12] Updated date field type
  matchPassword(enteredPassword: string): Promise<boolean>;                                     // [13] [TS-2] Method signature
}                             

/**
 * What Changed & TypeScript Syntax Explained:
 * 
 * [1] Import Statements:
 *     - JavaScript: const mongoose = require('mongoose');
 *     - TypeScript: import, mongoose, { Document, Schema } from 'mongoose';
 *     - What changed: ES6 import syntax instead of CommonJS require
 *     - What it means? TypeScript uses modern ES modules and can import specific types
 * 
 * [2] Package import:
 *     - JavaScript: const bcrypt = require('bcryptjs');
 *     - TypeScript: import bcrypt from 'bcryptjs';
 *     - What changed: CommonJS to ES6 module syntax
 * 
 * [TS-1] Interface Declaration:
 *     - New in TypeScript: export interface IUser extends Document
 *     - What it means:
 *         - Defines the shape of your User document as a TypeScript type
 *         - extends Document: Inherits MongoDB document properties
 *     - Creates a contract for what fields and methods a User must have
 */

const removePassword = (_: any, ret: any) => {
  delete ret.password;  // Remove password from the plain object
  return ret;
};

const UserSchema = new Schema<IUser>(
  {                                                          // [3] Schema definition with type
    email: {                                                                                      // [4] Email friend
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {                                                                                   // [5] Password field
      type: String,
      required: true,
    },
    firstName: {                                                                                  // [6] First name field
      type: String,
      required: true,
      trim: true,
    },
    lastName: {                                                                                   // [7] Last name field
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {                                                                             // [8] Profile picture field
      type: String,
    },
    dietaryPreferences: {                                                                         // [9] Dietary preferences field
      type: [String],
    },
    friends: [{                                                                                   // [10] Friends field
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {                                                                                  // [11] Created data field
      type: Date,
      default: Date.now,
    },
    updatedAt: {                                                                                  // [12] Updated date field
      type: Date,
      default: Date.now,
    },
  },
  { // Schema options with transform functions
    toObject: {
      transform: removePassword // Remove password when converting to object
    },
    toJSON: {
      transform: removePassword // Remove password when converting to JSON
    }
  }
);                                                                                             // [13] End schema definition

UserSchema.pre<IUser>('save', async function(next) {                                            // [14] Pre-save hook
  this.updatedAt = new Date();

  if (!this.isModified('password')) return next();                                              // [15] Skip hashing if unchanged

  try {                                                                                         // [16] Generate salt and hash (async)
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);                                                                       // [TS-3] Type assertion
  }
});

UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {  // [17] Passwword compression method
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);                                       // [18] Export model

/**
 * What Changed & TypeScript Syntax Explained
 * 
 * [3-13] Schema Definition:
 *     - JavaScript: Regular Mongoose Schema
 *     - TypeScript: Schema with type parameter Schema<IUser>
 *     - What changed: The schema now references the interface type
 *     - What it means: TypeScript ensures your schema matches the interface
 * 
 * [4-12] Field Properties
 *     - JavaScript: Schema field definitions
 *     - TypeScript:
 *         i. Interface property types (string, Data, etc.)
 *         ii. Same schema
 *     - What changed: Added type definitions in the interface
 * 
 * [8-10] Special Types:
 *     - JavaScript: Regular field definitions
 *     - TypeScript:
 *         - profilePicture?: string: Optional string (the ? means optional)
 *         - dietaryPreferences?: string[]: Optional array of strings (the [] means array)
 *         - friends?: mongoose.Types.ObjectId[]: Optional array of MongoDB IDs
 *     - What it means? More precise type definitions
 * 
 * [4-16] Pre-save Hook:
 *     - JavaScript: Callback-based approach
 *     - TypeScript:
 *         - Uses pre<IUsers> to type the document
 *         - Uses modern async/await instead of callbacks
 *     - What changed: More modern and type-safe approach
 * 
 * [TS-3] Error Handling:
 *     - New in TypeScript: next(error as Error)
 *     - What it means: Explicitly tells TypeScript that the error is an Error object
 * 
 * [17] Method Implemenation:
 *     - JavaScript: Method without parameter types
 *     - TypeScript: Method with parameter and return types
 *     - What changed: Added (enteredPassword: string): Promise<boolean>
 *     - What it means: Type-safe method calls
 * 
 * [18] Model Export:
 *     - JavaScript: module.exports = mongoose.model('User', UserSchema);
 *     - TypeScript: export default mongoose.model<IUser>('User', UserSchema);
 *     - What changed:
 *         - ES6 export syntax
 *         - Added <IUser> type parameter
 *     What it means: Type-safe model usage
 */