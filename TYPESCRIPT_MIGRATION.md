# Olive Table - Complete TypeScript Migration Guide

## Step 1: Identity Service - Complete Conversion

### 1.1 Navigate and Create TypeScript Config

```bash
cd services/identity-service
```

Create `tsconfig.json` (TypeScript config for seamless MongoDB integration):
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

Open `package.json` and replace the scripts section:
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

### 1.4 Create User Model - src/domain/models/User.ts

Delete `src/domain/models/User.js` and create `src/domain/models/User.ts`:

```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// TypeScript interface for User - extends Document for Mongoose
export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dietaryPreferences?: string[];
  friends?: string[];  // For future social features
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
```

### 1.5 Create Authentication Middleware - src/api/middleware/auth.ts

Delete `src/api/middleware/auth.js` and create `src/api/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface CustomRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 1.6 Create Auth Controller - src/api/controllers/authController.ts

Delete `src/api/controllers/authController.js` and create `src/api/controllers/authController.ts`:

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../../domain/models/User';

interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dietaryPreferences?: string[];
}

interface LoginBody {
  email: string;
  password: string;
}

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, dietaryPreferences } = req.body;

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
      dietaryPreferences
    });

    await user.save();

    // Don't return password
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dietaryPreferences: user.dietaryPreferences
    };

    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};
```

### 1.7 Create User Controller - src/api/controllers/userController.ts

Delete `src/api/controllers/userController.js` and create `src/api/controllers/userController.ts`:

```typescript
import { Response } from 'express';
import User from '../../domain/models/User';
import { CustomRequest } from '../middleware/auth';

export const getMe = async (req: CustomRequest, res: Response): Promise<void> => {
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

    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Error retrieving user information' });
  }
};
```

### 1.8 Create Auth Routes - src/api/routes/auth.ts

Delete `src/api/routes/auth.js` and create `src/api/routes/auth.ts`:

```typescript
import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
```

### 1.9 Create User Routes - src/api/routes/users.ts

Delete `src/api/routes/users.js` and create `src/api/routes/users.ts`:

```typescript
import { Router } from 'express';
import { getMe } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/me', authMiddleware, getMe);

export default router;
```

### 1.10 Create Database Connection - src/infrastructure/db/mongoose.ts

Delete `src/infrastructure/db/mongoose.js` and create `src/infrastructure/db/mongoose.ts`:

```typescript
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/olive_table_identity';
    
    await mongoose.connect(dbURI);
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### 1.11 Create Main Application File - src/index.ts

Delete `src/index.js` and create `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './infrastructure/db/mongoose';
import authRoutes from './api/routes/auth';
import userRoutes from './api/routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Identity service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

### 1.12 Update Dockerfile

Replace the contents of `Dockerfile`:

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

### 1.13 Test the Conversion

```bash
# Build the TypeScript code
npm run build

# Run TypeScript checks
npm run lint

# Start in development mode
npm run dev
```

## Step 2: Event Service - Complete Conversion

### 2.1 Navigate to Event Service

```bash
cd ../event-service
```

### 2.2 Create TypeScript Config

Create `tsconfig.json` (same as identity service).

### 2.3 Update package.json

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

### 2.5 Create Event Model - src/domain/models/Event.ts

Delete `src/domain/models/Event.js` and create `src/domain/models/Event.ts`:

```typescript
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
    default: 'public'
  },
  dietaryOptions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
  }]
}, {
  timestamps: true
});

export default mongoose.model<IEvent>('Event', EventSchema);
```

### 2.6 Create Event Controller - src/api/controllers/eventController.ts

Delete `src/api/controllers/eventController.js` and create `src/api/controllers/eventController.ts`:

```typescript
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

interface EventQuery {
  creatorId?: string;
  date?: string;
  visibility?: string;
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

export const getEvents = async (req: Request<{}, {}, {}, EventQuery>, res: Response): Promise<void> => {
  try {
    const { creatorId, date, visibility } = req.query;
    
    const query: any = {};
    
    if (creatorId) query.creatorId = creatorId;
    if (date) query.date = new Date(date);
    if (visibility) query.visibility = visibility;

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ message: 'Error retrieving events' });
  }
};

export const getEvent = async (req: Request<{id: string}>, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ message: 'Error retrieving event' });
  }
};

export const updateEvent = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (event.creatorId !== req.user.userId) {
      res.status(403).json({ message: 'Not authorized to update this event' });
      return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, date: req.body.date ? new Date(req.body.date) : event.date },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

export const deleteEvent = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (event.creatorId !== req.user.userId) {
      res.status(403).json({ message: 'Not authorized to delete this event' });
      return;
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};
```

### 2.7 Create Event Routes - src/api/routes/events.ts

Delete `src/api/routes/events.js` and create `src/api/routes/events.ts`:

```typescript
import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController';

const router = Router();

router.post('/', createEvent);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
```

### 2.8 Create Database Connection - src/infrastructure/db/mongoose.ts

Copy the same file from identity service, just change the database name:

```typescript
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/olive_table_events';
```

### 2.9 Create Main Application File - src/index.ts

Delete `src/index.js` and create `src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './infrastructure/db/mongoose';
import eventRoutes from './api/routes/events';

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/events', eventRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Event service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
```

### 2.10 Update Dockerfile

Use the same multistage Dockerfile as identity service, just change the port to 3002.

## Step 3: Invitation Service - Complete Conversion

Follow the same pattern as Event Service, here are the key files:

### 3.1 Invitation Model - src/domain/models/Invitation.ts

```typescript
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

## Step 4: API Gateway - Complete Conversion

### 4.1 Create Auth Middleware - src/middleware/auth.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### 4.2 Create Main Application - src/index.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  }
}));

// Protected routes (auth required)
app.use(authMiddleware);

app.use('/api/users', createProxyMiddleware({
  target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  }
}));

app.use('/api/events', createProxyMiddleware({
  target: process.env.EVENT_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/events': '/api/events'
  }
}));

app.use('/api/invitations', createProxyMiddleware({
  target: process.env.INVITATION_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/invitations': '/api/invitations'
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

## Step 5: Final Steps

### 5.1 Update Root docker-compose.yml

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

## Troubleshooting

### Common Errors and Fixes

1. **Module not found errors**: Make sure all imports use relative paths
2. **Type errors**: Check if all interfaces match the data structure
3. **Build errors**: Ensure tsconfig.json is in each service directory
4. **Docker build fails**: Check if Dockerfile copies the right directories

### Complete Checklist

- [ ] Identity service converted and running
- [ ] Event service converted and running
- [ ] Invitation service converted and running
- [ ] API Gateway converted and running
- [ ] All Docker images build successfully
- [ ] Integration tests pass
- [ ] No TypeScript errors in any service
- [ ] Environment variables configured properly

You're done! All services should now be successfully converted to TypeScript.