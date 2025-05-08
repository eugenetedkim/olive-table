# Olive Table - Complete TypeScript Migration Guide

## 📋 Migration Checklist

Use this checklist to track your progress across all services:

### Prerequisites
- [ ] Create git baseline tag `v1.0.0-docker-baseline`
- [ ] Verify Docker setup works with all services
- [ ] Ensure all tests pass before starting migration

### Identity Service
- [ ] Create TypeScript config
- [ ] Update package.json scripts
- [ ] Install TypeScript dependencies
- [ ] Migrate User model
- [ ] Update User model imports in other files
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

### 1.5 Next Steps After User Model Migration

After successfully migrating the User model to TypeScript, follow these steps to complete the migration of related components:

#### 1. Identify Files Referencing User Model

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

#### 2. Update Import References

For each file that imports the User model, update the import syntax:

```javascript
// Old (CommonJS)
const User = require('../../domain/models/User');

// New (ES Modules)
import User, { IUser } from '../../domain/models/User';
```

The key files to update first in your project are:
- `services/identity-service/src/api/controllers/userController.js`
- `services/identity-service/src/api/controllers/authController.js`

**Why Update Imports Before Creating TypeScript Files?**

This two-phase approach (updating imports first, then creating TypeScript files) might seem redundant, but it serves several important purposes:

1. **Risk Mitigation**: By updating only the imports first, you validate that your TypeScript model works with existing JavaScript code before investing time in converting everything else.

2. **Incremental Testing**: You can test each small change independently. If updating an import breaks something, you know exactly where to look without having changed the entire codebase.

3. **Operational Continuity**: In a microservice architecture, services need to remain functional during migration. This approach ensures the system works throughout the process.

4. **Easier Debugging**: If there are issues, it's much simpler to troubleshoot when only one aspect has changed at a time.

5. **Team Collaboration**: Multiple team members can work on different aspects of the migration simultaneously with clearer boundaries.

While it does require an extra step, this methodical approach significantly reduces the risk of introducing breaking changes and makes the migration process more manageable.

#### 3. Test Your Changes After Import Updates

After replacing the JavaScript User model with a TypeScript version and updating the imports in related files, it's crucial to test the entire system. This step validates that the TypeScript model correctly integrates with the remaining JavaScript files and that the application as a whole continues to function properly, even though we've only changed the model file and its imports.

Testing at this point is important because:
1. It validates that your TypeScript implementation of the User model is functionally equivalent to the JavaScript version
2. It confirms that the import changes are working correctly before investing time in migrating more files
3. It provides early detection of any type compatibility issues between TypeScript and JavaScript files
4. It ensures the critical authentication functionality (which depends on the User model) remains intact

##### 3.1 Set Up the Docker Environment for Testing

Before running the test commands, you need to get the Docker environment up and running with all services:

```bash
# Start Docker Desktop application first
# Docker Desktop initializes the Docker Engine, virtualization layer, 
# networking, and other components needed for container orchestration

# Once Docker Desktop is fully loaded (you may see Kubernetes starting as well):

# Navigate to your project root directory
cd path/to/olive-table

# Build all services
docker compose build

# Start the containers
docker compose up

# Alternatively, you can build and start in one command
docker compose up --build

# If you want to run in detached mode (background)
docker compose up -d
```

Wait for all services to start up. You should see console output indicating:
- MongoDB connection established
- Identity service running on port 3001
- Event service running on port 3002
- Invitation service running on port 3003
- API Gateway running on port 3000

Verify that all services are running:
```bash
# Check status of all containers
docker compose ps
```

##### 3.2 Run End-to-End Tests

Test the entire user flow to ensure your import updates work correctly. You can use either curl commands (command line) or Postman (GUI) for testing.

**Testing sequence:**
- Register a user (test User model and auth controller)
- Log in (test authentication and JWT token generation)
- Create an event (test Event model and protected routes)
- Send an invitation (test Invitation model and cross-service communication)
- Respond to an invitation (test update operations)

This end-to-end testing approach validates that:
- TypeScript models correctly integrate with JavaScript files
- Authentication flows properly across services
- Cross-service communication functions as expected
- API routes are properly configured
- Both read and write database operations work

### Option 1: Testing with curl commands

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use the token from login response for subsequent requests
# TOKEN=<token from login response>
# USER_ID=<user_id from login response>

# Create an event
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Event","description":"Testing","date":"2023-12-01","startTime":"18:00","endTime":"20:00","location":"Test Location"}'

# Store the event ID from the response
# EVENT_ID=<event_id from create event response>

# Send an invitation
curl -X POST http://localhost:3000/api/invitations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"'$EVENT_ID'","inviteeId":"another-user-id","inviterId":"'$USER_ID'"}'

# To test invitation responses (simulating the invitee):
# Register another user to be the invitee
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invitee@example.com","password":"password123","firstName":"Invitee","lastName":"User"}'

# Login as invitee
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invitee@example.com","password":"password123"}'

# Get invitee token
# INVITEE_TOKEN=<token from invitee login response>

# Get invitations for the invitee
curl -X GET http://localhost:3000/api/invitations \
  -H "Authorization: Bearer $INVITEE_TOKEN"

# Respond to the invitation (accept)
# INVITATION_ID=<invitation_id from get invitations response>
curl -X PATCH http://localhost:3000/api/invitations/$INVITATION_ID \
  -H "Authorization: Bearer $INVITEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'
```

### Option 2: Testing with Postman

1. **Setup Postman:**
   - Download and install [Postman](https://www.postman.com/downloads/)
   - Create a new Collection (e.g., "TypeScript Migration Tests")
   - Set up environment variables to store values like tokens

2. **Create requests in sequence:**

   **Register User**
   - Method: POST
   - URL: http://localhost:3000/api/auth/register
   - Headers: Content-Type: application/json
   - Body (raw/JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123",
       "firstName": "Test",
       "lastName": "User"
     }
     ```

   **Login**
   - Method: POST
   - URL: http://localhost:3000/api/auth/login
   - Headers: Content-Type: application/json
   - Body (raw/JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Test Script: Save token to environment variable:
     ```javascript
     pm.environment.set("token", pm.response.json().token);
     pm.environment.set("userId", pm.response.json().user.id);
     ```

   **Create Event**
   - Method: POST
   - URL: http://localhost:3000/api/events
   - Headers: 
     - Content-Type: application/json
     - Authorization: Bearer {{token}}
   - Body (raw/JSON):
     ```json
     {
       "title": "Test Event",
       "description": "Testing",
       "date": "2023-12-01",
       "startTime": "18:00",
       "endTime": "20:00",
       "location": "Test Location"
     }
     ```
   - Test Script: Save event ID to environment variable:
     ```javascript
     pm.environment.set("eventId", pm.response.json()._id);
     ```

   **Send Invitation**
   - Method: POST
   - URL: http://localhost:3000/api/invitations
   - Headers: 
     - Content-Type: application/json
     - Authorization: Bearer {{token}}
   - Body (raw/JSON):
     ```json
     {
       "eventId": "{{eventId}}",
       "inviteeId": "another-user-id",
       "inviterId": "{{userId}}"
     }
     ```

   **Register Invitee**
   - Method: POST
   - URL: http://localhost:3000/api/auth/register
   - Headers: Content-Type: application/json
   - Body (raw/JSON):
     ```json
     {
       "email": "invitee@example.com",
       "password": "password123",
       "firstName": "Invitee", 
       "lastName": "User"
     }
     ```

   **Login as Invitee**
   - Method: POST
   - URL: http://localhost:3000/api/auth/login
   - Headers: Content-Type: application/json
   - Body (raw/JSON):
     ```json
     {
       "email": "invitee@example.com",
       "password": "password123"
     }
     ```
   - Test Script: Save invitee token to environment variable:
     ```javascript
     pm.environment.set("inviteeToken", pm.response.json().token);
     ```

   **Get Invitations for Invitee**
   - Method: GET
   - URL: http://localhost:3000/api/invitations
   - Headers: Authorization: Bearer {{inviteeToken}}
   - Test Script: Save invitation ID to environment variable:
     ```javascript
     pm.environment.set("invitationId", pm.response.json()[0]._id);
     ```

   **Respond to Invitation**
   - Method: PATCH
   - URL: http://localhost:3000/api/invitations/{{invitationId}}
   - Headers: 
     - Content-Type: application/json
     - Authorization: Bearer {{inviteeToken}}
   - Body (raw/JSON):
     ```json
     {
       "status": "accepted"
     }
     ```

3. **Run the collection** in sequence to test the entire workflow

Postman's environment variables make it easy to pass data between requests, and you can add tests to verify response status codes and content.

If any issues arise during testing, the two-phase approach makes it easier to identify and fix problems without affecting the entire codebase.

##### 3.3 Troubleshooting Docker Issues

If you encounter problems with the Docker environment:

```bash
# View logs from all containers
docker compose logs

# View logs from a specific service
docker compose logs identity-service

# Restart a specific service
docker compose restart identity-service

# Tear down and rebuild everything
docker compose down
docker compose up --build
```

Common issues and solutions:
- **MongoDB connection errors**: Check that the MongoDB container is running and healthy
- **Service not starting**: Check the logs for that specific service
- **API Gateway can't connect to services**: Ensure all service containers are running
- **Port conflicts**: Make sure no other applications are using the configured ports

After confirming that all services are working properly with your updated import references, you can proceed to the next phase of migration.

#### 4. Migrate Dependent Files

After updating imports and testing, migrate files that directly interact with the User model:

1. **User-related controllers** - These will need updating to use TypeScript interfaces and types
2. **Authentication middleware** - Often heavily dependent on the User model
3. **User services** - Any files containing business logic for users

For each file:
- Create a parallel TypeScript (.ts) file
- Implement proper interfaces for parameters and return types
- Add type annotations for variables
- Convert to ES module syntax

Example for creating TypeScript versions:

```bash
# Create TypeScript versions alongside JavaScript files
touch services/identity-service/src/api/controllers/userController.ts
touch services/identity-service/src/api/controllers/authController.ts
touch services/identity-service/src/api/routes/users.ts
```

### Controller Migration Example:

**Before (JavaScript):**
```javascript
// 📄 src/api/controllers/authController.js
const jwt = require('jsonwebtoken');                              // [1]
const User = require('../../domain/models/User');                 // [2]

exports.login = async (req, res) => {                            // [3]
  try {
    const { email, password } = req.body;                        // [4]
    
    const user = await User.findOne({ email });                  // [5]
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await user.matchPassword(password);          // [6]
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(                                      // [7]
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({                                                   // [8]
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('Login error:', err);                          // [9]
    res.status(500).json({ message: 'Server error' });
  }
};
```

**After (TypeScript):**
```typescript
// 📄 src/api/controllers/authController.ts
import { Request, Response } from 'express';                              // [1]
import jwt from 'jsonwebtoken';                                           // [2]
import User, { IUser } from '../../domain/models/User';                  // [3]

interface LoginBody {                                                    // [4]
  email: string;
  password: string;
}

export const login = async (                                             // [5]
  req: Request<{}, {}, LoginBody>,                                      // [6]
  res: Response                                                         // [7]
): Promise<void> => {                                                    // [8]
  try {
    const { email, password } = req.body;                               // [9]
    
    const user = await User.findOne({ email });                         // [10]
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;                                                           // [11]
    }
    
    const isMatch = await user.matchPassword(password);                 // [12]
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;                                                           // [13]
    }
    
    const token = jwt.sign(                                             // [14]
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET!,                                         // [15]
      { expiresIn: '1h' }
    );
    
    res.json({                                                          // [16]
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {                                                     // [17]
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**What Changed & TypeScript Syntax Explained:**

**[1-3] Import Statements:**
- JavaScript: `const jwt = require('jsonwebtoken');`
- TypeScript: 
  ```typescript
  import { Request, Response } from 'express';
  import jwt from 'jsonwebtoken';
  import User, { IUser } from '../../domain/models/User';
  ```
- **What's improved**: 
  - ES module syntax
  - Express types (Request, Response) imported
  - TypeScript interface IUser imported from User model

**[4] Request Type Interface:**
- New in TypeScript: `interface LoginBody { email: string; password: string; }`
- **What it means**:
  - Defines the expected structure of login request body
  - Provides type safety for request data
  - Improves code documentation

**[5-8] Function Declaration:**
- JavaScript: `exports.login = async (req, res) => {`
- TypeScript: 
  ```typescript
  export const login = async (
    req: Request<{}, {}, LoginBody>,
    res: Response
  ): Promise<void> => {
  ```
- **What's improved**:
  - ES module export syntax
  - Generic Request type with params, response body, request body
  - Return type specified as Promise<void>

**[9-10] Request Handling:**
- Same logic but with TypeScript-verified types
- **What's checked**:
  - `email` and `password` are confirmed to be strings
  - TypeScript knows `User.findOne()` returns Promise<IUser | null>

**[11, 13] Early Returns:**
- JavaScript: `return res.status(401)...`
- TypeScript: 
  ```typescript
  res.status(401)...
  return;
  ```
- **What's improved**:
  - Better style for void functions (send response, then return)
  - TypeScript understands the control flow

**[15] Non-null Assertion:**
- New in TypeScript: `process.env.JWT_SECRET!`
- **What it means**:
  - The `!` tells TypeScript to trust that JWT_SECRET exists
  - Avoids TypeScript error about potentially undefined value
  - Better alternative would be environment variable validation

**[17] Error Handling:**
- JavaScript: `catch (err)`
- TypeScript: `catch (error)`
- **What's improved**:
  - More consistent naming (error vs err)
  - TypeScript understands error object type

### Step-by-Step Migration Process

Here's the detailed process for migrating a controller file:

1. **Update import in the JavaScript file first**:
   ```javascript
   // Old
   const User = require('../../domain/models/User');
   
   // New - update this FIRST while keeping the file as .js
   const User = require('../../domain/models/User.ts'); 
   ```

2. **Test that the application still works** with the updated import

3. **Create the parallel TypeScript file**:
   ```bash
   # Create the TypeScript file alongside the JavaScript file
   touch src/api/controllers/authController.ts
   ```

4. **Implement the TypeScript version** with proper types and ES module syntax

5. **Update the import in other files that use the controller**:
   ```javascript
   // In routes file (e.g., src/api/routes/auth.js)
   // Old
   const { login } = require('../controllers/authController');
   
   // New
   import { login } from '../controllers/authController';
   ```

6. **Test thoroughly** to ensure both versions work correctly

7. **Remove the JavaScript file** once all imports are updated and tests pass:
   ```bash
   git rm src/api/controllers/authController.js
   ```

### Migration Best Practices for Controllers

When migrating controller files:

1. **Define request/response interfaces**:
   ```typescript
   interface CreateUserRequest {
     email: string;
     password: string;
     firstName: string;
     lastName: string;
   }
   
   interface UserResponse {
     id: string;
     email: string;
     firstName: string;
     lastName: string;
   }
   ```

2. **Use Express Generic Types**:
   ```typescript
   // Request<Params, ResBody, ReqBody, Query>
   req: Request<{}, UserResponse, CreateUserRequest, {}>
   ```

3. **Return Promise<void> for async controllers**:
   ```typescript
   async function controllerFunction(req: Request, res: Response): Promise<void> {
     // Implementation
   }
   ```

4. **Handle authentication properly**:
   ```typescript
   // Define a custom request with user property
   interface AuthRequest extends Request {
     user?: {
       userId: string;
       email: string;
     };
   }
   
   // Use this type in protected routes
   function protectedRoute(req: AuthRequest, res: Response): void {
     if (!req.user) {
       res.status(401).json({ message: 'Unauthorized' });
       return;
     }
     
     // Access user data safely
     const { userId } = req.user;
   }
   ```

#### 5. Remove JavaScript Version

Once you've confirmed everything works:
```bash
git rm services/identity-service/src/domain/models/User.js
git commit -m "chore(identity): Remove JavaScript User model after TypeScript migration"
```

#### 6. Document Your Progress

Update your migration tracking document to mark this model as complete.

#### 7. Choose Your Next Models

Look for related models that interact with the User model, such as:
- Profile model
- Authentication-related models
- Any models referenced by the User model

These related models are good candidates for your next migration targets since you already have the User model as a reference.

#### 8. Configure TypeScript for the Service

If you haven't already, ensure you have proper TypeScript configuration in your identity service:
- Verify tsconfig.json settings
- Set up build scripts
- Configure linting rules

### 1.6 Migrate Auth Middleware

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

### 1.8 Migrate Routes

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

### 1.10 Update Dockerfile

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

### 1.12 Testing Strategies

#### Unit Testing with Jest

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

### 1.13 Test the Conversion

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
    "lint": "eslint . --ext .ts",
    "test": "jest"
  }
}
```

### 2.4 Install Dependencies

```bash
npm install --save-dev typescript @types/node @types/express @types/mongoose @types/cors @types/helmet ts-node nodemon eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin jest ts-jest @types/jest
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
  description: {
    type: String,
    required: true
  },
  creatorId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'friends-only', 'invite-only'],
    default: 'friends-only'
  },
  dietaryOptions: {
    type: [String],
    default: []
  }
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
  inviteeId: {
    type: String,
    required: true
  },
  inviterId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  rsvpDate: {
    type: Date
  }
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
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

### 4.2 Migrate Main Application

**After (TypeScript):**
```typescript
// 📄 src/index.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Public routes (no auth required)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Protected routes (auth required)
app.use('/api/events', authMiddleware, createProxyMiddleware({
  target: process.env.EVENT_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true
}));

app.use('/api/invitations', authMiddleware, createProxyMiddleware({
  target: process.env.INVITATION_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true
}));

// Start the server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

export default app;
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
    networks:
      - olive-network

  identity-service:
    build:
      context: ./services/identity-service
    environment:
      - PORT=3001
      - MONGO_URI=mongodb://mongodb:27017/identity
      - JWT_SECRET=your_jwt_secret
    ports:
      - "3001:3001"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - olive-network

  event-service:
    build:
      context: ./services/event-service
    environment:
      - PORT=3002
      - MONGO_URI=mongodb://mongodb:27017/events
      - JWT_SECRET=your_jwt_secret
    ports:
      - "3002:3002"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - olive-network

  invitation-service:
    build:
      context: ./services/invitation-service
    environment:
      - PORT=3003
      - MONGO_URI=mongodb://mongodb:27017/invitations
      - JWT_SECRET=your_jwt_secret
    ports:
      - "3003:3003"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - olive-network

  api-gateway:
    build:
      context: ./services/api-gateway
    environment:
      - PORT=3000
      - IDENTITY_SERVICE_URL=http://identity-service:3001
      - EVENT_SERVICE_URL=http://event-service:3002
      - INVITATION_SERVICE_URL=http://invitation-service:3003
      - JWT_SECRET=your_jwt_secret
    ports:
      - "3000:3000"
    depends_on:
      - identity-service
      - event-service
      - invitation-service
    networks:
      - olive-network

networks:
  olive-network:
    driver: bridge

volumes:
  mongo-data:
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

## 📝 Performance Considerations

When migrating to TypeScript, be aware of these performance implications:

### 1. Build Time Performance

TypeScript compilation adds an additional build step, which can impact development speed in large projects:

- **Problem**: Slow builds in large projects
- **Solution**: 
  - Use `tsc --incremental` for incremental builds
  - Configure `tsconfig.json` with `"incremental": true`
  - Consider using `ts-node-dev` instead of `ts-node` for faster restarts
  - For very large projects, consider using Webpack or other bundlers with parallel compilation

### 2. Memory Usage

TypeScript's type checking can be memory intensive:

- **Problem**: High memory usage during compilation
- **Solution**:
  - Split large projects into smaller packages/modules
  - Use `"skipLibCheck": true` in tsconfig.json
  - Consider using project references for large monorepos

### 3. Runtime Performance

TypeScript itself has no runtime impact since it compiles to JavaScript:

- **Misconception**: TypeScript makes runtime slower
- **Reality**: Compiled TypeScript code has the same performance as equivalent JavaScript code
- **Benefit**: Type safety often helps improve runtime performance by catching bugs early

## 📊 Versioning Strategy

After completing the TypeScript migration, it's time to plan for future versioning:

### 1. Semantic Versioning

Follow semantic versioning (SemVer) for your project:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Incompatible API changes (e.g., TypeScript migration warrants a major version bump)
- **MINOR**: Backward-compatible functionality additions
- **PATCH**: Backward-compatible bug fixes

### 2. Version Bump After Migration

After completing the migration, create a new major version tag:

```bash
# Create the new tag
git tag -a v2.0.0-typescript-complete -m "Complete TypeScript migration"

# Push the tag
git push origin v2.0.0-typescript-complete
```

### 3. Changelog Updates

Create a CHANGELOG.md file or update an existing one with migration details:

```markdown
# Changelog

## [2.0.0] - 2023-XX-XX

### Changed
- Migrated entire codebase from JavaScript to TypeScript
- Updated all services with proper type definitions
- Improved error handling with typed errors
- Enhanced Docker setup with multi-stage builds
- Added comprehensive testing with Jest

### Added
- Type definitions for all models
- Interface contracts for API endpoints
- Type-safe middleware
```

## ✅ Migration Complete!

**What You've Achieved:**
- ✨ Type-safe codebase
- 🛡️ Compile-time error checking
- 📚 Better documentation through types
- 🔄 Maintainable microservices
- 🐳 Production-ready Docker setup
- 🧪 Improved testing capability

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

## 📈 Example Git Commit History

Here's an example of a well-structured commit history for this migration:

```
* a7f2d31 (HEAD -> main, tag: v2.0.0-typescript-complete) docs: Update README with TypeScript instructions
* 9e5c2f0 chore: Clean up post-migration
* 8c73b12 test: Add integration tests for full TypeScript stack
* 3b21e7a feat(api-gateway): Migrate API Gateway to TypeScript
* d952f8d feat(invitation): Migrate Invitation Service to TypeScript
* b6a710a feat(event): Migrate Event Service controllers to TypeScript
* 4f9231e feat(event): Migrate Event model to TypeScript
* 7e3c1d9 feat(identity): Remove JS versions after successful TypeScript migration
* 2c53a90 test(identity): Add tests for TypeScript models
* 1c48b3e feat(identity): Migrate Auth controller to TypeScript
* e8a6f42 feat(identity): Migrate User model to TypeScript
* a9f36b2 chore(identity): Set up TypeScript configuration
* f5d8e9c chore: Update Docker configuration
* 3e47d5a docs: Add TypeScript migration plan
* 2b9d7a1 (tag: v1.0.0-docker-baseline) Initial JavaScript version
```

This structured approach ensures a clean, trackable migration process that aligns with professional development practices.