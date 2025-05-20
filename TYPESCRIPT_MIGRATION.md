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

## 🔍 TypeScript Best Practices

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

## 🔧 Development Setup

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

## 🛡️ Handling Sensitive Data in TypeScript

When migrating to TypeScript with strict mode, handling sensitive data like passwords requires special consideration.

### The TypeScript Strict Mode Challenge

In strict mode, if a field is defined as required in an interface like our User model:

```typescript
interface IUser extends Document {
  email: string;
  password: string; // Required property!
  // ...other fields
}
```

TypeScript won't allow you to delete this property later:

```typescript
const user = await User.findById(id);
const userObj = user.toObject();
delete userObj.password; // ❌ Error: The operand of a 'delete' operator must be optional
```

This happens because deleting a required property would make the object inconsistent with its declared type.

### Best Practice: Schema-Level Transforms

The recommended approach for handling sensitive data in TypeScript + Mongoose is to implement password removal at the schema level using Mongoose's transform function:

```typescript
// Create a utility function for removing passwords during serialization
const removePassword = (_: any, ret: any) => {
  delete ret.password;  // Remove password from the plain object
  return ret;
};

const UserSchema = new Schema<IUser>(
  { /* schema fields */ },
  {  // Schema options with transform functions
    toObject: {
      transform: removePassword  // Remove password when converting to object
    },
    toJSON: {
      transform: removePassword  // Remove password when converting to JSON
    }
  }
);
```

Then use type assertions when working with the processed documents:

```typescript
const userResponse = user.toObject() as Omit<IUser, 'password'>;
```

### Password Security Pattern Comparison

| Approach | Implementation | Pros | Cons | 
|----------|---------------|------|------|
| **Schema-Level Transform (Recommended)** | `Schema({ fields }, { toObject: { transform: removePassword } })` | • Centralized implementation<br>• Automatic for all documents<br>• Consistent security<br>• DRY principle | • Requires type assertion<br>• Slightly more initial setup |
| **Controller-Level Transform** | `user.toObject({ transform: removePassword })` | • Works when schema can't be modified<br>• Explicit at usage point | • Must be repeated everywhere<br>• Easy to forget<br>• Inconsistent if missed |
| **Manual Deletion** | `const obj = user.toObject(); delete obj.password;` | • Simple to understand<br>• Direct approach | • TypeScript errors in strict mode<br>• Must be manually done everywhere<br>• Easy to miss |
| **Destructuring** | `const { password, ...userWithoutPassword } = user.toObject()` | • Clean ES6 syntax<br>• TypeScript infers result type | • Must be done manually<br>• Can't be defined at schema level<br>• No clear intent documentation |

### Real-World Security Benefits

```typescript
// JavaScript:
const user = await User.findById(id);
const userObj = user.toObject();
// No compile-time protection against:
delete userObj.requiredField;  // Silently removes required field
const userData = JSON.stringify(userObj);  // Password might be included!

// TypeScript with schema transforms:
const user = await User.findById(id);
const userObj = user.toObject() as Omit<IUser, 'password'>;

// ❌ TypeScript Error: Property 'password' does not exist on type 'Omit<IUser, 'password'>'
console.log(userObj.password);  

// ✓ TypeScript checks type completeness
const safeJson = JSON.stringify(userObj); // Password guaranteed to be excluded
```

## 🚢 Migration Strategy

### Parallel Files Approach

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

### File Transition Workflow

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

## Step 1: Identity Service Migration

*📚 Learning Note: We start with Identity Service as it's the foundation for auth*

### 1.1 TypeScript Configuration

Navigate to the identity service directory:
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

Key configuration options:
- **`strict: true`**: Enables all strict type checking options
- **`target: "es2020"`**: Ensures modern JavaScript features are available
- **`outDir: "./dist"`**: Compiled JavaScript files go here
- **`esModuleInterop: true`**: Enables cleaner imports from CommonJS modules
- **`moduleResolution: "node"`**: Uses Node.js module resolution algorithm

### 1.2 Update Package Scripts

Update `package.json` scripts:
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

Key scripts:
- **`build`**: Compiles TypeScript to JavaScript
- **`start`**: Runs the compiled JavaScript 
- **`dev`**: Uses nodemon and ts-node for development
- **`lint`**: Runs ESLint on TypeScript files
- **`test`**: Runs Jest tests

### 1.3 Install TypeScript Dependencies

```bash
npm install --save-dev typescript @types/node @types/express @types/mongoose @types/bcrypt @types/jsonwebtoken @types/cors @types/helmet @types/cookie-parser ts-node nodemon eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin jest ts-jest @types/jest
```

Key packages:
- **`typescript`**: The TypeScript compiler
- **`@types/*`**: Type definitions for libraries
- **`ts-node`**: Runs TypeScript directly without compilation
- **`nodemon`**: Monitors for changes and restarts server
- **`eslint` packages**: Linting for TypeScript
- **Jest packages**: Testing TypeScript code

### 1.4 Migrate User Model

**JavaScript Version (Original):**
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

**TypeScript Version:**
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

// Create a utility function for removing passwords during serialization
const removePassword = (_: any, ret: any) => {            // [TS-4] Transform function
  delete ret.password;  // Remove password from the plain object
  return ret;
};

const UserSchema = new Schema<IUser>(
  {  // Schema definition begins
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
  },
  {  // Schema options with transform functions
    toObject: {
      transform: removePassword  // Remove password when converting to object
    },
    toJSON: {
      transform: removePassword  // Remove password when converting to JSON
    }
  }
);                                                       // [13] End schema definition

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

**[TS-4] Transform Function:**
- New in TypeScript: `const removePassword = (_, ret) => { delete ret.password; return ret; };`
- **What it means**:
  - Defines a function to remove passwords during document serialization
  - Called automatically when converting documents to objects/JSON
  - Centralizes security at the schema level
  - Consistent across the entire application
  - Prevents accidental password leaks

**[Schema Options]:**
- New in TypeScript: Schema options with transform functions
- **What it means**:
  - Automatically removes passwords whenever documents are serialized
  - Password never leaves the server in API responses
  - Works with both `toObject()` and `toJSON()`
  - Single implementation for all User documents

**Real-World Benefits:**
```typescript
// JavaScript:
const user = await User.findById(id);
const userObj = user.toObject();
// No compile-time protection against:
delete userObj.requiredField;  // Silently removes required field
const userData = JSON.stringify(userObj);  // Password might be included!

// TypeScript with schema transforms:
const user = await User.findById(id);
const userObj = user.toObject() as Omit<IUser, 'password'>;

// ❌ TypeScript Error: Property 'password' does not exist on type 'Omit<IUser, 'password'>'
console.log(userObj.password);  

// ✓ TypeScript checks type completeness
const safeJson = JSON.stringify(userObj); // Password guaranteed to be excluded
```

### 1.5 Migrate Controllers

#### User Controller Migration

**JavaScript Version (Original):**
```javascript
// File path: services/identity-service/src/api/controllers/userController.js

const User = require('../../domain/models/User');

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    if (req.body.dietaryPreferences) user.dietaryPreferences = req.body.dietaryPreferences;

    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();

    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
```

**TypeScript Version:**
```typescript
// File path: services/identity-service/src/api/controllers/userController.ts

import { Request, Response } from 'express';
import User, { IUser } from '../../domain/models/User';

// Define interface for request with user property
interface UserRequest extends Request {
  user?: {
    id: string;
  };
}

// Define interface for profile update request body
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
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
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
  req: UserRequest & { body: UpdateProfileBody },
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.id);

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

    // Schema transform will automatically remove the password
    // We just need to add the type assertion for TypeScript
    const userResponse = updatedUser.toObject() as Omit<IUser, 'password'>;

    res.json(userResponse);
  } catch (error) {
    // Type-safe error handling
    if (error instanceof Error) {
      console.error('Profile update error:', error.message);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    
    res.status(400).json({ 
      message: 'Failed to update profile' 
    });
  }
};
```

Key improvements:
- **Type-safe requests**: Explicit interface for request parameters and body
- **Error handling**: Type-safe error checks with `instanceof Error`
- **Optional chaining**: Safe property access with `?.` operator
- **Early returns**: Cleaner control flow
- **Type assertions**: Using `as Omit<IUser, 'password'>` for type safety with schema transforms

### 1.6 Migrate Auth Middleware

**JavaScript Version (Original):**
```javascript
// 📄 src/api/middleware/auth.js
const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**TypeScript Version:**
```typescript
// 📄 src/api/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CustomRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

Key improvements:
- **Request interface extension**: CustomRequest for typed req.user
- **Type assertions**: jwt.verify result typed correctly
- **Optional chaining**: Safe property access with `?.`
- **Import types**: Express types included for better type checking
- **Type safety**: Function return type explicitly void

### 1.7 Migrate Routes

**JavaScript Version (Original):**
```javascript
// 📄 src/api/routes/auth.js
const express = require('express');                                   // [1]

const router = express.Router();                                      // [2]

const { register, login } = require('../controllers/authController'); // [3]

const { authMiddleware } = require('../middleware/auth');            // [4]

router.post('/register', register);                                  // [5]

router.post('/login', login);                                        // [6]

router.get('/profile', authMiddleware, getProfile);                  // [7]
router.put('/profile', authMiddleware, updateProfile);               // [8]
router.put('/password', authMiddleware, changePassword);             // [9]

module.exports = router;                                             // [10]
```

**TypeScript Version:**
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

### 1.8 Migrate Main Application

**JavaScript Version (Original):**
```javascript
// 📄 src/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./infrastructure/db/mongoose');
const authRoutes = require('./api/routes/auth');
const userRoutes = require('./api/routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware                                                       
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes                                                           
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling                                                   
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server                                                     
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Identity service running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
```

**TypeScript Version:**
```typescript
// 📄 src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import connectDB from './infrastructure/db/mongoose';
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/users';

// Load environment variables
config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Middleware                                                           
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes                                                               
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling                                                       
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to database and start server                                
connectDB()
  .then(() => {
    app.listen(PORT, (): void => {
      console.log(`Identity service running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

export default app;
```

Key improvements:
- **Typed parameters**: All Express handlers have proper types
- **ES module syntax**: Consistent import/export
- **Error typing**: Error handler accepts Error type
- **Environment handling**: dotenv configuration
- **Return types**: All functions have explicit return types
- **Port handling**: Safe parsing of PORT with fallback
- **Unused parameters**: Prefixed with underscore

### 1.9 Update Dockerfile

**Before (JavaScript):**
```dockerfile
FROM node:16-alpine                                                 # [1]
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

### 1.10 Testing the Conversion

To test the TypeScript conversion:

1. **Build the TypeScript code**
   ```bash
   npm run build
   ```

2. **Run the compiled code**
   ```bash
   npm start
   ```

3. **Run API tests**
   ```bash
   curl http://localhost:3001/health
   ```

4. **Verify database connection**
   Check the logs for successful MongoDB connection

## Step 2: Event Service Migration

*Follow the same steps as for Identity Service, adapting for Event-specific models and controllers*

## Step 3: Invitation Service Migration

*Follow the same steps as for Identity Service, adapting for Invitation-specific models and controllers*

## Step 4: API Gateway Migration

*Follow the same steps as for Identity Service, adapting for API Gateway-specific requirements*

## 🏁 Final Integration

Once all services are migrated to TypeScript:

1. **Update docker-compose.yml**:
   ```yaml
   version: '3'
   services:
     identity-service:
       build: ./services/identity-service
       # ... other configuration
     event-service:
       build: ./services/event-service
       # ... other configuration
     invitation-service:
       build: ./services/invitation-service
       # ... other configuration
     api-gateway:
       build: ./services/api-gateway
       # ... other configuration
   ```

2. **Run integration tests**:
   ```bash
   docker-compose up -d
   npm run test:integration
   ```

3. **Create completion tag**:
   ```bash
   git tag -a v2.0.0-typescript-complete -m "Completed TypeScript migration for all services"
   git push origin v2.0.0-typescript-complete
   ```

## 📚 TypeScript Utility Types for API Development

TypeScript provides powerful utility types particularly useful for API development:

### Omit<Type, Keys>
```typescript
// Remove sensitive fields from user data
type PublicUser = Omit<IUser, 'password' | 'resetToken'>;
```

### Pick<Type, Keys>
```typescript
// Only get minimal properties for a response
type UserSummary = Pick<IUser, 'id' | 'firstName' | 'lastName'>;
```

### Partial<Type>
```typescript
// For update operations where all fields are optional
type UserUpdate = Partial<IUser>;
```

### Required<Type>
```typescript
// Ensure all properties exist
type CompleteProfile = Required<UserProfile>;
```

### Record<Keys, Type>
```typescript
// For mapping user IDs to user objects
type UserMap = Record<string, IUser>;
```

### Using multiple utility types together
```typescript
// Both partial and without sensitive data
type PartialPublicUser = Partial<Omit<IUser, 'password'>>;
```

## 🔒 Additional Security Best Practices

Beyond schema transforms for password security, implement these practices:

1. **Always hash passwords** before saving (using the pre-save hook)
2. **Use bcrypt or Argon2** for password hashing, never plain text
3. **Remove passwords** from all API responses
4. **Log securely** - never log passwords or sensitive data
5. **Use HTTPS** for all API communication
6. **Implement proper authentication** using JWT or sessions
7. **Add descriptive comments** about security-critical code
8. **Apply the principle of least privilege** in all APIs
9. **Rate limit authentication endpoints** to prevent brute force
10. **Use TypeScript's type system** to prevent security bugs

## 🚀 Congratulations!

You've successfully migrated your entire microservices architecture to TypeScript. This brings numerous benefits:

- **Type safety**: Catch errors at compile time instead of runtime
- **Better tooling**: Improved IDE support and code navigation
- **Code quality**: Self-documenting code with interfaces and types
- **Maintainability**: Easier refactoring and code navigation
- **Developer experience**: Better autocomplete and inline documentation
- **Security**: Type-safe handling of sensitive data
- **Modern JavaScript**: Access to latest ECMAScript features

Your application is now more robust, maintainable, and secure thanks to TypeScript's strong type system and modern development patterns.