# Olive Table - JavaScript to TypeScript Migration Guide

This guide will walk you through converting all microservices from JavaScript to TypeScript.

## Project Overview

**Olive Table** is an event management platform composed of 4 microservices:

1. **API Gateway** (Port 3000) - Proxy with JWT authentication
2. **Identity Service** (Port 3001) - User authentication with bcrypt + JWT
3. **Event Service** (Port 3002) - Event CRUD operations
4. **Invitation Service** (Port 3003) - Invitation handling and RSVP

**Database**: MongoDB (localhost:27017)

## Migration Order

1. Identity Service (Core authentication)
2. Event Service
3. Invitation Service
4. API Gateway (Last, as it depends on others)

## Prerequisites

- Node.js 16+ 
- MongoDB
- Docker & Docker Compose
- Git

## Step 1: Identity Service Conversion

### 1.1 Create TypeScript Configuration

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

### 1.2 Update package.json

Add to `scripts`:
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

Add dependencies:
```bash
npm install --save-dev typescript @types/node @types/express @types/mongoose @types/bcrypt @types/jsonwebtoken @types/cors @types/helmet ts-node nodemon
```

### 1.3 Rename files and add types

1. Rename all `.js` files to `.ts`
2. Create interfaces for models
3. Add proper typing to middleware
4. Update database connections

File conversions:
- `src/index.js` → `src/index.ts`
- `src/domain/models/User.js` → `src/domain/models/User.ts`
- `src/api/controllers/authController.js` → `src/api/controllers/authController.ts`
- `src/api/controllers/userController.js` → `src/api/controllers/userController.ts`
- `src/api/routes/auth.js` → `src/api/routes/auth.ts`
- `src/api/routes/users.js` → `src/api/routes/users.ts`
- `src/api/middleware/auth.js` → `src/api/middleware/auth.ts`
- `src/infrastructure/db/mongoose.js` → `src/infrastructure/db/mongoose.ts`

### 1.4 Update Dockerfile

```dockerfile
# Build stage
FROM node:16-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start command
CMD ["npm", "start"]
```

## Step 2: Event Service Conversion

```bash
cd ../event-service
```

Follow similar steps:
1. Create `tsconfig.json`
2. Update `package.json` with TypeScript scripts
3. Install TypeScript dependencies
4. Rename and convert files:
   - `src/index.js` → `src/index.ts`
   - `src/domain/models/Event.js` → `src/domain/models/Event.ts`
   - `src/api/controllers/eventController.js` → `src/api/controllers/eventController.ts`
   - `src/api/routes/events.js` → `src/api/routes/events.ts`
   - `src/infrastructure/db/mongoose.js` → `src/infrastructure/db/mongoose.ts`
5. Update Dockerfile

## Step 3: Invitation Service Conversion

```bash
cd ../invitation-service
```

Convert:
- `src/index.js` → `src/index.ts`
- `src/api/controllers/invitationController.js` → `src/api/controllers/invitationController.ts`
- `src/api/routes/invitations.js` → `src/api/routes/invitations.ts`
- `src/domain/models/Invitation.js` → `src/domain/models/Invitation.ts`
- `src/infrastructure/db/mongoose.js` → `src/infrastructure/db/mongoose.ts`

## Step 4: API Gateway Conversion

```bash
cd ../api-gateway
```

Convert:
- `src/index.js` → `src/index.ts`
- `src/middleware/auth.js` → `src/middleware/auth.ts`

Add config types and extend Express Request interface.

## Step 5: Update docker-compose.yml

Update all service configurations to use the new TypeScript structure:

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

  api-gateway:
    build:
      context: ./services/api-gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - IDENTITY_SERVICE_URL=http://identity-service:3001
      - EVENT_SERVICE_URL=http://event-service:3002
      - INVITATION_SERVICE_URL=http://invitation-service:3003
      - JWT_SECRET=your-secret-key
    depends_on:
      - identity-service
      - event-service
      - invitation-service

  identity-service:
    build:
      context: ./services/identity-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - MONGODB_URI=mongodb://mongodb:27017/olive_table_identity
      - JWT_SECRET=your-secret-key
    depends_on:
      - mongodb

  event-service:
    build:
      context: ./services/event-service
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - PORT=3002
      - MONGODB_URI=mongodb://mongodb:27017/olive_table_events
      - IDENTITY_SERVICE_URL=http://identity-service:3001
    depends_on:
      - mongodb
      - identity-service

  invitation-service:
    build:
      context: ./services/invitation-service
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - PORT=3003
      - MONGODB_URI=mongodb://mongodb:27017/olive_table_invitations
      - IDENTITY_SERVICE_URL=http://identity-service:3001
    depends_on:
      - mongodb
      - identity-service

volumes:
  mongo-data:
```

## Step 6: Test Everything

1. Run integration tests:
```bash
chmod +x test-integration.sh
./test-integration.sh
```

2. Start services:
```bash
docker-compose up --build
```

3. Test endpoints:
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test other endpoints...
```

## Common Issues and Solutions

1. **Import errors**: Use `import` statements instead of `require`
2. **Type errors**: Add proper interfaces for all data structures
3. **Mongoose errors**: Use proper type casting and interfaces
4. **JWT typing**: Use the provided interfaces for JWT payloads

## Git Workflow

```bash
# Create feature branch for each service
git checkout -b typescript-migration/identity-service
# Make changes, test, commit
git commit -m "feat: Convert identity service to TypeScript"
git push origin typescript-migration/identity-service

# Repeat for other services
```

## Success Criteria

- [ ] All services run without TypeScript errors
- [ ] Integration tests pass
- [ ] Docker builds successful
- [ ] All API endpoints working
- [ ] No runtime errors
- [ ] Backward compatibility maintained

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Express with TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Mongoose with TypeScript](https://mongoosejs.com/docs/typescript.html)

## Need Help?

Review the conversion examples in each service's `IMPLEMENTATION_NOTES.md` file.