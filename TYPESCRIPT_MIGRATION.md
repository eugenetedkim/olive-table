# Olive Table - Complete TypeScript Migration Guide

## 📋 Migration Checklist

Use this checklist to track your progress across all services:

### Prerequisites
- [x] Create git baseline tag `v1.0.0-docker-baseline`
- [x] Verify Docker setup works with all services
- [x] Ensure all tests pass before starting migration

### Identity Service
- [x] Create TypeScript config
- [x] Update package.json scripts
- [x] Install TypeScript dependencies
- [x] Migrate User model
- [ ] Create TypeScript versions of files that import User model
- [ ] Migrate Auth middleware
- [ ] Migrate Auth controller
- [ ] Migrate Routes
- [ ] Migrate Main application
- [ ] Update Dockerfile
- [ ] Test Identity Service

### Event Service
- [ ] Create TypeScript config
- [ ] Update package.json scripts
- [ ] Install TypeScript dependencies
- [ ] Migrate Event model
- [ ] Migrate Event controller
- [ ] Migrate Routes
- [ ] Migrate Main application
- [ ] Update Dockerfile
- [ ] Test Event Service

### Invitation Service
- [ ] Create TypeScript config
- [ ] Update package.json scripts
- [ ] Install TypeScript dependencies
- [ ] Migrate Invitation model
- [ ] Migrate Invitation controller
- [ ] Migrate Routes
- [ ] Migrate Main application
- [ ] Update Dockerfile
- [ ] Test Invitation Service

### API Gateway
- [ ] Create TypeScript config
- [ ] Update package.json scripts
- [ ] Install TypeScript dependencies
- [ ] Migrate Auth middleware
- [ ] Migrate Main application
- [ ] Update Dockerfile
- [ ] Test API Gateway

### Final Integration
- [ ] Update docker-compose.yml
- [ ] Run integration tests
- [ ] Create new tag `v2.0.0-typescript-complete`

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

## 🔍 TypeScript Best Practices for Node.js/Express

Before starting the migration, let's review some TypeScript best practices:

### Interfaces vs Types
- **Use interfaces** for object shapes that might be extended:
  ```typescript
  // Good: Interface for models
  interface IUser extends Document {
    email: string;
    // ...
  }
  
  // Good: Type for simple objects
  type LoginCredentials = {
    email: string;
    password: string;
  };
  ```

### Function Signatures
- **Always include return types**:
  ```typescript
  // Bad
  async function findUser(id) { 
    // ...
  }
  
  // Good
  async function findUser(id: string): Promise<IUser | null> {
    // ...
  }
  ```

### Handling Null and Undefined
- **Use optional chaining and nullish coalescing**:
  ```typescript
  // Optional chaining
  const userName = user?.profile?.name;
  
  // Nullish coalescing
  const count = data?.count ?? 0;
  ```

### Error Handling
- **Type your errors**:
  ```typescript
  try {
    // ...
  } catch (error) {
    // Bad
    console.error(error);
    
    // Good
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
  ```

### Avoid `any` Type
- **Use `unknown` instead of `any` for unknown types**:
  ```typescript
  // Bad
  function parseData(data: any) {
    // ...
  }
  
  // Good
  function parseData(data: unknown) {
    if (typeof data === 'string') {
      // Now TypeScript knows it's a string
    }
  }
  ```

### Consistent Style
- **Use a consistent naming convention**:
  - Interfaces: `IPrefixed` or `PascalCase`
  - Types: `PascalCase`
  - Enums: `PascalCase`
  - Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

## 🚫 Common TypeScript Pitfalls

Be aware of these common issues when migrating:

### Third-Party Modules Without Types
- **Problem**: Some npm packages don't include TypeScript definitions
- **Solution**: 
  1. Check if `@types/package-name` exists: `npm install --save-dev @types/package-name`
  2. If not, create a declaration file:
  ```typescript
  // src/types/module-name/index.d.ts
  declare module 'module-name' {
    // Define minimal types needed
    export function someFunction(param: string): void;
  }
  ```

### Type Assertions
- **Problem**: TypeScript doesn't know the exact type after certain operations
- **Solution**: Use type assertions carefully (not too frequently):
  ```typescript
  const decoded = jwt.verify(token, secret) as { userId: string };
  ```

### Strict Null Checking Issues
- **Problem**: `strictNullChecks` flag requires explicit null/undefined handling
- **Solution**: Use proper null checking:
  ```typescript
  // Bad
  function getUser(id: string) {
    const user = findUserById(id);
    return user.name; // Error: user might be null
  }
  
  // Good
  function getUser(id: string) {
    const user = findUserById(id);
    if (!user) return null;
    return user.name;
  }
  ```

### Express Type Augmentation
- **Problem**: Adding custom properties to Express Request
- **Solution**: Proper declaration merging:
  ```typescript
  // src/types/express/index.d.ts
  declare namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
  ```

### Circular Dependencies
- **Problem**: TypeScript has stricter module resolution
- **Solution**: 
  1. Restructure code to avoid circular references
  2. Use interface-only imports for types

## 🔧 IDE Configuration

Setting up your IDE correctly will make TypeScript development much more productive.

### VS Code Configuration
Create a `.vscode/settings.json` file:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Recommended VS Code Extensions
- ESLint
- Prettier
- Error Lens
- TypeScript Hero
- Path Intellisense

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

#### What This Config Does:
- **`target: "es2020"`**: Compiles TypeScript to ES2020 JavaScript
  - Modern features supported (optional chaining, nullish coalescing)
  - Compatible with Node.js 16+

- **`module: "commonjs"`**: Uses Node.js module system
  - Required for Node.js (not browser)
  - Enables `require()` and `module.exports`

- **`lib: ["es2020"]`**: Specifies JavaScript API definitions
  - Includes type definitions for all ES2020 features
  - Enables access to built-in objects and methods like Promise, Map, BigInt
  - Provides intellisense for modern JavaScript APIs

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

- **`skipLibCheck: true`**: Skips type checking of declaration files
  - Speeds up compilation time significantly
  - Ignores errors in third-party library definitions

- **`forceConsistentCasingInFileNames: true`**: Enforces case sensitivity
  - Prevents import errors between Windows and Linux/Mac
  - Ensures consistent file naming across team members

- **`noImplicitAny: true`**: Forbids `any` type
  - Must explicitly define types
  - Increases code safety

- **`noUnusedLocals: true`**: Flags unused variables
  - Keeps code clean and maintainable
  - Prevents accidental bugs from unused declarations

- **`noUnusedParameters: true`**: Flags unused function parameters
  - Identifies potentially unnecessary arguments
  - Improves code clarity and function signatures

- **`noImplicitReturns: true`**: Requires explicit returns
  - All code paths must return a value
  - Prevents unexpected undefined returns

- **`moduleResolution: "node"`**: Uses Node.js module lookup
  - Finds modules in `node_modules`
  - Uses Node.js resolution algorithm

- **`resolveJsonModule: true`**: Enables JSON imports
  - Import JSON files with type checking
  - Access JSON structure with intellisense

- **`sourceMap: true`**: Creates debugging maps
  - Links compiled JS back to TS for debugging
  - Shows TS code in error stack traces

#### Project Configuration:

- **`include: ["src/**/*.ts"]`**: Files to compile
  - All TypeScript files in src directory
  - Includes subdirectories recursively

- **`exclude: ["node_modules", "dist"]`**: Excluded directories
  - Avoids processing third-party code
  - Prevents recompiling already compiled code

### 1.2 Update package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "lint": "eslint . --ext .ts",
    "test": "jest"
  }
}
```

#### What These Scripts Do:

- **`build: "tsc"`**: Compiles TypeScript to JavaScript
  - Runs the TypeScript compiler
  - Creates JavaScript files in the `dist` directory according to tsconfig.json
  - Must be run before deployment or production start
  - **Run with:** `npm run build`

- **`start: "node dist/index.js"`**: Runs the compiled application
  - Executes the compiled JavaScript (not TypeScript)
  - Used in production environments
  - Requires running `build` script first
  - **Run with:** `npm start`

- **`dev: "nodemon --exec ts-node src/index.ts"`**: Development mode
  - Watches for file changes with nodemon
  - Compiles and runs TypeScript directly with ts-node
  - Auto-restarts server when files change
  - No need to manually compile during development
  - **Run with:** `npm run dev`

- **`lint: "eslint . --ext .ts"`**: Code quality checks
  - Runs ESLint on all TypeScript files
  - Enforces coding standards
  - Identifies potential errors and style issues
  - Can be extended with `--fix` flag to auto-fix some issues
  - **Run with:** `npm run lint`
  - **Run with auto-fix:** `npm run lint -- --fix`

- **`test: "jest"`**: Run unit tests
  - Executes Jest test suite
  - Works with TypeScript files using ts-jest
  - **Run with:** `npm test`

### 1.3 Install TypeScript Dependencies

```bash
npm install --save-dev typescript @types/node @types/express @types/mongoose @types/bcrypt @types/jsonwebtoken @types/cors @types/helmet @types/cookie-parser ts-node nodemon eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin jest ts-jest @types/jest
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
- **Jest packages**: Testing framework
  - Enables TypeScript-aware testing
  - Supports mocking and test coverage

### 1.4 Migrate User Model

**Before (JavaScript):**
```javascript
// 📄 services/identity-service/src/domain/models/User.js
const mongoose = require('mongoose');                      // [1] Package import
const bcrypt = require('bcryptjs');                        // [2] Package import

const UserSchema = new mongoose.Schema({                   // [3] Schema definition
  email: {                                                 // [4] Email field
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {                                              // [5] Password field
    type: String,
    required: true,
  },
  firstName: {                                             // [6] First name field
    type: String,
    required: true,
    trim: true,
  },
  lastName: {                                              // [7] Last name field
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {                                        // [8] Profile picture field
    type: String,
  },
  dietaryPreferences: [String],                            // [9] Dietary preferences field
  friends: [{                                              // [10] Friends field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {                                             // [11] Created date field
    type: Date,
    default: Date.now,
  },
  updatedAt: {                                             // [12] Updated date field
    type: Date,
    default: Date.now,
  },
});                                                        // [13] End schema definition

UserSchema.pre('save', function(next) {                    // [14] Pre-save hook
  this.updatedAt = Date.now();

  if (!this.isModified('password')) {                      // [15] Skip hashing if unchanged
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {                      // [16] Generate salt and hash
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      
      this.password = hash;
      next();
    });
  });
});

UserSchema.methods.matchPassword = async function(enteredPassword) {  // [17] Password comparison method
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);      // [18] Export model
```

**After (TypeScript):**
```typescript
// 📄 services/identity-service/src/domain/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';    // [1] Package import (ES6)
import bcryptjs from 'bcryptjs';                          // [2] Package import (ES6)

// TypeScript addition: Interface definition
export interface IUser extends Document {                 // [TS-1] Interface declaration
  email: string;                                          // [4] Email field type
  password: string;                                       // [5] Password field type
  firstName: string;                                      // [6] First name field type
  lastName: string;                                       // [7] Last name field type
  profilePicture?: string;                                // [8] Profile picture field type
  dietaryPreferences?: string[];                          // [9] Dietary preferences field type
  friends?: mongoose.Types.ObjectId[];                    // [10] Friends field type
  createdAt: Date;                                        // [11] Created date field type
  updatedAt: Date;                                        // [12] Updated date field type
  matchPassword(enteredPassword: string): Promise<boolean>; // [TS-2] Method signature
}

const UserSchema = new Schema<IUser>({                    // [3] Schema definition with type
  email: {                                                // [4] Email field
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {                                             // [5] Password field
    type: String,
    required: true,
  },
  firstName: {                                            // [6] First name field
    type: String,
    required: true,
    trim: true,
  },
  lastName: {                                             // [7] Last name field
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {                                       // [8] Profile picture field
    type: String,
  },
  dietaryPreferences: {                                   // [9] Dietary preferences field
    type: [String],
  },
  friends: [{                                             // [10] Friends field
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {                                            // [11] Created date field
    type: Date,
    default: Date.now,
  },
  updatedAt: {                                            // [12] Updated date field
    type: Date,
    default: Date.now,
  }
});                                                       // [13] End schema definition

UserSchema.pre<IUser>('save', async function(next) {      // [14] Pre-save hook
  this.updatedAt = new Date();
  
  if (!this.isModified('password')) return next();        // [15] Skip hashing if unchanged
  
  try {                                                   // [16] Generate salt and hash (async)
    const salt = await bcryptjs.genSalt(10);              
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);                                 // [TS-3] Type assertion
  }
});

UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {  // [17] Password comparison method
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); // [18] Export model
```

**What Changed & TypeScript Syntax Explained:**

**[1] Import Statements:**
- JavaScript: `const mongoose = require('mongoose');`
- TypeScript: `import mongoose, { Document, Schema } from 'mongoose';`
- **What changed**: ES6 import syntax instead of CommonJS require
- **What it means**: TypeScript uses modern ES modules and can import specific types

**[2] Package Import:**
- JavaScript: `const bcrypt = require('bcryptjs');`
- TypeScript: `import bcryptjs from 'bcryptjs';`
- **What changed**: CommonJS to ES6 module syntax

**[TS-1] Interface Declaration:**
- New in TypeScript: `export interface IUser extends Document`
- **What it means**:
  - Defines the shape of your User document as a TypeScript type
  - `extends Document`: Inherits MongoDB document properties
  - Creates a contract for what fields and methods a User must have

**[3-13] Schema Definition:**
- JavaScript: Regular Mongoose schema
- TypeScript: Schema with type parameter `Schema<IUser>`
- **What changed**: The schema now references the interface type
- **What it means**: TypeScript ensures your schema matches the interface

**[4-12] Field Properties:**
- JavaScript: Schema field definitions
- TypeScript: 
  1. Interface property types (string, Date, etc.)
  2. Same schema field definitions as in JavaScript
- **What changed**: Added type definitions in the interface

**[8-10] Special Types:**
- JavaScript: Regular field definitions
- TypeScript:
  - `profilePicture?: string`: Optional string (the `?` means optional)
  - `dietaryPreferences?: string[]`: Optional array of strings (the `[]` means array)
  - `friends?: mongoose.Types.ObjectId[]`: Optional array of MongoDB IDs
- **What it means**: More precise type definitions

**[14-16] Pre-save Hook:**
- JavaScript: Callback-based approach
- TypeScript: 
  - Uses `pre<IUser>` to type the document
  - Uses modern async/await instead of callbacks
- **What changed**: More modern and type-safe approach

**[TS-3] Error Handling:**
- New in TypeScript: `next(error as Error);`
- **What it means**: Explicitly tells TypeScript that the error is an Error object

**[17] Method Implementation:**
- JavaScript: Method without parameter types
- TypeScript: Method with parameter and return types
- **What changed**: Added `(enteredPassword: string): Promise<boolean>`
- **What it means**: Type-safe method calls

**[18] Model Export:**
- JavaScript: `module.exports = mongoose.model('User', UserSchema);`
- TypeScript: `export default mongoose.model<IUser>('User', UserSchema);`
- **What changed**:
  - ES6 export syntax
  - Added `<IUser>` type parameter
- **What it means**: Type-safe model usage

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

## 1.5 Next Steps After User Model Migration

After successfully migrating the User model to TypeScript, follow these steps to complete the migration of related components:

### 1.5.1 Understanding the Parallel Files Approach

The most reliable way to migrate from JavaScript to TypeScript is using a parallel files approach:

1. **Keep JavaScript files functional during migration**
   - Original `.js` files remain untouched and working
   - New `.ts` files are created alongside them
   - Both versions coexist during the transition

2. **Maintain module system consistency**
   - JavaScript files continue using CommonJS (require/exports)
   - TypeScript files use ES Modules (import/export)
   - Module systems are not mixed in the same file

3. **Let your build system handle the integration**
   - TypeScript compiles to JavaScript in a separate directory (e.g., `dist/`)
   - Import paths refer to logical module locations, not file extensions
   - The Node.js module resolution system finds the right files

### 1.5.2 Identify Files for Migration

First, identify all files that reference the User model. You can use either command line or IDE search:

**Option 1: Command Line Search**
```bash
# Find all files referencing User
grep -r "User" services/ --include="*.js" --exclude-dir="node_modules"
```

**Option 2: VS Code Search (Easier Alternative)**
- Press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac)
- Enter "User" in the search field
- Filter to include only JavaScript files (*.js)
- Exclude the node_modules folder

Either method helps you locate:
- Controllers that import the User model (e.g., `userController.js`, `authController.js`)
- Routes that use User-related controllers (`users.js`)
- Any other files that might depend on the User model

### 1.5.3 Create TypeScript Versions of Files

For each file you want to migrate, create a parallel TypeScript version:

```bash
# Create TypeScript versions alongside JavaScript files
touch services/identity-service/src/api/controllers/userController.ts
touch services/identity-service/src/api/controllers/authController.ts
touch services/identity-service/src/api/routes/users.ts
```

**Important: Do NOT modify the original JavaScript files to import from TypeScript files.**

#### JavaScript File (Original - Remains Unchanged)
```javascript
// 📄 src/api/controllers/authController.js 
const jwt = require('jsonwebtoken');
const User = require('../../domain/models/User');

exports.login = async (req, res) => {
  // Original implementation
};
```

#### TypeScript File (New)
```typescript
// 📄 src/api/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../../domain/models/User';

export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response
): Promise<void> => {
  // TypeScript implementation
};
```

### 1.5.4 Configure Build Pipeline

Ensure your TypeScript compilation pipeline works correctly:

1. **Compile TypeScript to JavaScript**
   ```bash
   npm run build
   ```
   - This transpiles your `.ts` files to `.js` files in the `dist/` directory
   - The compiled files use CommonJS format for compatibility

2. **Use the compiled output for production**
   ```bash
   npm start
   ```
   - This runs `node dist/index.js`
   - Node resolves imports correctly from compiled files

3. **For development, use ts-node**
   ```bash
   npm run dev
   ```
   - This runs your TypeScript files directly with ts-node
   - No separate compilation step needed during development

### 1.5.5 Test Both Implementations

It's crucial to test both the JavaScript and TypeScript implementations during migration:

1. **Test the original JavaScript implementation**
   - Ensures your baseline functionality works
   - Acts as a reference for correct behavior

2. **Test the TypeScript implementation**
   - Validates that TypeScript types are correct
   - Confirms the build process works properly
   - Verifies runtime behavior matches the JavaScript version

### 1.5.6 Phase Out JavaScript Files

Only after confirming that the TypeScript implementation works correctly:

```bash
# Remove the JavaScript file
git rm services/identity-service/src/api/controllers/authController.js
git commit -m "chore(identity): Remove JavaScript auth controller after TypeScript migration"
```

### 1.5.7 Update References in Other Files

When migrating routes or other files that import controllers:

1. **First, create the TypeScript version of the importing file**
   ```typescript
   // In new routes/auth.ts file
   import { Router } from 'express';
   import { login, register } from '../controllers/authController';
   
   const router = Router();
   router.post('/login', login);
   router.post('/register', register);
   
   export default router;
   ```

2. **Ensure references are updated to use ES module syntax**
   - TypeScript files use `import/export`
   - JavaScript files continue to use `require/exports`

3. **Only remove the JavaScript version after all TypeScript files are tested**

## 1.6 Migrate Auth Middleware

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

### 1.7 Migrate Auth Controller

**Before (JavaScript):**
```javascript
// 📄 src/api/controllers/authController.js
const jwt = require('jsonwebtoken');                              // [1]
const User = require('../../domain/models/User');                 // [2]
const bcrypt = require('bcryptjs');                               // [3]

exports.register = async (req, res) => {                          // [4]
  try {
    const { email, password, firstName, lastName } = req.body;    // [5]
    
    let user = await User.findOne({ email });                     // [6]
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    user = new User({ email, password, firstName, lastName });    // [7]
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ token, user: { 
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    } });                                                         // [8]
  } catch (err) {
    res.status(500).json({ message: err.message });              // [9]
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, profilePicture, dietaryPreferences } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        firstName,
        lastName,
        profilePicture,
        dietaryPreferences,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**After (TypeScript):**
```typescript
// 📄 src/api/controllers/authController.ts
import { Request, Response } from 'express';                             // [1]
import jwt from 'jsonwebtoken';                                          // [2]
import User, { IUser } from '../../domain/models/User';                  // [3]

interface LoginBody {                                                    // [4]
  email: string;
  password: string;
}

interface RegisterBody {                                                 // [5]
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  dietaryPreferences?: string[];
}

interface UserRequest extends Request {                                  // [6]
  user?: {
    userId: string;
    email: string;
  };
}

export const register = async (                                          // [7]
  req: Request<{}, {}, RegisterBody>,                                    // [8]
  res: Response                                                          // [9]
): Promise<void> => {                                                    // [10]
  try {
    const { email, password, firstName, lastName, profilePicture, dietaryPreferences } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    
    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      profilePicture,
      dietaryPreferences: dietaryPreferences || []
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '24h' }
    );
    
    // Return user data (excluding password)
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        dietaryPreferences: user.dietaryPreferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (                                             // [11]
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '24h' }
    );
    
    // Return user data
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        dietaryPreferences: user.dietaryPreferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

export const getProfile = async (                                        // [12]
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
};

export const updateProfile = async (                                     // [13]
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { firstName, lastName, profilePicture, dietaryPreferences } = req.body;
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        firstName,
        lastName,
        profilePicture,
        dietaryPreferences,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

export const changePassword = async (                                    // [14]
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }
    
    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the password hashing in the pre-save hook
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};
```

**What Changed & TypeScript Syntax Explained:**

**[1-3] Imports:**
- JavaScript: CommonJS imports (`const x = require('y')`)
- TypeScript: ES module imports with specific types

**[4-6] TypeScript Interfaces:**
- New in TypeScript: Interface definitions for request bodies and custom request
- Defines shape of data with proper types
- Improves type safety and code documentation

**[7-10] Function Signature:**
- JavaScript: Export assignment with function expression
- TypeScript: Named export with explicit parameter and return types
- Ensures type safety in controller methods

**[11] Login Implementation:**
- Full typed implementation for login route
- Type-safe JWT token generation
- Proper error handling with early returns

**[12] Profile Retrieval:**
- Uses custom UserRequest type with optional user property
- Safe property access with optional chaining
- Strong typing for error handling

**[13] Profile Updates:**
- Type-safe MongoDB update operations
- Explicit date handling with TypeScript Date object
- Proper null checking and error response

**[14] Password Management:**
- Additional security method not in original example
- Demonstrates pre-save hook interaction
- Type-safe authentication flow

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

### 1.8 Migrate User Controller

**Before (JavaScript):**
```javascript
// 📄 src/api/controllers/userController.js
const User = require('../../domain/models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    
    // Validate friendId is not the user's own ID
    if (req.user.userId === friendId) {
      return res.status(400).json({ message: 'Cannot add yourself as a friend' });
    }
    
    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }
    
    // Get current user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already friends
    if (user.friends && user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }
    
    // Add friend to user's friends list
    if (!user.friends) user.friends = [];
    user.friends.push(friend._id);
    await user.save();
    
    // Add user to friend's friends list (bidirectional)
    if (!friend.friends) friend.friends = [];
    friend.friends.push(user._id);
    await friend.save();
    
    res.status(200).json({ message: 'Friend added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    
    // Get current user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get friend
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }
    
    // Check if they are friends
    if (!user.friends || !user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Not friends with this user' });
    }
    
    // Remove friend from user's friends list
    user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
    await user.save();
    
    // Remove user from friend's friends list (bidirectional)
    if (friend.friends) {
      friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());
      await friend.save();
    }
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    // Get user and populate friends
    const user = await User.findById(req.user.userId).populate({
      path: 'friends',
      select: '-password'
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ friends: user.friends || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**After (TypeScript):**
```typescript
// 📄 src/api/controllers/userController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../../domain/models/User';

interface UserRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Error retrieving user' });
  }
};

export const addFriend = async (
  req: UserRequest & { params: { friendId: string } },
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { friendId } = req.params;
    
    // Validate friendId is not the user's own ID
    if (req.user.userId === friendId) {
      res.status(400).json({ message: 'Cannot add yourself as a friend' });
      return;
    }
    
    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      res.status(404).json({ message: 'Friend not found' });
      return;
    }
    
    // Get current user
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Check if already friends
    const friendObjectId = new mongoose.Types.ObjectId(friendId);
    if (user.friends?.some(id => id.equals(friendObjectId))) {
      res.status(400).json({ message: 'Already friends with this user' });
      return;
    }
    
    // Add friend to user's friends list
    user.friends = [...(user.friends || []), friendObjectId];
    await user.save();
    
    // Add user to friend's friends list (bidirectional)
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    friend.friends = [...(friend.friends || []), userObjectId];
    await friend.save();
    
    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ message: 'Error adding friend' });
  }
};

export const removeFriend = async (
  req: UserRequest & { params: { friendId: string } },
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const { friendId } = req.params;
    
    // Get current user
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Get friend
    const friend = await User.findById(friendId);
    if (!friend) {
      res.status(404).json({ message: 'Friend not found' });
      return;
    }
    
    // Check if they are friends
    const friendObjectId = new mongoose.Types.ObjectId(friendId);
    if (!user.friends?.some(id => id.equals(friendObjectId))) {
      res.status(400).json({ message: 'Not friends with this user' });
      return;
    }
    
    // Remove friend from user's friends list
    user.friends = user.friends.filter(id => !id.equals(friendObjectId));
    await user.save();
    
    // Remove user from friend's friends list (bidirectional)
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
    if (friend.friends) {
      friend.friends = friend.friends.filter(id => !id.equals(userObjectId));
      await friend.save();
    }
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Error removing friend' });
  }
};

export const getFriends = async (
  req: UserRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    // Get user and populate friends
    const user = await User.findById(req.user.userId).populate({
      path: 'friends',
      select: '-password'
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({ friends: user.friends || [] });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error retrieving friends' });
  }
};
```

**What Changed & TypeScript Syntax Explained:**

1. **Custom Interfaces**: Added a `UserRequest` interface extending Express `Request` to include the user object with properly typed properties

2. **Type-Safe Route Parameters**: Using TypeScript template literals for route parameters like `req: Request<{ id: string }>`

3. **Promise Return Types**: All async methods return `Promise<void>` for better type safety

4. **Improved Null/Undefined Checking**: 
   - Using optional chaining (`?.`) for potentially undefined properties
   - Early returns with proper type checking
   - Explicit array initialization with non-null spreads: `[...(user.friends || [])]`

5. **Type-Safe MongoDB Operations**:
   - Properly typed ObjectId comparisons 
   - Using MongoDB equality methods instead of JavaScript equality (`id.equals()` vs `===`)
   - Proper ObjectId handling with `mongoose.Types.ObjectId`

6. **Consistent Error Handling**:
   - More detailed error logging
   - Standardized error response formats
   - Type-safe error objects

7. **Enhanced TypeScript Parameter Types**:
   - Combined request types: `UserRequest & { params: { friendId: string } }`
   - Ensures both custom properties and route parameters are properly typed

8. **No More Return-Response Pattern**:
   - JavaScript: Used `return res.status(404)` pattern
   - TypeScript: Clean early returns with `return` statements after responses

### 1.9 Migrate Routes

**Before (JavaScript):**
```javascript
// 📄 src/api/routes/auth.js
const express = require('express');                                   // [1]
const { register, login } = require('../controllers/authController'); // [2]
const { authMiddleware } = require('../middleware/auth');            // [3]

const router = express.Router();                                     // [4]

router.post('/register', register);                                  // [5]
router.post('/login', login);                                        // [6]
router.get('/profile', authMiddleware, getProfile);                  // [7]
router.put('/profile', authMiddleware, updateProfile);               // [8]
router.put('/password', authMiddleware, changePassword);             // [9]

module.exports = router;                                             // [10]
```

**Before (JavaScript):**
```javascript
// 📄 src/api/routes/users.js
const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  addFriend, 
  removeFriend, 
  getFriends 
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Protected routes
router.get('/friends', authMiddleware, getFriends);
router.post('/friends/:friendId', authMiddleware, addFriend);
router.delete('/friends/:friendId', authMiddleware, removeFriend);

module.exports = router;
```

**After (TypeScript):**
```typescript
// 📄 src/api/routes/auth.ts
import { Router } from 'express';                                    // [1]
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  changePassword 
} from '../controllers/authController';                              // [2]
import { authMiddleware } from '../middleware/auth';                 // [3]

const router = Router();                                             // [4]

// Public routes
router.post('/register', register);                                  // [5]
router.post('/login', login);                                        // [6]

// Protected routes
router.get('/profile', authMiddleware, getProfile);                  // [7]
router.put('/profile', authMiddleware, updateProfile);               // [8]
router.put('/password', authMiddleware, changePassword);             // [9]

export default router;                                               // [10]
```

**After (TypeScript):**
```typescript
// 📄 src/api/routes/users.ts
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  addFriend,
  removeFriend,
  getFriends
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Protected routes
router.get('/friends', authMiddleware, getFriends);
router.post('/friends/:friendId', authMiddleware, addFriend);
router.delete('/friends/:friendId', authMiddleware, removeFriend);

export default router;
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
- TypeScript: `import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController';`
- **What's improved**:
  - ES6 import syntax
  - Explicit imports for all controller methods
  - TypeScript checks these exports exist
  - Better IDE support and autocomplete

**[3] Middleware Import:**
- JavaScript: `const { authMiddleware } = require('../middleware/auth');`
- TypeScript: `import { authMiddleware } from '../middleware/auth';`
- **What's improved**:
  - ES6 import syntax
  - TypeScript type checking

**[4] Router Creation:**
- JavaScript: `const router = express.Router();`
- TypeScript: `const router = Router();`
- **What changed**:
  - Direct Router() call (named import)
  - TypeScript infers router type automatically
  - Type-safe router operations

**[5-9] Route Definitions:**
- Same syntax in both versions
- **What TypeScript adds**:
  - Type checking for route handler functions
  - Ensures handlers have correct Express middleware signature
  - Verifies that controller methods exist and have correct types

**[10] Export:**
- JavaScript: `module.exports = router;`
- TypeScript: `export default router;`
- **What's different**:
  - ES6 module syntax
  - Default export (can import like: `import authRoutes from './auth'`)
  - TypeScript preserves router type information

### 1.10 Migrate Main Application

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

### 1.9 Migrate Main Application

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
import express, { Request, Response, NextFunction } from 'express';      // [1]
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {  // [10]
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
  .catch((err: Error) => {                                             // [13]
    console.error('Failed to start server:', err.message);
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
- TypeScript: `app.use((err: Error, req: Request, res: Response, next: NextFunction) => {`
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
- New: `.catch((err: Error) => { ... });`
- **What's improved**:
  - Typed error object
  - Handles database connection failures
  - Graceful server startup error handling
  - Proper process exit on critical errors

### 1.10 Migrate Main Application

**Before (JavaScript):**
```javascript
// 📄 src/index.js
const express = require('express');                                  // [1]
const cors = require('cors');                                        // [2]
const helmet = require('helmet');                                    // [3]
const morgan = require('morgan');                                    // [4]
const connectDB = require('./infrastructure/db/mongoose');           // [5]
const authRoutes = require('./api/routes/auth');                     // [6]
const userRoutes = require('./api/routes/users');                    // [7]

const app = express();                                               // [8]
const PORT = process.env.PORT || 3001;                               // [9]

// Middleware                                                       
app.use(cors());                                                     // [10]
app.use(helmet());                                                   // [11]
app.use(morgan('dev'));                                              // [12]
app.use(express.json());                                             // [13]

// Routes                                                           
app.use('/api/auth', authRoutes);                                    // [14]
app.use('/api/users', userRoutes);                                   // [15]

// Health check
app.get('/health', (req, res) => {                                   // [16]
  res.status(200).json({ status: 'healthy' });
});

// Error handling                                                   
app.use((err, req, res, next) => {                                   // [17]
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server                                                     
connectDB().then(() => {                                              // [18]
  app.listen(PORT, () => {
    console.log(`Identity service running on port ${PORT}`);
  });
}).catch(err => {                                                     // [19]
  console.error('Database connection failed:', err);
  process.exit(1);
});
```

**After (TypeScript):**
```typescript
// 📄 src/index.ts
import express, { Request, Response, NextFunction } from 'express';        // [1]
import cors from 'cors';                                                   // [2]
import helmet from 'helmet';                                               // [3]
import morgan from 'morgan';                                               // [4]
import { config } from 'dotenv';                                           // [5]
import connectDB from './infrastructure/db/mongoose';                      // [6]
import authRoutes from './api/routes/auth';                                // [7]
import userRoutes from './api/routes/users';                               // [8]

// Load environment variables
config();                                                                  // [9]

const app = express();                                                    // [10]
const PORT: number = parseInt(process.env.PORT || '3001', 10);            // [11]

// Middleware                                                           
app.use(cors());                                                          // [12]
app.use(helmet());                                                        // [13]
app.use(morgan('dev'));                                                   // [14]
app.use(express.json());                                                  // [15]

// Routes                                                               
app.use('/api/auth', authRoutes);                                         // [16]
app.use('/api/users', userRoutes);                                        // [17]

// Health check
app.get('/health', (_req: Request, res: Response): void => {              // [18]
  res.status(200).json({ status: 'healthy' });
});

// Error handling                                                       
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {  // [19]
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to database and start server                                
connectDB()                                                               // [20]
  .then(() => {
    app.listen(PORT, (): void => {                                        // [21]
      console.log(`Identity service running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {                                               // [22]
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

export default app;                                                        // [23]
```

**What Changed & TypeScript Syntax Explained:**

**[1-4] ES6 Imports:**
- JavaScript: `const module = require('path');`
- TypeScript: `import module from 'path';` or `import { named } from 'path';`
- **What's improved**:
  - Consistent ES6 module syntax
  - TypeScript type checking on imports
  - Express types explicitly imported

**[5] Environment Variables:**
- New: `import { config } from 'dotenv';`
- **Why**: Proper environment variable loading for TypeScript

**[6-8] Module Imports:**
- JavaScript: `const authRoutes = require('./api/routes/auth');`
- TypeScript: `import authRoutes from './api/routes/auth';`
- **What's improved**:
  - ES6 import syntax
  - TypeScript verifies exports exist

**[9] Dotenv Configuration:**
- New: `config();`
- **Why**: Ensures environment variables are loaded early

**[10] Express App:**
- Same syntax, TypeScript infers type
- **What's checked**:
  - `app` has all Express methods
  - Method signatures are validated

**[11] Port Configuration:**
- JavaScript: `const PORT = process.env.PORT || 3001;`
- TypeScript: `const PORT: number = parseInt(process.env.PORT || '3001', 10);`
- **What's improved**:
  - `process.env.PORT` is string | undefined
  - Explicitly converts to number with parseInt
  - Ensures PORT is always a number type
  - Prevents "port must be number" errors

**[12-15] Middleware & Routes:**
- Same syntax in both
- **What TypeScript verifies**:
  - Middleware functions have correct signature
  - Route handlers are valid Express middleware

**[16-17] Routes Setup:**
- Same syntax, TypeScript checks types
- **What's validated**:
  - Routes are properly exported from modules
  - Compatible with Express router type

**[18] Health Check Route:**
- JavaScript: `app.get('/health', (req, res) => {`
- TypeScript: `app.get('/health', (_req: Request, res: Response): void => {`
- **What's improved**:
  - Typed parameters
  - Return type annotation
  - Unused parameter prefixed with underscore

**[19] Error Handler:**
- JavaScript: `app.use((err, req, res, next) => {`
- TypeScript: `app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {`
- **What's added**:
  - Explicit parameter types
  - `err: Error` - TypeScript knows error properties
  - Full Express types for request, response, next
  - Conditional error details based on environment

**[20-22] Database Connection:**
- More explicit Promise chain
- **What TypeScript adds**:
  - Type checking on Promise methods
  - Typed error handling
  - Explicit void return type on callbacks

**[23] Module Export:**
- New: `export default app;`
- **Why**:
  - Makes app available for testing
  - Follows ES6 module pattern

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

### 1.11 File Transition Strategy

When migrating a file from JavaScript to TypeScript, follow this two-stage approach:

**Stage 1: Implementation**
1. Create the new TypeScript file alongside the existing JavaScript file
   ```bash
   # Example: User model
   touch services/identity-service/src/domain/models/User.ts
   ```
2. Implement the TypeScript version while keeping the JavaScript version untouched
3. Test the TypeScript implementation thoroughly

**Stage 2: Replacement**
1. Update all import statements in other files to reference the TypeScript file
   ```javascript
   // Before
   const User = require('../../domain/models/User');
   
   // After
   import User from '../../domain/models/User';
   ```
2. Remove the JavaScript file once all references are updated
   ```bash
   git rm services/identity-service/src/domain/models/User.js
   ```

**Git Workflow for File Migration:**
```bash
# First commit the new TypeScript file
git add services/identity-service/src/domain/models/User.ts
git commit -m "feat(identity): Migrate User model to TypeScript"

# After testing and confirming it works, remove the JS file
git rm services/identity-service/src/domain/models/User.js
git commit -m "chore(identity): Remove JavaScript User model after TypeScript migration"
```

**Handling Migration Rollbacks for Individual Files:**

If issues arise with a specific migrated file:

1. Re-enable the JavaScript version temporarily:
   ```bash
   git checkout HEAD~1 -- services/identity-service/src/domain/models/User.js
   ```

2. Update imports to point back to the JavaScript version:
   ```javascript
   // Revert to
   const User = require('../../domain/models/User');
   ```

3. Fix issues in the TypeScript file
   
4. Try the migration again:
   ```bash
   git add services/identity-service/src/domain/models/User.ts
   git commit -m "fix(identity): Fix TypeScript User model implementation"
   ```

This two-step approach gives you a clear migration path and provides a safety net during implementation.

### 1.12 Development and Production Workflows

During the TypeScript migration process, it's important to understand both your development workflow and how production deployment will work.

**Development Workflow**

When migrating to TypeScript, you'll have two ways to run your application during development:

1. **Running Original JavaScript Files**:
   ```bash
   # Run the original JavaScript files
   node src/index.js
   ```
   - This runs the untouched JavaScript version
   - Useful as a reference point during migration

2. **Running TypeScript Files with ts-node**:
   ```bash
   # Run TypeScript files directly
   npm run dev
   ```
   - Uses ts-node to run TypeScript without compilation
   - Provides immediate feedback on type errors
   - Restarts automatically when files change
   - During migration, TypeScript files will import from other TypeScript files
   - JavaScript files will continue to import from JavaScript files
   - Great for active development and testing

**Production Workflow**

For production deployment, you'll use the compiled output:

1. **Build TypeScript to JavaScript**:
   ```bash
   npm run build
   ```
   - Compiles all TypeScript files to JavaScript in the `dist` folder
   - Converts ES Module imports to CommonJS for Node.js compatibility
   - Type checking happens during this step

2. **Run Compiled Code**:
   ```bash
   npm start
   ```
   - Runs the compiled JavaScript from the `dist` folder
   - No TypeScript or source files needed in production
   - Uses only the TypeScript-derived JavaScript files

**Docker Production Deployment**

When deploying with Docker, the multi-stage build handles this process:

1. **Build Stage**:
   - Installs all dependencies (including dev dependencies)
   - Compiles TypeScript to JavaScript
   - Runs linting and tests

2. **Production Stage**:
   - Uses a clean Node.js base image
   - Installs only production dependencies
   - Copies just the compiled JavaScript from the build stage
   - Results in a smaller, more secure production image

This approach ensures your production environment never needs to deal with TypeScript directly - it only runs the compiled JavaScript code, while still giving you all the benefits of TypeScript during development.

### 1.13 Testing Strategies

#### Unit Testing with Jest

Configure Jest for TypeScript in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?: 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: './coverage',
};
```

Create a test for the User model:

```typescript
// 📄 src/domain/models/User.test.ts
import mongoose from 'mongoose';
import User, { IUser } from './User';

// Mock mongoose functions
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn().mockReturnThis(),
    methods: {},
  })),
  model: jest.fn().mockReturnValue({
    findOne: jest.fn(),
  }),
}));

describe('User Model', () => {
  it('should validate a valid user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };
    
    const userInstance = new User(userData);
    
    // Mock save method
    userInstance.save = jest.fn().mockResolvedValue(userInstance);
    
    await expect(userInstance.save()).resolves.toBeDefined();
  });
  
  it('should match password correctly', async () => {
    // Implement password matching test
  });
});
```

#### Integration Testing

For API endpoints:

```typescript
// 📄 src/api/controllers/authController.test.ts
import request from 'supertest';
import app from '../../app';
import User from '../../domain/models/User';

// Mock User model
jest.mock('../../domain/models/User');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Mock User.findOne to return null (no existing user)
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Mock User constructor and save method
      const saveMock = jest.fn().mockResolvedValue({
        _id: 'fake-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      
      (User as unknown as jest.Mock).mockImplementation(() => ({
        save: saveMock,
      }));
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });
  });
});
```

### 1.14 Test the Conversion

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
# Run unit tests
npm test
```
- **What happens**:
  - Jest runs all test files
  - Tests TypeScript code directly
  - Reports test coverage and failures

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
- **Runtime errors**: Check for `any` types that might be hiding issues