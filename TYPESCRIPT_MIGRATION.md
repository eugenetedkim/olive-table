# Olive Table - Complete TypeScript Migration Guide

## 📌 Starting Point

**Git Tags: Your Project Time Machine**

A git tag is like a bookmark in your project's history - it marks a specific point in time that you can always return to.

```bash
# The command you ran to create your tag
git tag -a v1.0.0-docker-baseline -m "Working Docker Compose setup before TypeScript migration"

# Push the tag to remote repository
git push origin v1.0.0-docker-baseline

# To verify your tag exists
git tag -l
git show v1.0.0-docker-baseline
```

**Why Tags > Branches for Milestones:**
- **Immutable**: Tags don't change; they're permanent markers
- **Semantic**: `v1.0.0` clearly indicates a stable release point
- **Lightweight**: Tags don't clutter your branch list
- **Industry Standard**: Used for releases, milestones, and rollback points

Your project is currently at tag `v1.0.0-docker-baseline` with:
- All services (API Gateway, Identity, Event, Invitation) running in JavaScript
- Full Docker Compose setup working
- Integration tests passing
- MongoDB connections stable

### Working with the Baseline

```bash
# View the pre-TypeScript state
git checkout v1.0.0-docker-baseline

# Return to your main development branch where you'll implement the migration
git checkout main
```

*📚 Note: When you "checkout main", you're returning to your primary development branch. This is where you'll make all the TypeScript changes. The tag is just for reference or rollback if needed.*

## 🔄 Migration Order

We follow dependency order for stability:

```
v1.0.0-docker-baseline (Current State)
    ↓
[1. Identity Service]    # Core authentication
    ↓
[2. Event Service]       # Business logic
    ↓
[3. Invitation Service]  # Dependent service
    ↓
[4. API Gateway]         # Simple routing
    ↓
v2.0.0-typescript-complete
```

## Step 1: Identity Service Migration

*📚 Learning Note: We start with Identity Service as it's the foundation for auth*

### 1.1 Navigate and Create TypeScript Config

```bash
cd services/identity-service
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**What This Config Does:**
- **`target: "es2020"`**: Compiles TypeScript to ES2020 JavaScript
  - Modern features supported (optional chaining, nullish coalescing)
  - Compatible with Node.js 16+
- **`module: "commonjs"`**: Uses Node.js module system
  - Required for Node.js (not browser)
  - Enables `require()` and `module.exports`
- **`outDir: "./dist"`**: Where compiled files go
  - Creates a `dist` folder with JavaScript files
  - Keeps source and compiled code separated
- **`rootDir: "./src"`**: Where source files are located
  - TypeScript looks here for `.ts` files
  - Maintains folder structure in `dist`
- **`strict: true`**: Enables all strict checking
  - Prevents common errors
  - Requires explicit typing
- **`esModuleInterop: true`**: Allows default imports
  - Import Express as `import express from 'express'`
  - Instead of `import * as express from 'express'`
- **`noImplicitAny: true`**: Forbids `any` type
  - Must explicitly define types
  - Increases code safety
- **`sourceMap: true`**: Creates debugging maps
  - Links compiled JS back to TS for debugging
  - Shows TS code in error stack traces
- **`moduleResolution: "node"`**: Uses Node.js module lookup
  - Finds modules in `node_modules`
  - Required for Node.js projects

### 1.2 Update package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "lint": "eslint . --ext .ts"
  }
}
```

### 1.3 Install TypeScript Dependencies

```bash
npm install --save-dev typescript @types/node @types/express @types/mongoose @types/bcrypt @types/jsonwebtoken @types/cors @types/helmet @types/cookie-parser ts-node nodemon eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**What Each Package Does:**
- **`typescript`**: The TypeScript compiler itself
  - Converts `.ts` files to `.js` files
  - Checks for type errors
- **`@types/node`**: Type definitions for Node.js
  - Knows about `process`, `Buffer`, file system, etc.
  - Makes native Node.js modules type-safe
- **`@types/express`**: Type definitions for Express
  - Provides types for `Request`, `Response`, `Router`
  - Makes Express methods type-safe
- **`@types/mongoose`**: Types for MongoDB ODM
  - Document interfaces, Schema types
  - Makes database models type-safe
- **`@types/bcrypt`**: Types for password hashing
  - Ensures proper usage of hash/compare methods
- **`@types/jsonwebtoken`**: Types for JWT
  - Makes token signing/verifying type-safe
- **`ts-node`**: Runs TypeScript directly
  - Used in development to run `.ts` files
  - No need to compile first during development
- **`nodemon`**: Restarts app on file changes
  - Development convenience tool
  - Works with ts-node for hot reloading
- **`eslint` packages**: Code quality enforcement
  - Catches potential bugs
  - Enforces consistent code style

### 1.4 Migrate User Model

**Before (JavaScript):**
```javascript
// 📄 src/domain/models/User.js
const mongoose = require('mongoose');                      // [1]
const bcrypt = require('bcrypt');                         // [2]

const UserSchema = new mongoose.Schema({                  // [3]
  email: { type: String, required: true },                
  password: { type: String, required: true },
  // ... other fields
});                                                      // [4]

module.exports = mongoose.model('User', UserSchema);     // [5]
```

**After (TypeScript):**
```typescript
// 📄 src/domain/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';    // [1]
import bcrypt from 'bcrypt';                             // [2]

export interface IUser extends Document {                 // [3]
  email: string;                                         // [4]
  password: string;
  firstName?: string;                                    // [5]
  lastName?: string;
  dietaryPreferences?: string[];                         // [6]
  createdAt: Date;                                       // [7]
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;  // [8]
}

const UserSchema = new Schema<IUser>({                    // [9]
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  // ... other fields
}, {
  timestamps: true                                        // [10]
});

UserSchema.pre<IUser>('save', async function(next) {     // [11]
  if (!this.isModified('password')) return next();       // [12]
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);                                // [13]
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {  // [14]
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); // [15]
```

**What Changed & TypeScript Syntax Explained:**

**[1] Import Statements:**
- JavaScript: `const mongoose = require('mongoose');`
- TypeScript: `import mongoose, { Document, Schema } from 'mongoose';`
- **What changed**: ES6 import syntax instead of CommonJS require
- **What it means**: 
  - `import mongoose`: Default import (like require)
  - `{ Document, Schema }`: Named imports from the same package
  - TypeScript can check these imports exist

**[2] Default Import:**
- JavaScript: `const bcrypt = require('bcrypt');`
- TypeScript: `import bcrypt from 'bcrypt';`
- **What it means**: Imports the main export from bcrypt package

**[3] Interface Declaration:**
- New in TypeScript: `export interface IUser extends Document`
- **What it means**:
  - Creates a contract: "A User must have these properties"
  - `extends Document`: Inherits MongoDB document methods
  - `export`: Makes interface available to other files
  - Like a "type blueprint" for User objects

**[4] Property Types:**
- JavaScript: No type information
- TypeScript: `email: string;`
- **What it means**:
  - Explicitly declares email must be a string
  - Prevents accidental assignment of numbers/objects
  - IDE gives autocomplete & error checking

**[5] Optional Properties:**
- New: `firstName?: string;`
- **What the `?` means**:
  - Property can be `undefined` (missing)
  - Makes it optional when creating User
  - Prevents "property not found" errors

**[6] Array Types:**
- New: `dietaryPreferences?: string[];`
- **What it means**:
  - Array of strings only
  - Can't mix types: `['vegan', 42]` ✘ TypeScript error
  - Optional: `string[] | undefined`

**[7] Date Type:**
- JavaScript: Just defines field
- TypeScript: `createdAt: Date;`
- **What it means**:
  - Must be JavaScript Date object
  - Can't be string or timestamp

**[8] Method Signature:**
- New: `comparePassword(candidatePassword: string): Promise<boolean>;`
- **What it means**:
  - Method takes string parameter
  - Returns a Promise that resolves to boolean
  - TypeScript checks you call it correctly
  - Example: `await user.comparePassword('password123')`

**[9] Schema Type Parameter:**
- JavaScript: `new mongoose.Schema({})`
- TypeScript: `new Schema<IUser>({})`
- **What `<IUser>` means**:
  - Generic type parameter
  - "This schema follows the IUser interface"
  - TypeScript checks schema matches interface

**[10] Timestamps:**
- Same in both: `timestamps: true`
- **What it does**:
  - Automatically adds `createdAt` and `updatedAt` fields
  - Updates `updatedAt` on save

**[11] Pre-hook with Type:**
- TypeScript: `.pre<IUser>('save', async function(next) {`
- **What `<IUser>` means**:
  - `this` refers to IUser document
  - TypeScript knows available properties
  - Can access `this.password` safely

**[12] Type Guards:**
- Same logic, but TypeScript checks `this.isModified` exists
- **What it prevents**:
  - Calling non-existent methods
  - Compile-time safety

**[13] Error Type Casting:**
- New: `next(error as Error);`
- **What `as Error` means**:
  - Explicitly tells TypeScript "this is an Error object"
  - Needed because `catch` block error is `unknown` type
  - Alternative: `error instanceof Error` check

**[14] Method Implementation:**
- TypeScript: Explicit parameter and return types
- **What it adds**:
  - `candidatePassword: string`: Must pass string
  - `: Promise<boolean>`: Must return Promise<boolean>
  - Compiler checks you return correct type

**[15] Model Export:**
- JavaScript: `module.exports = mongoose.model('User', UserSchema);`
- TypeScript: `export default mongoose.model<IUser>('User', UserSchema);`
- **What changed**:
  - ES6 export instead of module.exports
  - `<IUser>`: Tells TypeScript the model type
  - Enables type checking when using the model

**Real-World Benefits:**
```typescript
// JavaScript:
const user = await User.findOne({ email: 'test@example.com' });
user.firstName = 42;  // 💥 Runtime error later!
user.doesntExist();   // 💥 Runtime error!

// TypeScript:
const user = await User.findOne({ email: 'test@example.com' });
user.firstName = 42;    // ❌ TypeScript: Type 'number' is not assignable to type 'string'
user.doesntExist();     // ❌ TypeScript: Property 'doesntExist' does not exist
```

### 1.5 Migrate Auth Middleware

**Before vs After:**
```javascript
// 📄 src/api/middleware/auth.js (BEFORE)
const jwt = require('jsonwebtoken');                                  // [1]

exports.authMiddleware = (req, res, next) => {                       // [2]
  // JavaScript implementation - no type safety                       // [3]
};
```

```typescript
// 📄 src/api/middleware/auth.ts (AFTER)
import { Request, Response, NextFunction } from 'express';           // [1]
import jwt from 'jsonwebtoken';                                      // [2]

export interface CustomRequest extends Request {                     // [3]
  user?: {                                                          // [4]
    userId: string;
    email: string;
  };
}

export const authMiddleware = (                                      // [5]
  req: CustomRequest,                                               // [6]
  res: Response,                                                    // [7]
  next: NextFunction                                                // [8]
): void => {                                                        // [9]
  try {
    const authHeader = req.headers.authorization;                    // [10]
    
    if (!authHeader?.startsWith('Bearer ')) {                       // [11]
      res.status(401).json({ message: 'No token provided' });
      return;                                                       // [12]
    }

    const token = authHeader.split(' ')[1];                         // [13]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {  // [14]
      userId: string;
      email: string;
    };
    
    req.user = decoded;                                             // [15]
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**What Changed & TypeScript Syntax Explained:**

**[1] Import Types:**
- JavaScript: No type imports needed
- TypeScript: `import { Request, Response, NextFunction } from 'express';`
- **What it means**:
  - Imports TypeScript types for Express
  - `Request`: HTTP request object type
  - `Response`: HTTP response object type
  - `NextFunction`: Function to pass control to next middleware
  - Enables type checking for middleware parameters

**[2] Default Import:**
- JavaScript: `const jwt = require('jsonwebtoken');`
- TypeScript: `import jwt from 'jsonwebtoken';`
- **What changed**: ES6 import syntax
- **Why**: Consistent with TypeScript module system

**[3] Interface Extension:**
- New: `export interface CustomRequest extends Request`
- **What it means**:
  - Creates a new type that extends Express Request
  - Adds our custom `user` property
  - TypeScript now knows `req.user` exists
  - Prevents "property does not exist" errors

**[4] Optional Property:**
- New: `user?: { userId: string; email: string; };`
- **What `?` means**:
  - Property might not exist (undefined)
  - Must check `if (req.user)` before using
  - TypeScript enforces this check

**[5] Export Syntax:**
- JavaScript: `exports.authMiddleware = (`
- TypeScript: `export const authMiddleware = (`
- **What changed**: ES6 export syntax
- **Why**: Consistent with TypeScript modules

**[6] Typed Request Parameter:**
- JavaScript: `req` (no type)
- TypeScript: `req: CustomRequest`
- **What it means**:
  - `req` must be our CustomRequest type
  - TypeScript knows about `req.user` property
  - Prevents accessing non-existent properties

**[7] Response Type:**
- JavaScript: `res` (no type)
- TypeScript: `res: Response`
- **What it means**:
  - TypeScript knows all Response methods
  - Autocomplete for `res.status()`, `res.json()`, etc.
  - Prevents calling non-existent methods

**[8] Next Function Type:**
- JavaScript: `next` (no type)
- TypeScript: `next: NextFunction`
- **What it means**:
  - Ensures `next()` is called correctly
  - No parameters or proper error passing

**[9] Return Type:**
- New: `: void`
- **What it means**:
  - Function doesn't return a value
  - Middleware functions typically return void
  - TypeScript checks no value is returned

**[10] Optional Chaining:**
- New: `req.headers.authorization`
- **What it checks**:
  - TypeScript knows headers might have authorization
  - Prevents undefined access errors

**[11] Optional Chaining & nullish:**
- New: `if (!authHeader?.startsWith('Bearer '))`
- **What `?.` means**:
  - Safe property access
  - If `authHeader` is null/undefined, expression returns undefined
  - Prevents "Cannot read property of undefined" errors

**[12] Early Return:**
- Same in both, but TypeScript tracks control flow
- **What it does**:
  - Exits function early
  - TypeScript knows execution stops here

**[13] String Splitting:**
- Same logic, TypeScript knows string methods
- **What it provides**:
  - Autocomplete for string methods
  - Type checking on array access

**[14] Type Assertion:**
- New: `jwt.verify(...) as { userId: string; email: string; };`
- **What `as` means**:
  - Tells TypeScript the shape of decoded JWT
  - `jwt.verify` returns `unknown` by default
  - We assert it's our expected shape
  - `!` after `JWT_SECRET` is non-null assertion

**[15] Property Assignment:**
- JavaScript: Works but no type checking
- TypeScript: `req.user = decoded;`
- **What it checks**:
  - `decoded` matches `user` property type
  - Ensures shape is correct
  - Prevents type mismatches

**Real-World Example:**
```typescript
// TypeScript middleware usage:
app.use('/api/users', authMiddleware, (req: CustomRequest, res) => {
  // TypeScript knows req.user exists and its shape
  if (req.user) {
    console.log(`User ${req.user.userId} accessing users endpoint`);
    // TypeScript autocompletes: req.user.email also exists
  }
});

// JavaScript equivalent (no type safety):
app.use('/api/users', authMiddleware, (req, res) => {
  if (req.user) {
    console.log(`User ${req.user.userId} accessing users endpoint`);
    // Could typo: req.user.userIdd - no error until runtime!
  }
});
```

### 1.6 Migrate Auth Controller

**Before (JavaScript):**
```javascript
// 📄 src/api/controllers/authController.js
const jwt = require('jsonwebtoken');                              // [1]
const User = require('../../domain/models/User');                 // [2]

exports.register = async (req, res) => {                         // [3]
  try {
    const { email, password, firstName, lastName } = req.body;    // [4]
    
    let user = await User.findOne({ email });                    // [5]
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    user = new User({ email, password, firstName, lastName });    // [6]
    await user.save();
    
    res.status(201).json({ token, user: { ... } });              // [7]
  } catch (err) {
    res.status(500).json({ message: err.message });              // [8]
  }
};
```

**After (TypeScript):**
```typescript
// 📄 src/api/controllers/authController.ts
import { Request, Response } from 'express';                            // [1]
import User, { IUser } from '../../domain/models/User';                // [2]

interface RegisterBody {                                               // [3]
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const register = async (                                        // [4]
  req: Request<{}, {}, RegisterBody>,                                 // [5]
  res: Response                                                       // [6]
): Promise<void> => {                                                 // [7]
  try {
    const { email, password, firstName, lastName } = req.body;        // [8]
    
    const existingUser = await User.findOne({ email });              // [9]
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;                                                        // [10]
    }
    
    const user = new User({ email, password, firstName, lastName });  // [11]
    await user.save();
    
    res.status(201).json({                                           // [12]
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);                      // [13]
    res.status(500).json({ message: 'Error creating user' });
  }
};
```

**What Changed & TypeScript Syntax Explained:**

**[1] Import Types:**
- JavaScript: No type imports
- TypeScript: `import { Request, Response } from 'express';`
- **What it means**:
  - Imports Express types
  - Enables type checking for controller functions
  - Provides autocomplete for response methods

**[2] Model Import:**
- JavaScript: `const User = require('../../domain/models/User');`
- TypeScript: `import User, { IUser } from '../../domain/models/User';`
- **What's new**:
  - Uses ES6 import syntax
  - Imports both the User model AND the IUser interface
  - `IUser` can be used for type annotations

**[3] Request Body Interface:**
- New: `interface RegisterBody { ... }`
- **What it means**:
  - Defines expected shape of request body
  - Creates a contract for registration data
  - TypeScript will check incoming data matches this shape

**[4] Export Syntax:**
- JavaScript: `exports.register = async (req, res) => {`
- TypeScript: `export const register = async (`
- **What changed**: ES6 export syntax

**[5] Request Type Parameter:**
- JavaScript: `req` (no type)
- TypeScript: `req: Request<{}, {}, RegisterBody>`
- **What this means**:
  - `Request<Params, ResBody, ReqBody>`
  - First `{}`: No URL parameters
  - Second `{}`: No response body type
  - Third `RegisterBody`: Request body must match RegisterBody
  - TypeScript checks `req.body` has correct properties

**[6] Response Type:**
- JavaScript: `res` (no type)
- TypeScript: `res: Response`
- **What it provides**:
  - Autocomplete for all response methods
  - Type checking for response data

**[7] Return Type:**
- New: `: Promise<void>`
- **What it means**:
  - Async function returns a Promise
  - Promise resolves to void (no return value)
  - Controllers typically don't return values

**[8] Destructuring:**
- Same syntax, but TypeScript checks types
- **What's verified**:
  - `email` must be string
  - `password` must be string
  - `firstName` and `lastName` are optional strings

**[9] Model Query:**
- JavaScript: `let user = await User.findOne({ email });`
- TypeScript: `const existingUser = await User.findOne({ email });`
- **What's improved**:
  - Uses `const` instead of `let` (better practice)
  - More descriptive variable name
  - TypeScript infers `existingUser` could be IUser or null

**[10] Early Return:**
- Same logic, TypeScript tracks control flow
- **What it checks**:
  - Function must return void
  - All code paths properly handled

**[11] User Creation:**
- JavaScript: `user = new User({ ... });`
- TypeScript: `const user = new User({ ... });`
- **What's checked**:
  - Object passed to constructor matches User model
  - All required fields are provided
  - No extra/invalid fields

**[12] Response Object:**
- JavaScript: Generic response
- TypeScript: Typed response with explicit structure
- **What's ensured**:
  - Response object has expected shape
  - No accidental typos in property names
  - Consistent API responses

**[13] Error Handling:**
- JavaScript: `res.status(500).json({ message: err.message });`
- TypeScript: `res.status(500).json({ message: 'Error creating user' });`
- **What's improved**:
  - Generic error message (no internal details leaked)
  - Error logged properly for debugging
  - Type-safe error handling

**Real-World Example:**
```typescript
// TypeScript catches errors at compile time:
export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { email, password, age } = req.body;
  // ❌ TypeScript error: 'age' does not exist in type 'RegisterBody'
  
  const user = new User({
    email: email,
    password: password,
    invalidField: 'test'
  });
  // ❌ TypeScript error: 'invalidField' does not exist in User
  
  res.json({
    message: 'Success',
    usr: user  // ❌ TypeScript catches typo! Should be 'user'
  });
};
```

### 1.7 Migrate Routes

**Before (JavaScript):**
```javascript
// 📄 src/api/routes/auth.js
const express = require('express');                                   // [1]
const { register, login } = require('../controllers/authController'); // [2]

const router = express.Router();                                     // [3]

router.post('/register', register);                                  // [4]
router.post('/login', login);                                        // [5]

module.exports = router;                                             // [6]
```

**After (TypeScript):**
```typescript
// 📄 src/api/routes/auth.ts
import { Router } from 'express';                                    // [1]
import { register, login } from '../controllers/authController';     // [2]

const router = Router();                                             // [3]

router.post('/register', register);                                  // [4]
router.post('/login', login);                                        // [5]

export default router;                                               // [6]
```

**What Changed & TypeScript Syntax Explained:**

**[1] Router Import:**
- JavaScript: `const express = require('express');`
- TypeScript: `import { Router } from 'express';`
- **What's different**:
  - Named import instead of full express import
  - Only imports what's needed (Router)
  - More efficient and cleaner

**[2] Controller Import:**
- JavaScript: `const { register, login } = require('../controllers/authController');`
- TypeScript: `import { register, login } from '../controllers/authController';`
- **What's improved**:
  - ES6 import syntax
  - TypeScript checks these exports exist
  - Better IDE support and autocomplete

**[3] Router Creation:**
- JavaScript: `const router = express.Router();`
- TypeScript: `const router = Router();`
- **What changed**:
  - Direct Router() call (named import)
  - TypeScript infers router type automatically
  - Type-safe router operations

**[4-5] Route Definitions:**
- Same syntax in both
- **What TypeScript adds**:
  - Checks that `register` and `login` are valid middleware functions
  - Ensures they have correct signature: `(req, res, next?)`
  - Prevents passing wrong function types

**[6] Export:**
- JavaScript: `module.exports = router;`
- TypeScript: `export default router;`
- **What's different**:
  - ES6 module syntax
  - Default export (can import like: `import authRoutes from './auth'`)
  - TypeScript preserves router type information

### 1.8 Migrate Main Application

**Before (JavaScript):**
```javascript
// 📄 src/index.js
const express = require('express');                                  // [1]
const cors = require('cors');                                        // [2]
const connectDB = require('./infrastructure/db/mongoose');           // [3]
const authRoutes = require('./api/routes/auth');                    // [4]

const app = express();                                              // [5]
const PORT = process.env.PORT || 3001;                              // [6]

// Middleware                                                       
app.use(cors());                                                    // [7]
app.use(express.json());                                            // [8]

// Routes                                                           
app.use('/api/auth', authRoutes);                                   // [9]

// Error handling                                                   
app.use((err, req, res, next) => {                                 // [10]
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server                                                     
connectDB().then(() => {                                            // [11]
  app.listen(PORT, () => {
    console.log(`Identity service running on port ${PORT}`);
  });
});
```

**After (TypeScript):**
```typescript
// 📄 src/index.ts
import express from 'express';                                           // [1]
import cors from 'cors';                                                 // [2]
import connectDB from './infrastructure/db/mongoose';                    // [3]
import authRoutes from './api/routes/auth';                             // [4]

const app = express();                                                  // [5]
const PORT: number = parseInt(process.env.PORT || '3001', 10);          // [6]

// Middleware                                                           
app.use(cors());                                                        // [7]
app.use(express.json());                                                // [8]

// Routes                                                               
app.use('/api/auth', authRoutes);                                       // [9]

// Error handling                                                       
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {  // [10]
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to database and start server                                
connectDB()                                                             // [11]
  .then(() => {
    app.listen(PORT, (): void => {                                      // [12]
      console.log(`Identity service running on port ${PORT}`);
    });
  })
  .catch((err) => {                                                    // [13]
    console.error('Failed to start server:', err);
    process.exit(1);
  });
```

**What Changed & TypeScript Syntax Explained:**

**[1-4] ES6 Imports:**
- JavaScript: `const module = require('path');`
- TypeScript: `import module from 'path';`
- **What's improved**:
  - Consistent ES6 module syntax
  - TypeScript type checking on imports
  - Better tree-shaking (unused code elimination)

**[5] Express App:**
- Same syntax, TypeScript infers type
- **What's checked**:
  - `app` has all Express methods
  - Method signatures are validated

**[6] Port Configuration:**
- JavaScript: `const PORT = process.env.PORT || 3001;`
- TypeScript: `const PORT: number = parseInt(process.env.PORT || '3001', 10);`
- **What's improved**:
  - `process.env.PORT` is string | undefined
  - Explicitly converts to number
  - Ensures PORT is always a number type
  - Prevents "port must be number" errors

**[7-9] Middleware & Routes:**
- Same syntax in both
- **What TypeScript verifies**:
  - Middleware functions have correct signature
  - Route handlers are valid Express middleware
  - Middleware return void, not values

**[10] Error Handler:**
- JavaScript: `app.use((err, req, res, next) => {`
- TypeScript: `app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {`
- **What's added**:
  - Explicit parameter types
  - `err: Error` - TypeScript knows error properties
  - Full Express types for request, response, next
  - Prevents calling res methods incorrectly

**[11] Database Connection:**
- Same Promise chain
- **What TypeScript adds**:
  - Type checking on Promise methods
  - Ensures proper async handling

**[12] Listen Callback:**
- JavaScript: `app.listen(PORT, () => {`
- TypeScript: `app.listen(PORT, (): void => {`
- **What's specified**:
  - Callback returns void
  - TypeScript checks no value is returned
  - Proper async function usage

**[13] Error Handling:**
- New: `.catch((err) => { ... });`
- **What's improved**:
  - Handles database connection failures
  - Graceful server startup error handling
  - Proper process exit on critical errors

### 1.9 Update Dockerfile

**Before (JavaScript):**
```dockerfile
FROM node:16-alpine                                                # [1]
WORKDIR /app                                                       # [2]
COPY package*.json ./                                              # [3]
RUN npm install                                                    # [4]
COPY . .                                                           # [5]
EXPOSE 3001                                                        # [6]
CMD ["node", "src/index.js"]                                       # [7]
```

**After (TypeScript):**
```dockerfile
# Build stage                                                      # [1]
FROM node:16-alpine as builder                                     # [2]
WORKDIR /app                                                       # [3]
COPY package*.json ./                                              # [4]
RUN npm install                                                    # [5]
COPY . .                                                           # [6]
RUN npm run build                                                  # [7]

# Production stage                                                 # [8]
FROM node:16-alpine                                                # [9]
WORKDIR /app                                                       # [10]
COPY package*.json ./                                              # [11]
RUN npm ci --only=production                                       # [12]
COPY --from=builder /app/dist ./dist                               # [13]
EXPOSE 3001                                                        # [14]
CMD ["npm", "start"]                                               # [15]
```

**What Changed & Dockerfile Syntax Explained:**

**[1] Multi-stage Build:**
- New: `# Build stage`
- **What it means**:
  - First stage for building/compiling
  - Second stage for running
  - Smaller final image (no dev dependencies)

**[2] Builder Stage:**
- New: `FROM node:16-alpine as builder`
- **What `as builder` means**:
  - Names this stage "builder"
  - Can reference it later
  - Used for copying built files

**[3-6] Build Process:**
- Same as before but in first stage
- **What happens**:
  - Install all dependencies (dev + prod)
  - Copy source code
  - Build TypeScript to JavaScript

**[7] Build Command:**
- New: `RUN npm run build`
- **What it does**:
  - Runs TypeScript compiler
  - Converts `.ts` files to `.js` files in `dist/`
  - Only in build stage

**[8] Production Stage:**
- New: `# Production stage`
- **What it's for**:
  - Creates final, optimized image
  - Only includes necessary files
  - No dev dependencies

**[9-11] Production Base:**
- Same Node.js image
- **Why separate**:
  - Fresh start for clean image
  - Only production files

**[12] Production Dependencies:**
- New: `RUN npm ci --only=production`
- **What's different**:
  - `npm ci` instead of `npm install`
  - `--only=production` flag
  - Faster, more reliable install
  - Skips dev dependencies (TypeScript, etc.)

**[13] Copy Built Files:**
- New: `COPY --from=builder /app/dist ./dist`
- **What this does**:
  - Copies compiled JavaScript from builder stage
  - No source TypeScript files
  - Only production-ready code

**[14] Same Port Exposure:**
- Same as before
- **What it documents**:
  - Container listens on port 3001
  - For Docker networking setup

**[15] Start Command:**
- JavaScript: `CMD ["node", "src/index.js"]`
- TypeScript: `CMD ["npm", "start"]`
- **What changed**:
  - Uses npm script from package.json
  - Script runs `node dist/index.js`
  - More flexible and configurable

**Benefits of Multi-stage Docker:**
- **Smaller Image**: Production image ~50% smaller
- **Security**: No dev tools in production
- **Build Isolation**: Build errors don't affect production
- **CI/CD Friendly**: Separate build & run stages

### 1.10 Test the Conversion

**Testing Process Explained:**

```bash
# Build the TypeScript code
npm run build
```
- **What happens**:
  - TypeScript compiler reads `tsconfig.json`
  - Compiles all `.ts` files in `src/` to `.js` in `dist/`
  - Creates source maps for debugging
  - Reports any compilation errors

```bash
# Run in development mode
npm run dev
```
- **What happens**:
  - Uses `nodemon` to watch for file changes
  - Runs `ts-node` to execute TypeScript directly
  - No build step needed (compiles on-the-fly)
  - Restarts automatically on changes

```bash
# Lint for errors
npm run lint
```
- **What happens**:
  - Runs ESLint with TypeScript parser
  - Checks for code style issues
  - Finds potential bugs
  - Reports unused variables/imports

```bash
# Test endpoints
curl http://localhost:3001/health
```
- **What to verify**:
  - Service responds with `{"status": "healthy"}`
  - No TypeScript compilation errors in console
  - Database connection successful
  - All routes accessible

**Troubleshooting Tips:**
- **Compilation errors**: Check interface definitions match usage
- **Import errors**: Verify relative paths are correct
- **Type conflicts**: Ensure you've installed all `@types/` packages
- **Docker issues**: Make sure `dist/` folder exists after build

## Step 2: Event Service Migration

*📚 Learning Note: Follow the same pattern as Identity Service with different model*

### 2.1 Navigate to Event Service

```bash
cd ../event-service
```

### 2.2 Create TypeScript Config

Copy the same `tsconfig.json` from Identity Service.

### 2.3 Update package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "lint": "eslint . --ext .ts"
  }
}
```

### 2.4 Install Dependencies

```bash
npm install --save-dev typescript @types/node @types/express @types/mongoose @types/cors @types/helmet ts-node nodemon
```

### 2.5 Migrate Event Model

**Before (JavaScript):**
```javascript
// 📄 src/domain/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // ... other fields
});

module.exports = mongoose.model('Event', EventSchema);
```

**After (TypeScript):**
```typescript
// 📄 src/domain/models/Event.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  creatorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  visibility: 'public' | 'friends-only' | 'invite-only';
  dietaryOptions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  // ... other fields
}, {
  timestamps: true
});

export default mongoose.model<IEvent>('Event', EventSchema);
```

### 2.6 Migrate Event Controller

**Before (JavaScript):**
```javascript
// 📄 src/api/controllers/eventController.js
const Event = require('../../domain/models/Event');

exports.createEvent = async (req, res) => {
  // JavaScript implementation
};
```

**After (TypeScript):**
```typescript
// 📄 src/api/controllers/eventController.ts
import { Request, Response } from 'express';
import Event, { IEvent } from '../../domain/models/Event';

interface CustomRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

interface EventBody {
  title: string;
  description: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  location: string;
  visibility?: 'public' | 'friends-only' | 'invite-only';
  dietaryOptions?: string[];
}

export const createEvent = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const eventData: EventBody = req.body;
    
    const event = new Event({
      ...eventData,
      creatorId: req.user.userId,
      date: new Date(eventData.date)
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};
```

### 2.7 Update Dockerfile

Use the same multi-stage Dockerfile pattern as Identity Service, just change the port to 3002.

## Step 3: Invitation Service Migration

*📚 Learning Note: Uses the same pattern as previous services*

### 3.1 Navigate to Invitation Service

```bash
cd ../invitation-service
```

### 3.2 Migrate Invitation Model

**After (TypeScript):**
```typescript
// 📄 src/domain/models/Invitation.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
  eventId: string;
  inviteeId: string;
  inviterId: string;
  status: 'pending' | 'accepted' | 'declined';
  rsvpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>({
  eventId: {
    type: String,
    required: true
  },
  // ... other fields
}, {
  timestamps: true
});

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);
```

## Step 4: API Gateway Migration

*📚 Learning Note: API Gateway is last because it only routes traffic - no database*

### 4.1 Migrate Auth Middleware

**After (TypeScript):**
```typescript
// 📄 src/middleware/auth.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Same logic as Identity service auth middleware
};
```

### 4.2 Migrate Main Application

**After (TypeScript):**
```typescript
// 📄 src/index.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Public routes (no auth required)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true
}));

// Protected routes (auth required)
app.use(authMiddleware);
app.use('/api/events', createProxyMiddleware({
  target: process.env.EVENT_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

## Step 5: Final Integration

### 5.1 Update docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongo localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # ... other services
```

### 5.2 Test Everything

```bash
# From root directory
docker-compose down
docker-compose build
docker-compose up

# In a new terminal, run integration tests
chmod +x test-integration.sh
./test-integration.sh
```

## ✅ Migration Complete!

**What You've Achieved:**
- ✨ Type-safe codebase
- 🛡️ Compile-time error checking
- 📚 Better documentation through types
- 🔄 Maintainable microservices
- 🐳 Production-ready Docker setup

## 🆘 Catastrophic Recovery

If migration fails catastrophically:

```bash
# Complete rollback to JavaScript baseline
git reset --hard v1.0.0-docker-baseline

# Or create recovery branch
git checkout -b recovery-js v1.0.0-docker-baseline

# Clean Docker environment
docker-compose down -v --rmi all
docker-compose up --build
```