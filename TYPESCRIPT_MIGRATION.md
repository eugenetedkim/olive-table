# Olive Table - Complete TypeScript Migration Guide

Welcome to the TypeScript migration guide for the Olive Table application. This comprehensive guide will walk you through the step-by-step process of converting a Node.js/Express microservices application from JavaScript to TypeScript.

## Why TypeScript?

TypeScript offers several advantages for backend development:

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Better Developer Experience**: Enhanced IDE support, autocompletion, and navigation
3. **Improved Documentation**: Types serve as built-in documentation
4. **Safer Refactoring**: Make changes with confidence that types will catch breaking changes
5. **Better Code Organization**: Interfaces, enums, and modules help structure your code

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

## Migration Guide Structure

This guide is organized into the following sections:

1. **Introduction & Migration Checklist** (this document)
   - Overview and project planning

2. **TypeScript Fundamentals & Best Practices**
   - Core TypeScript concepts 
   - Common pitfalls
   - Best practices for handling sensitive data

3. **Identity Service Migration - Part 1 (Setup & User Model)**
   - TypeScript configuration
   - Package.json scripts
   - User model migration with schema transforms

4. **Identity Service Migration - Part 2 (Controllers & Middleware)**
   - Parallel files approach
   - Middleware migration
   - Controller migration with type safety

5. **Identity Service Migration - Part 3 (Routes, Main App, Docker)**
   - Route migration
   - Main application setup
   - Docker configuration for TypeScript
   - Testing strategies

For the remaining services (Event Service, Invitation Service, and API Gateway), you'll follow a similar pattern, adapting the migration steps as needed for each service's specific requirements.

Let's begin by exploring TypeScript fundamentals and best practices, followed by the step-by-step migration process for each service.

# TypeScript Fundamentals & Best Practices

## 🔍 TypeScript Best Practices

Before starting the migration, let's review some TypeScript best practices that will help make your codebase more maintainable and robust:

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

## TypeScript Utility Types

TypeScript provides utility types that are extremely helpful when working with Mongoose data:

- **`Omit<Type, Keys>`**: Creates a type excluding specific properties
  ```typescript
  type UserWithoutPassword = Omit<IUser, 'password'>;
  ```

- **`Pick<Type, Keys>`**: Creates a type with only the properties you specify
  ```typescript
  type UserCredentials = Pick<IUser, 'email' | 'password'>;
  ```

- **`Partial<Type>`**: Makes all properties optional (useful for updates)
  ```typescript
  type UserUpdates = Partial<IUser>;
  ```

- **`Required<Type>`**: Makes all properties required
  ```typescript
  type RequiredUser = Required<UserUpdates>;
  ```

- **`ReadOnly<Type>`**: Makes all properties read-only
  ```typescript
  type ReadOnlyUser = Readonly<IUser>;
  ```

These utility types help create precise types without duplicating interfaces and work perfectly with Mongoose transformations.

## 🔄 Migration Strategy

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

This two-step approach gives you a clear migration path and provides a safety net during implementation.

# Identity Service Migration - Part 1 (Setup & User Model)

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

### 1.3.1 Understanding TypeScript Strict Mode and Sensitive Data

Our TypeScript configuration includes `strict: true`, which provides strong type safety but introduces challenges when handling API responses with sensitive data. 

#### The TypeScript Strict Mode Challenge:

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

#### The Solution: Schema-Level Transforms

The best practice for handling this in TypeScript + Mongoose is to implement password removal at the schema level using Mongoose's transform function:

1. **Schema-level transform**: Automatically remove password during serialization
2. **Type assertion**: Tell TypeScript about this with the `Omit` utility type

This approach ensures:
- **Security**: Password is always removed when serializing to JSON
- **Type safety**: TypeScript knows the password is gone
- **Consistency**: Implemented in one place, works everywhere

We'll implement this in the User model in the next section.

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

# Identity Service Migration - Part 2 (Controllers & Middleware)

## 2.1 Understanding the Parallel Files Approach

After successfully migrating the User model to TypeScript, we need to convert the rest of the components that interact with it. This section will guide you through migrating controllers and middleware while maintaining a functioning application during the transition process.

The most reliable way to migrate from JavaScript to TypeScript is using a parallel files approach, which offers several key benefits:

1. **Risk Reduction**: By keeping both versions functional during migration, you maintain a working system at all times
2. **Incremental Testing**: Each converted file can be tested individually 
3. **Easy Rollback**: If issues arise, you can revert to the JavaScript version instantly

Here's how the parallel files approach works:

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

## 2.2 Identify Files for Migration

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
- Routes that use User-related controllers (`users.js`, `auth.js`)
- Any other files that might depend on the User model

## 2.3 Create TypeScript Versions of Files

Based on your search, create parallel TypeScript versions for each file that needs migration:

```bash
# Create TypeScript versions alongside JavaScript files
touch services/identity-service/src/api/controllers/userController.ts
touch services/identity-service/src/api/controllers/authController.ts
touch services/identity-service/src/api/routes/users.ts
touch services/identity-service/src/api/routes/auth.ts
```

> **Important**: Do NOT modify the original JavaScript files to import from TypeScript files. Keep JS and TS files isolated from each other.

## 2.4 Migrate Auth Middleware

**Before vs After:**

```javascript
// 📄 src/api/middleware/auth.js (BEFORE)
const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

```typescript
// 📄 src/api/middleware/auth.ts (AFTER)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the user data structure (reusable)
interface User {
  userId: string;
  email: string;
}

// Define the complete JWT payload structure
interface JwtPayload {
  user: User;
}

// Extend Request to include our user property
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Invalid authorization format' });
      return;
    }

    const token = authHeader.substring(7);
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable not set');
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded.user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      console.error('Auth error:', error instanceof Error ? error.message : 'Unknown error');
      res.status(401).json({ message: 'Authentication failed' });
    }
  }
};
```

### What Changed & TypeScript Benefits

#### **Module System & Imports**

**JavaScript Approach:**
```javascript
const jwt = require('jsonwebtoken');
```

**TypeScript Approach:**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
```

**What's Improved:**
- **ES6 Module Syntax**: Modern import/export system instead of CommonJS
- **Type Imports**: Import Express types for middleware parameter validation
- **Better IDE Support**: TypeScript knows what methods and properties are available
- **Consistent Module System**: All imports use the same syntax pattern

#### **Type Safety & Interface Definitions**

**JavaScript Approach:**
- No explicit type definitions
- Relies on dynamic properties and runtime checking
- No compile-time guarantees about data structure

**TypeScript Approach:**
```typescript
interface User {
  userId: string;
  email: string;
}

interface JwtPayload {
  user: User;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
```

**What's Improved:**
- **Self-Documenting Code**: Interfaces clearly define expected data structures
- **Compile-Time Safety**: TypeScript catches type mismatches before runtime
- **Reusable Types**: Other files can import and use `AuthenticatedRequest`
- **Modern Naming**: No "I" prefix following current TypeScript conventions
- **Nested Structure**: JWT payload allows for extensibility (iat, exp, etc.)

#### **Function Signature & Export**

**JavaScript Approach:**
```javascript
exports.authMiddleware = (req, res, next) => {
```

**TypeScript Approach:**
```typescript
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
```

**What's Improved:**
- **ES6 Exports**: Consistent with modern JavaScript modules
- **Typed Parameters**: Each parameter has explicit type checking
- **Return Type Annotation**: `: void` makes function contract clear
- **Better Autocompletion**: IDE knows exactly what methods are available
- **Runtime Error Prevention**: TypeScript catches invalid parameter usage

#### **Token Extraction & Validation**

**JavaScript Approach:**
```javascript
const token = req.header('Authorization')?.replace('Bearer ', '');
if (!token) {
  return res.status(401).json({ message: 'No token, authorization denied' });
}
```

**TypeScript Approach:**
```typescript
const authHeader = req.headers.authorization;

if (!authHeader?.startsWith('Bearer ')) {
  res.status(401).json({ message: 'Invalid authorization format' });
  return;
}

const token = authHeader.substring(7);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('JWT_SECRET environment variable not set');
  res.status(500).json({ message: 'Server configuration error' });
  return;
}
```

**What's Improved:**
- **Explicit Validation**: Separate checks for header existence and format
- **Better Error Messages**: Specific feedback about what went wrong
- **Type Safety**: TypeScript knows `authHeader` is `string | undefined`
- **Optional Chaining**: Safe property access with `?.` operator
- **Configuration Validation**: Explicit check for JWT secret prevents runtime errors
- **More Performant**: `substring(7)` is more efficient than `replace()`
- **Clearer Intent**: Each step is explicit and self-documenting

#### **JWT Processing & Type Assertions**

**JavaScript Approach:**
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded.user;
```

**TypeScript Approach:**
```typescript
const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
req.user = decoded.user;
```

**What's Improved:**
- **Type Assertions**: Tell TypeScript the shape of decoded JWT data
- **Pre-validated Variables**: Use already-checked `jwtSecret` instead of `process.env`
- **Type-Safe Assignment**: Compiler ensures `decoded.user` matches `req.user` type
- **Structured Data**: Nested JWT payload allows for organized token structure
- **Prevent Property Errors**: TypeScript catches typos in property names

#### **Error Handling & Type Safety**

**JavaScript Approach:**
```javascript
catch (err) {
  res.status(401).json({ message: 'Token is not valid' });
}
```

**TypeScript Approach:**
```typescript
catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    res.status(401).json({ message: 'Token expired' });
  } else if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({ message: 'Invalid token' });
  } else {
    console.error('Auth error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(401).json({ message: 'Authentication failed' });
  }
}
```

**What's Improved:**
- **Specific Error Types**: Different handling for different JWT error conditions
- **Type Guards**: `instanceof` checks ensure type safety
- **Better User Experience**: More informative error messages
- **Type-Safe Logging**: Check if error is an Error object before accessing properties
- **Comprehensive Coverage**: Handle both known and unknown error types

### Real-World Usage Comparison

**JavaScript (Runtime Errors Possible):**
```javascript
app.get('/profile', authMiddleware, (req, res) => {
  // Could fail at runtime - no guarantee user exists
  const userId = req.user.id; // Typo: should be userId
  // No compile-time protection against property errors
});
```

**TypeScript (Compile-Time Safety):**
```typescript
app.get('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  // TypeScript forces null checking
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // TypeScript knows the exact property names
  const userId = req.user.userId; // Autocomplete and error checking
  // Would error on: req.user.id or req.user.userIdd
});
```

### Key Takeaways

1. **TypeScript Forces Better Practices**: Explicit validation, proper error handling, and clear interfaces
2. **Separation of Concerns**: Token extraction, validation, and processing are clearly separated
3. **Self-Documenting Code**: Interfaces serve as built-in documentation
4. **Compile-Time Safety**: Catch errors during development, not in production
5. **Better Developer Experience**: IDE support, autocompletion, and refactoring capabilities

## 2.5 Controller Migration Examples

**Before vs After:**

```javascript
// 📄 src/api/controllers/userController.js (BEFORE)
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

```typescript
// 📄 src/api/controllers/userController.ts (AFTER)
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
};
```

### What Changed & TypeScript Benefits

#### **Module System & Imports**

**JavaScript Approach:**
```javascript
const User = require('../../domain/models/User');
```

**TypeScript Approach:**
```typescript
import { Request, Response } from 'express';
import User, { IUser } from '../../domain/models/User';
import { AuthenticatedRequest } from '../middleware/auth';
```

**What's Improved:**
- **ES6 Module Syntax**: Modern import/export system instead of CommonJS
- **Type Imports**: Import Express types for controller parameter validation
- **Multiple Import Types**: Default import for User model, named import for IUser interface
- **Shared Type Imports**: Import `AuthenticatedRequest` from auth middleware (exported for reuse)
- **Better Tree Shaking**: ES6 modules enable better build optimization
- **IDE Integration**: TypeScript provides better autocompletion and refactoring

#### **Type Safety & Interface Definitions**

**JavaScript Approach:**
- No explicit type definitions for request bodies or parameters
- Relies on runtime checking and developer memory
- No compile-time guarantees about data structure

**TypeScript Approach:**
```typescript
// Import shared interface from auth middleware (exported for cross-service use)
import { AuthenticatedRequest } from '../middleware/auth';

// Controller-specific interface (not exported - only used in this file)
interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  dietaryPreferences?: string[];
  password?: string;
}
```

**What's Improved:**
- **Self-Documenting Code**: Interfaces clearly define expected request structure
- **Compile-Time Safety**: TypeScript catches type mismatches before runtime
- **Optional Properties**: `?` operator makes optional fields explicit
- **Array Typing**: `string[]` ensures dietary preferences are string arrays
- **Import Shared Types**: Reuse `AuthenticatedRequest` from auth middleware (already exported)
- **Controller-Specific Types**: Keep `UpdateProfileBody` internal since it's only used here

#### **Function Signature & Export**

**JavaScript Approach:**
```javascript
exports.getUserById = async (req, res) => {
```

**Natural Beginner Approach:**
```typescript
// What beginners naturally think to do (totally valid!):
interface GetUserByIdRequest extends Request {
  params: {
    id: string;
  };
}

export const getUserById = async (
  req: GetUserByIdRequest,
  res: Response
): Promise<void> => {
```

**Advanced Approach (after discovering Request is generic):**
```typescript
export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
```

**How You'd Discover the Generic Approach:**
- **IDE Hints**: When you hover over `Request` in VS Code, you'd see `Request<P, ResBody, ReqBody, ReqQuery, Locals>`
- **Documentation**: Express TypeScript docs mention the generic parameters
- **Code Examples**: Seeing other developers use `Request<{...}>` in tutorials/Stack Overflow
- **Type Definition Files**: Looking at `node_modules/@types/express/index.d.ts`
- **Trial and Error**: Trying different approaches until you find this pattern

**Why Both Approaches Work:**
- **Custom Interface**: More explicit, easier to understand for beginners
- **Generic Interface**: Less code, more flexible, industry standard

**What's Improved:**
- **ES6 Exports**: Modern `export const` instead of CommonJS `exports.` pattern
- **Route Parameter Typing**: Both approaches tell TypeScript that `req.params.id` is a string
  - **Request Interface Structure**: Express defines `Request<P, ResBody, ReqBody, ReqQuery, Locals>` with 5 object type slots
    - `P` = Route params object (like `{ id: string }`, `{ userId: number }`) → becomes `req.params`
    - `ResBody` = Response body object type (rarely used)
    - `ReqBody` = Request body object (like `{ name: string, email: string }`) → becomes `req.body`
    - `ReqQuery` = Query parameters object (like `{ page: number, limit: number }`) → becomes `req.query`
    - `Locals` = Response locals object (advanced usage)
  - **Generic Implementation**: Here's how the Request interface is actually defined:
    ```typescript
    interface Request<P = any, ResBody = any, ReqBody = any, ReqQuery = any, Locals = any> {
      params: P;           // ← Route parameters object
      body: ReqBody;       // ← Request body object  
      query: ReqQuery;     // ← Query string object
      // ... other Express properties (headers, cookies, etc.)
    }
    ```
  - **Template Filling**: `Request<{ id: string }>` fills the first object slot with `{ id: string }`, others use default `any` types
    ```typescript
    // When you write this:
    Request<{ id: string }>
    
    // TypeScript sees this:
    Request<{ id: string }, any, any, any, any>
    
    // Which creates this structure:
    {
      params: { id: string };    // ← Your specific type
      body: any;                 // ← Default type
      query: any;                // ← Default type  
      // ... other properties
    }
    ```
  - **Multiple Examples**:
    - `Request<{ id: string }>` 
      - Route: `/users/:id` → URL: `/users/123` → `req.params = { id: "123" }`
    - `Request<{ userId: number, postId: string }>` 
      - Route: `/users/:userId/posts/:postId` → URL: `/users/456/posts/abc` → `req.params = { userId: 456, postId: "abc" }`
    - `Request<{}, {}, { name: string }>` 
      - Route: `/users` → URL: `POST /users` + body → `req.body = { name: "John" }` (empty params object)
    - `Request<{}, {}, {}, { page: number }>` 
      - Route: `/users` → URL: `/users?page=1` → `req.query = { page: 1 }` (empty params/body objects)
  - **One Interface, Many Uses**: Instead of creating `UserRequest`, `PostRequest`, `ProductRequest` interfaces, one generic adapts
  - **Type Safety**: Accessing `req.params.name` when you defined `{ id: string }` causes TypeScript error
- **Parameter Type Safety**: Each parameter (`req`, `res`) has explicit type checking
- **Return Type Contract**: `Promise<void>` clearly states this function returns nothing but completes asynchronously
- **IDE Autocomplete**: TypeScript knows exactly what properties exist on `req.params`, `req.body`, etc.
- **Compile-Time Validation**: Typos like `req.params.idd` or accessing undefined properties caught before runtime

#### **Shared vs Local Type Usage**

**JavaScript Approach:**
```javascript
// Assumes req.user.id exists without checking or typing
const user = await User.findById(req.user.id);
```

**TypeScript Approach:**
```typescript
// Uses imported AuthenticatedRequest interface (shared across services)
export const updateProfile = async (
  req: AuthenticatedRequest & { body: UpdateProfileBody },
  res: Response
): Promise<void> => {
  // Type-safe access to shared user structure
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  
  const user = await User.findById(req.user.userId);
```

**What's Improved:**
- **Shared Interface Usage**: `AuthenticatedRequest` imported from auth middleware
- **Cross-Service Consistency**: Same user structure across all services
- **Intersection Types**: Combine shared auth type with local body type
- **Type-Safe Property Access**: `req.user?.userId` matches auth middleware structure
- **Consistent Null Checking**: Same pattern across all authenticated endpoints

#### **Authentication & Authorization Checks**

**JavaScript Approach:**
```javascript
// Assumes req.user.id exists without checking
const user = await User.findById(req.user.id);
```

**TypeScript Approach:**
```typescript
if (!req.user?.userId) {
  res.status(401).json({ message: 'Not authorized' });
  return;
}

const user = await User.findById(req.user.userId);
```

**What's Improved:**
- **Null Safety**: Optional chaining `req.user?.userId` prevents runtime errors
- **Explicit Auth Checks**: Early return pattern for unauthorized requests
- **Type-Safe Access**: TypeScript ensures safe property access
- **Clear Error Handling**: Specific error messages for auth failures
- **Runtime Protection**: Prevents accessing undefined properties
- **Consistent Property Names**: Uses `userId` to match auth middleware structure

#### **Control Flow & Early Returns**

**JavaScript Approach:**
```javascript
if (!user) {
  return res.status(404).json({ message: 'User not found' });
}
```

**TypeScript Approach:**
```typescript
if (!user) {
  res.status(404).json({ message: 'User not found' });
  return;
}
```

**What's Improved:**
- **Explicit Control Flow**: Separate response sending and function exit
- **Type Consistency**: Functions return `void` as declared, not Response objects
- **Better Debugging**: Easier to set breakpoints on response vs return
- **Function Contract**: Return type matches actual behavior

#### **Error Handling & Type Safety**

**JavaScript Approach:**
```javascript
catch (err) {
  res.status(500).json({ message: err.message });
}
```

**TypeScript Approach:**
```typescript
catch (error) {
  console.error('Error fetching user:', error instanceof Error ? error.message : String(error));
  res.status(500).json({ 
    message: error instanceof Error ? error.message : 'Server error occurred'
  });
}
```

**What's Improved:**
- **Type Guards**: `instanceof Error` checks ensure type safety
- **Detailed Logging**: More informative error messages with context
- **Fallback Handling**: Safe error message extraction with `String(error)`
- **Error Categorization**: Different handling for different error types
- **Type-Safe Property Access**: No assumptions about error object structure

#### **Data Transformation & Security**

**JavaScript Approach:**
```javascript
const userResponse = updatedUser.toObject();
delete userResponse.password;
res.json(userResponse);
```

**TypeScript Approach:**
```typescript
// Schema transform automatically removes password
const userResponse = updatedUser.toObject() as Omit<IUser, 'password'>;
res.json(userResponse);
```

**What's Improved:**
- **Type-Safe Transformations**: `Omit<IUser, 'password'>` tells TypeScript password is removed
- **Schema-Level Security**: Password removal handled at schema level (from knowledge pack)
- **No Manual Deletion**: Eliminates error-prone manual property deletion
- **Consistent Security**: Password removal is guaranteed across all responses
- **Better Type Inference**: TypeScript knows the exact shape of response object

### Real-World Cross-Service Usage

**Shared Authentication Interface:**
```typescript
// In auth.ts middleware (exported for reuse)
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// In userController.ts
import { AuthenticatedRequest } from '../middleware/auth';
export const updateProfile = async (req: AuthenticatedRequest & { body: UpdateProfileBody }, res: Response) => {
  // Uses shared interface structure
};

// In eventController.ts (future migration)
import { AuthenticatedRequest } from '../middleware/auth';
export const createEvent = async (req: AuthenticatedRequest & { body: CreateEventBody }, res: Response) => {
  // Same shared interface for consistency
};
```

**Controller-Specific Types (Not Exported):**
```typescript
// Each controller has its own specific body types
interface UpdateProfileBody { /* user-specific fields */ }
interface CreateEventBody { /* event-specific fields */ }
interface CreateInvitationBody { /* invitation-specific fields */ }
```

### Real-World Usage Comparison

**JavaScript (Runtime Errors Possible):**
```javascript
// Route handler - no type safety
app.get('/user/:id', getUserById);

// In controller
exports.getUserById = async (req, res) => {
  // Could fail at runtime
  const userId = req.params.userId; // Typo: should be 'id'
  const user = await User.findById(userId);
  // No compile-time protection against property errors
};
```

**TypeScript (Compile-Time Safety):**
```typescript
// Route handler with type safety
app.get('/user/:id', getUserById);

// In controller
export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  // TypeScript prevents typos
  const userId = req.params.id; // Autocomplete shows only 'id'
  const user = await User.findById(userId);
  // Would error on: req.params.userId or req.params.idd
};
```

**Authentication Usage:**
```javascript
// JavaScript - assumes req.user exists
app.patch('/profile', authMiddleware, updateProfile);

exports.updateProfile = async (req, res) => {
  // Runtime error if req.user is undefined
  const user = await User.findById(req.user.id);
};
```

```typescript
// TypeScript - uses shared authenticated request type
app.patch('/profile', authMiddleware, updateProfile);

export const updateProfile = async (
  req: AuthenticatedRequest & { body: UpdateProfileBody },
  res: Response
): Promise<void> => {
  // TypeScript forces null checking with shared interface
  if (!req.user?.userId) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  
  const user = await User.findById(req.user.userId); // Safe access
};
```

### Key Takeaways

1. **Strategic Type Sharing**: Only export interfaces that are actually reused (like `AuthenticatedRequest`)
2. **Controller-Specific Types**: Keep request body interfaces internal to their controllers
3. **Import Shared Types**: Reuse exported interfaces from auth middleware for consistency
4. **Cross-Service Consistency**: Same user structure and auth patterns across all services
5. **Type-Safe Property Access**: Consistent property names (`userId`) across shared interfaces
6. **Better Error Handling**: Type guards and specific error categorization improve debugging
7. **Secure by Design**: Type-safe data transformations eliminate security vulnerabilities
8. **Development Experience**: IDE support, autocompletion, and refactoring capabilities accelerate development

---

# 2.6 Auth Controller Migration

**Before vs After:**

```javascript
// 📄 src/api/controllers/authController.js (BEFORE)
const jwt = require('jsonwebtoken');
const User = require('../../domain/models/User');

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

    return res.status(201).json({
      message: 'User registered successfully. Please log in.'
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    res.status(500).json({ message: 'Server error occurred during registration' });
  }
};

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
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error occurred during login' });
  }
};
```

```typescript
// 📄 src/api/controllers/authController.ts (AFTER)
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../../domain/models/User';
import { AuthenticatedRequest } from '../middleware/auth';

// Module-level type guard for errors with numeric code
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
      lastName,
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
};

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
      console.error('MongoDB error in login:', error.code);
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
      console.error('MongoDB error in getMe:', error.code);
      res.status(500).json({ message: 'Database error occurred while retrieving user' });
      return;
    }
    
    console.error('GetMe error:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: 'Server error occurred while retrieving user' });
  }
};
```

## What Changed & TypeScript Benefits

### **Module System & Imports**

**JavaScript Approach:**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../../domain/models/User');
```

**TypeScript Approach:**
```typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../../domain/models/User';
import { AuthenticatedRequest } from '../middleware/auth';
```

**What's Improved:**
- **ES6 Module Syntax**: Modern import/export system instead of CommonJS
- **Type Imports**: Import Express types for parameter validation
- **Default Import**: JWT library imported as default export
- **Named Imports**: IUser interface imported alongside User model
- **Shared Type Import**: AuthenticatedRequest imported from auth middleware

### **Type Safety & Interface Definitions**

**JavaScript Approach:**
- No explicit type definitions for request bodies
- Relies on runtime validation and developer assumptions
- No compile-time guarantees about request structure

**TypeScript Approach:**
```typescript
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
```

**What's Improved:**
- **Self-Documenting Code**: Interfaces clearly define expected request structure
- **Required vs Optional**: All registration fields are required (no `?` operator)
- **Compile-Time Safety**: TypeScript catches missing or incorrect fields
- **Controller-Specific Types**: Kept internal since they're only used in auth controller
- **Consistent Structure**: Same pattern as other controllers for maintainability

### **JWT Secret Validation**

**JavaScript Approach:**
```javascript
jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, callback);
```

**TypeScript Approach:**
```typescript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('JWT_SECRET environment variable not set');
  res.status(500).json({ message: 'Server configuration error' });
  return;
}

jwt.sign(payload, jwtSecret, { expiresIn: '24h' }, callback);
```

**What's Improved:**
- **Configuration Validation**: Explicit check for JWT secret before use
- **Early Error Detection**: Fails fast if environment is misconfigured
- **Better Error Messages**: Specific error for missing JWT secret
- **Type Safety**: Ensures jwt.sign receives a string, not undefined
- **Production Safety**: Prevents runtime errors in deployed environments

### **Callback Function Typing**

**JavaScript Approach:**
```javascript
jwt.sign(payload, secret, options, (err, token) => {
  if (err) throw err;
  res.json({ token, user: {...} });
});
```

**TypeScript Approach:**
```typescript
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
    res.json({ token, user: userResponse });
  }
);
```

**What's Improved:**
- **Typed Parameters**: Callback parameters have explicit types
- **Optional Token**: `token?: string` reflects that token might be undefined on error
- **Error Handling**: No throwing errors, proper error responses instead
- **Type-Safe Responses**: Ensures consistent error response structure

### **Error Code Handling & Module-Level Type Guards**

**JavaScript Approach:**
```javascript
catch (err) {
  if (err.code === 11000) {
    return res.status(400).json({ message: 'User already exists' });
  }
  res.status(500).json({ message: 'Server error' });
}
```

**TypeScript Approach:**
```typescript
// Module-level type guard for reusable error detection
const hasErrorCode = (err: unknown): err is { code: number } => {
  return typeof err === 'object' &&
         err !== null &&
         'code' in err &&
         typeof err.code === 'number';
};

catch (error) {
  if (error instanceof Error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
  }
  
  // Improved error detection with type guard
  if (hasErrorCode(error) && error.code === 11000) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }
  
  res.status(500).json({ message: 'Server error occurred' });
}
```

**What's Improved:**
- **Type Guards**: Runtime verification ensures actual type safety
- **Code Reusability**: Define once at module level, use across all functions
- **Improved Organization**: Infrastructure logic (error detection) centralized at module level
- **No Type Assertions**: Avoid false confidence from `as` keyword with runtime verification
- **Validation Error Handling**: Specific handling for Mongoose validation errors
- **Consistent Error Detection**: Same MongoDB error checking logic everywhere
- **Performance**: Type guard function created once, not per request

### **Understanding the Type Guard**

The `hasErrorCode` function does two things:

**1. At Runtime (what actually happens):**
- Returns `true` if the error has a numeric `code` property
- Returns `false` if the error doesn't have a numeric `code` property
- It's just a boolean function that checks the error structure

**2. At Compile-Time (TypeScript magic):**
The `err is { code: number }` part is called a **type predicate**. It tells TypeScript:
*"If this function returns `true`, then treat the parameter as having type `{ code: number }`"*

```typescript
// Before the check:
catch (error) {  // error: unknown (could be anything)
  
  if (hasErrorCode(error)) {
    // Inside this block: TypeScript now knows error has .code property
    console.log(error.code);  // ✅ No TypeScript errors!
    
    if (error.code === 11000) {  // ✅ TypeScript knows .code exists
      // Handle MongoDB duplicate key error
    }
  }
  
  // Outside the if block: error is still unknown
  console.log(error.code);  // ❌ TypeScript error: code doesn't exist on unknown
}

### **User Response Security**

**JavaScript Approach:**
```javascript
res.json({
  token,
  user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  }
});
```

**TypeScript Approach:**
```typescript
const userResponse = user.toObject() as Omit<IUser, 'password'>;

res.json({
  token,
  user: userResponse
});
```

**What's Improved:**
- **Schema-Level Security**: Password automatically removed by schema transform
- **Type-Safe Omission**: `Omit<IUser, 'password'>` ensures password is excluded
- **Consistent Security**: Same security pattern across all user responses
- **No Manual Field Selection**: Reduces risk of accidentally exposing sensitive data
- **Better Maintainability**: Adding new fields doesn't require updating response code

## Understanding Separation of Concerns in Error Handling

### **What Are the Two Concerns?**

**1. Infrastructure Concern: "How do I detect a MongoDB error?"**
This is **technical/infrastructure logic** - it deals with:
- What does a MongoDB error look like?
- What properties should I check?
- How do I verify it's actually a MongoDB error?

**2. Business Concern: "What should I do about this error in my specific use case?"**
This is **business/domain logic** - it deals with:
- What does this error mean for user registration?
- What response should I send to the client?
- How does this affect my application's workflow?

### **The Problem: Mixed Concerns**

**❌ Bad Approach - Infrastructure mixed with Business:**
```typescript
export const register = async (req, res) => {
  try {
    // ... registration logic
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
        return;
      }
      
      // 🔴 MIXED CONCERNS: Infrastructure logic embedded in business function
      const mongoError = error as { code?: number };  // Type assertion
      if (mongoError.code === 11000) {
        //   ^^^^^^^^^^^^^^^^^^^^
        //   INFRASTRUCTURE: MongoDB-specific error detection
        res.status(400).json({ message: 'User already exists' });
        //                               ^^^^^^^^^^^^^^^^^^^^
        //                               BUSINESS: Registration-specific response
        return;
      }
      
      console.error('Registration error:', error.message);
    }
    
    res.status(500).json({ message: 'Server error occurred during registration' });
  }
};

export const login = async (req, res) => {
  try {
    // ... login logic
  } catch (error) {
    // 🔴 PROBLEM: Same infrastructure logic repeated, different business context
    if (error instanceof Error) {
      const mongoError = error as { code?: number };  // Duplicated type assertion
      if (mongoError.code === 11000) {
        //   ^^^^^^^^^^^^^^^^^^^^
        //   DUPLICATE INFRASTRUCTURE LOGIC
        res.status(500).json({ message: 'Database error occurred' });
        //                               ^^^^^^^^^^^^^^^^^^^^^^^^^
        //                               DIFFERENT BUSINESS RESPONSE
        return;
      }
    }
    
    console.error('Login error:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ message: 'Server error occurred during login' });
  }
};
```

**Problems:**
- **Infrastructure logic** (MongoDB error detection) is **embedded** inside business functions
- **Type assertions** (`error as { code?: number }`) are **scattered** throughout catch blocks
- **MongoDB error checking** is **mixed** with validation error handling
- **Same infrastructure code** is **duplicated** with **different business responses**
- **Error detection logic** is **structurally wrong** (MongoDB errors inside `instanceof Error`)
- **Hard to maintain**: Change MongoDB error detection = update multiple functions

### **The Solution: Separated Concerns**

**✅ Good Approach - Clean Separation:**
```typescript
// 🟢 INFRASTRUCTURE LAYER: Pure technical concern
const hasErrorCode = (err: unknown): err is { code: number } => {
  return typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'number';
};
//     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//     SINGLE RESPONSIBILITY: Only cares about "errors with numeric codes"
//     Doesn't know or care what you do with this information

// 🟢 BUSINESS LAYER: Pure domain/application logic
export const register = async (req, res) => {
  try {
    // ... clean registration business logic
  } catch (error) {
    if (hasErrorCode(error) && error.code === 11000) {
      //  ^^^^^^^^^^^^^^^         ^^^^^^^^^^^^^^^
      //  Infrastructure          Business interpretation
      //  (detection)             (what 11000 means for registration)
      res.status(400).json({ message: 'User already exists' });
      //                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      //                     Pure business response
    }
  }
};

export const updateProfile = async (req, res) => {
  try {
    // ... clean update business logic  
  } catch (error) {
    if (hasErrorCode(error) && error.code === 11000) {
      //  ^^^^^^^^^^^^^^^         ^^^^^^^^^^^^^^^
      //  Same infrastructure     Different business interpretation
      res.status(400).json({ message: 'Profile data conflicts' });
      //                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      //                     Different business context
    }
  }
};
```

### **Benefits of Separation**

**1. Single Responsibility**
```typescript
// Infrastructure function has ONE job: detect errors with numeric codes
const hasErrorCode = (err: unknown): err is { code: number } => {
  // Doesn't care what you do with the result
  // Just answers: "Does this error have a numeric code? Yes/No"
};

// Business function has ONE job: handle registration workflow  
export const register = async (req, res) => {
  // Doesn't care HOW errors are detected
  // Just knows: "If MongoDB duplicate error, then user exists"
};
```

**2. Independent Evolution**
```typescript
// If MongoDB changes error format, only update infrastructure
const hasErrorCode = (err: unknown): err is { code: number; name: string } => {
  return typeof err === 'object' && 
         'code' in err && 
         typeof err.code === 'number' &&
         'name' in err && 
         err.name === 'MongoError'; // NEW REQUIREMENT
};

// ✅ Business logic unchanged - abstraction protects it
export const register = async (req, res) => {
  // No changes needed - still works!
  if (hasErrorCode(error) && error.code === 11000) {
    res.status(400).json({ message: 'User already exists' });
  }
};
```

**3. Code Reusability**
```typescript
// One infrastructure function serves many business contexts
const hasErrorCode = /* ... */; // Defined once

// Used in different business scenarios
export const register = /* uses hasErrorCode for registration context */;
export const login = /* uses hasErrorCode for authentication context */;  
export const updateProfile = /* uses hasErrorCode for update context */;
export const deleteUser = /* uses hasErrorCode for deletion context */;
```

### **Real-World Analogy**

Think of it like a **car dashboard**:

**❌ Mixed Concerns (Bad):**
```
Every time you want to know your speed, you have to:
1. Open the hood
2. Check the engine RPM
3. Calculate gear ratios  
4. Convert to miles per hour
5. Then decide if you're speeding
```

**✅ Separated Concerns (Good):**
```
Infrastructure: Speedometer (detects speed)
Business Logic: Driver (interprets what speed means)

1. Speedometer: "Current speed is 80 mph"
2. Driver: "80 mph in a 65 zone means I'm speeding, slow down"
```

The **speedometer** doesn't care what you do with the speed information - it just accurately reports it. The **driver** doesn't care how speed is calculated - they just know what different speeds mean for their driving decisions.

**That's separation of concerns!**

## Key Takeaways for Auth Controllers

1. **Environment Validation**: Always validate critical environment variables before use
2. **JWT Error Handling**: Handle JWT signing errors gracefully, don't throw
3. **Module-Level Type Guards**: Define reusable type guards at module level for consistent error handling
4. **MongoDB Error Types**: Use type guards instead of type assertions for database-specific error properties
5. **Callback Typing**: Type JWT callback parameters for better error handling
6. **Consistent Security**: Use schema transforms for automatic password removal
7. **Configuration Safety**: Fail fast on missing critical configuration
8. **Type-Safe Responses**: Ensure all response paths have consistent structure
9. **Separation of Concerns**: Keep infrastructure logic (error detection) separate from business logic
10. **Code Reusability**: Define utility functions at module level to avoid duplication

## 3.1 Migrate Routes

Route files tend to be simpler since they mostly define paths and connect them to controller methods. Let's see how to convert them to TypeScript.

### Users Route Migration

#### JavaScript File (Original - Remains Unchanged)
```javascript
// File path: services/identity-service/src/api/routes/users.js

const express = require('express');                                       // [1]

const router = express.Router();                                          // [2]

const { updateProfile, getUserById } = require('../controllers/userController'); // [3]

const { authMiddleware } = require('../middleware/auth');                 // [4]

router.get('/:id', getUserById);                                          // [5]

router.put('/profile', authMiddleware, updateProfile);                    // [6]

module.exports = router;                                                  // [7]
```

#### TypeScript File (New)
```typescript
// File path: services/identity-service/src/api/routes/users.ts

import { Router } from 'express';                                         // [1]
import { updateProfile, getUserById } from '../controllers/userController'; // [2]
import { authMiddleware } from '../middleware/auth';                      // [3]

const router = Router();                                                  // [4]

// Public routes
router.get('/:id', getUserById);                                          // [5]

// Protected routes
router.put('/profile', authMiddleware, updateProfile);                    // [6]

export default router;                                                    // [7]
```

#### What Changed & TypeScript Syntax Explained:

**[1] Import Statements:**
- JavaScript: `const express = require('express');`
- TypeScript: `import { Router } from 'express';`
- **What changed**:
  - ES6 named import syntax replaces CommonJS require
  - More selective importing - only Router instead of the whole express module
  - TypeScript provides compile-time verification of imports

**[2-3] Controller and Middleware Imports:**
- JavaScript: 
  - `const { updateProfile, getUserById } = require('../controllers/userController');`
  - `const { authMiddleware } = require('../middleware/auth');`
- TypeScript: 
  - `import { updateProfile, getUserById } from '../controllers/userController';`
  - `import { authMiddleware } from '../middleware/auth';`
- **What improved**:
  - ES6 import syntax is more consistent with modern JavaScript
  - TypeScript validates these named exports exist in the imported modules
  - IDE can provide better navigation and refactoring support

**[4] Router Creation:**
- JavaScript: `const router = express.Router();`
- TypeScript: `const router = Router();`
- **What changed**:
  - Direct use of imported Router class
  - TypeScript infers the correct type automatically
  - All Express route methods are properly typed

**[5-6] Route Definitions:**
- JavaScript and TypeScript syntax is nearly identical
- **What's better in TypeScript**:
  - Route handlers are type-checked against Express middleware signature
  - TypeScript ensures controllers match the expected `(req, res, next?)` pattern
  - Path parameters (like `:id`) are available with type safety when used correctly

**[7] Module Export:**
- JavaScript: `module.exports = router;`
- TypeScript: `export default router;`
- **What changed**:
  - ES6 default export syntax replaces CommonJS module.exports
  - More consistent with modern JavaScript module patterns
  - Importing modules will use `import usersRoutes from './api/routes/users';`

### Auth Route Migration

#### JavaScript File (Original - Remains Unchanged)
```javascript
// File path: services/identity-service/src/api/routes/auth.js

const express = require('express');                                    // [1]

const router = express.Router();                                       // [2]

const { register, login, getMe } = require('../controllers/authController'); // [3]

const { authMiddleware } = require('../middleware/auth');              // [4]

router.post('/register', register);                                    // [5]

router.post('/login', login);                                          // [6]

router.get('/me', authMiddleware, getMe);                              // [7]

module.exports = router;                                               // [8]
```

#### TypeScript File (New)
```typescript
// File path: services/identity-service/src/api/routes/auth.ts

import { Router } from 'express';                                      // [1]
import { register, login, getMe } from '../controllers/authController'; // [2]
import { authMiddleware } from '../middleware/auth';                   // [3]

const router = Router();                                               // [4]

// Public routes
router.post('/register', register);                                    // [5]
router.post('/login', login);                                          // [6]

// Protected routes
router.get('/me', authMiddleware, getMe);                              // [7]

export default router;                                                 // [8]
```

#### What Changed & TypeScript Syntax Explained:

**[1] Import Statements:**
- JavaScript: `const express = require('express');`
- TypeScript: `import { Router } from 'express';`
- **What changed**:
  - ES6 named import syntax replaces CommonJS require
  - Only imports what's needed (Router) instead of whole express module
  - More efficient and allows for better tree-shaking

**[2-3] Controller and Middleware Imports:**
- JavaScript: 
  - `const { register, login, getMe } = require('../controllers/authController');`
  - `const { authMiddleware } = require('../middleware/auth');`
- TypeScript: 
  - `import { register, login, getMe } from '../controllers/authController';`
  - `import { authMiddleware } from '../middleware/auth';`
- **What improved**:
  - ES6 import syntax
  - TypeScript provides compile-time verification that these imports exist
  - IDE provides better autocompletion and navigation

**[4] Router Creation:**
- JavaScript: `const router = express.Router();`
- TypeScript: `const router = Router();`
- **What changed**:
  - Direct use of imported Router class
  - Type information is inferred automatically by TypeScript
  - The router is properly typed with Express's route methods

**[5-7] Route Definitions:**
- Nearly identical in both versions
- **What's improved in TypeScript**:
  - TypeScript validates that handlers have compatible signatures with Express middleware
  - Ensures controller functions match `(req: Request, res: Response, next?: NextFunction) => void`
  - Prevents type errors in route handlers

**[8] Module Export:**
- JavaScript: `module.exports = router;`
- TypeScript: `export default router;`
- **What changed**:
  - ES6 default export syntax replaces CommonJS module.exports
  - More consistent with modern JavaScript
  - Better TypeScript module support and import/export tracking
  - Other files will import with `import authRoutes from './api/routes/auth';`

## 3.2 Migrate Main Application

Now let's migrate the main application file that brings everything together.

#### JavaScript File (Original - Remains Unchanged)
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

#### TypeScript File (New)
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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {  // [19]
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

#### What Changed & TypeScript Syntax Explained:

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
  - Unused parameter prefixed with underscore to avoid linting warnings

**[19] Error Handler:**
- JavaScript: `app.use((err, req, res, next) => {`
- TypeScript: `app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {`
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

## 3.3 Update Dockerfile for TypeScript

Now let's update the Dockerfile to properly build and run the TypeScript application:

#### Before (JavaScript):
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]
```

#### After (TypeScript):
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

#### What Changed & Dockerfile Syntax Explained:

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

#### Benefits of Multi-stage Docker:
- **Smaller Image**: Production image ~50% smaller
- **Security**: No dev tools in production
- **Build Isolation**: Build errors don't affect production
- **CI/CD Friendly**: Separate build & run stages

## 3.4 File Transition Strategy

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

## 3.5 Development and Production Workflows

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

## 3.6 Testing the Service

### Unit Testing with Jest

Configure Jest for TypeScript in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
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

### Manual Testing

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