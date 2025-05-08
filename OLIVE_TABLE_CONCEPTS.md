# Olive Table - Building an Event Management Platform

## The Big Picture

Olive Table is an event management platform with Domain-Driven Design (DDD) architecture where:
- Each Bounded Context (User, Event, Invitation) is its own microservice
- Domain objects are naturally represented in MongoDB
- Rich domain models with business logic
- Each service owns its own dedicated database

Our approach: **Microservices Architecture** - Breaking the application into small, independent services that each handle a specific business domain.

## Why Microservices?

Think of a restaurant:
- The kitchen (backend) has different stations for different tasks
- The waiter (API Gateway) coordinates everything
- Each station can operate independently
- Each station maintains its own ingredients and tools (separate databases)

This separation allows:
- Each service can be updated independently
- Easier to scale specific parts
- Different teams can work on different services
- If one service fails, others keep running
- Data isolation prevents cascading failures

## The Mental Model

```
User Request → API Gateway → Authentication → Business Logic → Service-Specific Database
```

Each arrow represents a decision point:
- "Is this request valid?"
- "Is this user authenticated?"
- "Does this user have permission?"
- "What data needs to be updated?"
- "Which database should store this data?"

## Service Breakdown

### 1. API Gateway (The Coordinator)

**Mental Model**: Like a hotel receptionist - first point of contact, routes requests to the right department.

**Key Concepts**:
- Acts as a single entry point for all client requests
- Routes requests to the appropriate service
- Handles cross-cutting concerns (CORS, security headers)
- Manages authentication at the gateway level
- Orchestrates cross-service data needs

```javascript
// Middleware concept: Functions that execute before reaching your main logic
app.use(authMiddleware); // "Is this guest allowed in?"
app.use(loggerMiddleware); // "Let's keep track of what they're doing"
```

### 2. Identity Service (The Bouncer)

**Mental Model**: Like a nightclub bouncer - checks IDs, remembers faces, decides who gets in.

**Key Concepts**:
- User registration and authentication
- Password hashing (never store raw passwords!)
- JWT tokens (like a wristband at a club - proves you've been checked)
- User profile management
- Maintains its own dedicated identity database

```javascript
// Password Hashing Concept
// Raw password: "password123"
// Hashed: "$2b$10$ZRU9Q..."
// One-way street: Can check if match, but can't reverse
```

### 3. Event Service (The Event Planner)

**Mental Model**: Like a wedding planner - manages all event details, ownership, and visibility.

**Key Concepts**:
- CRUD operations for events
- Authorization (can you modify this event?)
- Business rules (event validations)
- Event metadata (dietary preferences, visibility)
- Maintains its own dedicated events database

```javascript
// Authorization vs Authentication
// Authentication: "Who are you?" (JWT verification)
// Authorization: "Are you allowed to do this?" (Owner check)
```

### 4. Invitation Service (The Mail Carrier)

**Mental Model**: Like a postal service - sends invitations, tracks responses, manages RSVPs.

**Key Concepts**:
- Linking users to events
- RSVP status tracking
- Business logic for invitations
- Preventing duplicate invitations
- Maintains its own dedicated invitations database

## Technical Decisions & Why

### 1. Express.js
**Why**: Minimal, flexible, well-understood by most developers
**Mental Model**: Like a phone system - routes calls to the right extension

### 2. MongoDB
**Why**: Ideal for DDD with Mongoose and TypeScript
- Document model perfectly represents domain aggregates
- Flexible schema for evolving domain models
- Rich domain objects with embedded business logic
- Natural mapping of value objects and entities
- Aggregation pipeline for domain queries
- Type-safe domain models with Mongoose + TypeScript

**DDD Benefits**:
- No impedance mismatch between domain and database
- Aggregates stored as single documents
- Domain invariants naturally enforced
- Business rules embedded in models

**TypeScript Integration**:
- Excellent support through Mongoose ODM
- Type-safe schemas and models
- Compile-time error checking
- IDE autocompletion for development speed

**Database Design**:
- Each service has its own dedicated database
- Complete isolation between service data boundaries
- Independent scaling of databases based on service needs
- Ability to optimize database settings per service requirements
- Cross-service data needs handled at application level

**Mental Model**: Like separate buildings for different departments - each with their own storage and records system

### 3. Docker
**Why**: "It works on my machine" syndrome solved
**Mental Model**: Like shipping containers - standardized environments

### 4. Middleware Pattern
**Why**: Separation of concerns, reusability
**Mental Model**: Assembly line - each station does one job well

```javascript
// Middleware chain visualization
Request → [Auth Check] → [Validation] → [Rate Limiting] → Handler → Response
```

## Security Mindset

### 1. Authentication Flow
```
User Login → Verify Password → Generate JWT → Client Stores Token
↓
Client Request → Include JWT → Verify JWT → Allow Access
```

### 2. Authorization Pattern
```
Check Token → Extract User ID → Check Resource Ownership → Grant/Deny
```

### 3. Data Validation
```
Client Data → Type Check → Range Check → Business Rules → Database
```

## Database Design Philosophy

### 1. Database-Per-Service Pattern
- Each service owns its own dedicated MongoDB database
- Complete database separation (identity, events, invitations)
- Service boundaries strictly enforced at the database level
- No direct cross-database access allowed
- Prevents tight coupling by enforcing communication through service APIs
- True microservice isolation with separate persistence layers
- Ability to scale, backup, and optimize each database independently

### 2. Cross-Service Data Access
- Services communicate via APIs to access data outside their domain
- API Gateway orchestrates multi-service data needs
- Application-level joins handle combined data requirements
- Eventual consistency across service boundaries
- CQRS (Command Query Responsibility Segregation) for complex cross-service operations

### 3. Schema Evolution
```javascript
// User Schema Evolution
Version 1: { email, password }
Version 2: { email, password, firstName, lastName }
Version 3: { email, password, firstName, lastName, dietaryPreferences }
```

## API Design Principles

### 1. RESTful Patterns
```
GET    /events      - List all events
POST   /events      - Create event
GET    /events/:id  - Get specific event
PUT    /events/:id  - Update event
DELETE /events/:id  - Delete event
```

### 2. Request/Response Flow
```javascript
// Request Lifecycle
Client Request → Middleware Stack → Controller → Service Layer → Database
                                                            ↓
Client Response ← Serialization ← Business Logic ← Database Response
```

### 3. Cross-Database Query Flow
```javascript
// Cross-Service Data Flow
Client Request → API Gateway
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
Event Service   Identity Service   Invitation Service  
    ↓               ↓               ↓
Events DB       Identity DB       Invitations DB
    ↓               ↓               ↓
    └───────────────┼───────────────┘
                    ↓
               API Gateway (combines data)
                    ↓
              Client Response
```

## Development Workflow

### 1. Service Development Pattern
```
1. Define Data Model
2. Create API Endpoints
3. Add Business Logic
4. Implement Persistence
5. Write Tests
6. Dockerize
7. Integrate with Gateway
```

### 2. Testing Strategy
```
Unit Tests → Service Tests → Integration Tests → E2E Tests
```

## Common Patterns to Understand

### 1. Controller Pattern
**Purpose**: Handle HTTP-specific logic
**Mental Model**: Restaurant server - takes orders, returns food

### 2. Service Pattern
**Purpose**: Business logic and data manipulation
**Mental Model**: Chef - prepares the actual food

### 3. Repository Pattern
**Purpose**: Database abstraction
**Mental Model**: Kitchen storage - knows where everything is kept

### 4. Middleware Pattern
**Purpose**: Cross-cutting concerns
**Mental Model**: Security guards - check everyone before entry

### 5. API Composition Pattern
**Purpose**: Combine data from multiple services
**Mental Model**: Puzzle assembly - putting pieces from different sources together

## Error Handling Philosophy

### 1. Error Types
```
Validation Errors (400) - "You asked for something impossible"
Auth Errors (401)       - "Who are you?"
Permission Errors (403) - "You can't do that"
Not Found (404)         - "That doesn't exist"
Server Errors (500)     - "Something went wrong on our end"
```

### 2. Error Propagation
```
Database Error → Service Layer → Controller → Client
```

## Environment Management

### 1. Configuration Mindset
```
Development  → Local databases, debug logging
Staging      → Shared databases, limited logging
Production   → Isolated databases, minimal logging
```

### 2. Secret Management
```
Local      → .env files
Docker     → Environment variables
Production → Secret management service
```

## Building from Scratch - The Journey

### Phase 1: Foundation
1. Set up project structure
2. Choose technology stack
3. Define service boundaries
4. Create initial schemas
5. Set up separate databases per service

### Phase 2: Core Services
1. Build identity service first (everyone needs authentication)
2. Add event service (core business logic)
3. Create invitation service (feature completion)
4. Set up API gateway last (coordination)

### Phase 3: Integration
1. Connect services through API calls
2. Implement cross-service communication
3. Set up shared utilities
4. Create integration tests
5. Implement application-level join capabilities

### Phase 4: Production Ready
1. Add logging and monitoring
2. Implement error handling
3. Set up CI/CD pipeline
4. Create deployment scripts
5. Configure database backup and recovery

## Key Takeaways

1. **Separation of Concerns**: Each component has one job
2. **Single Responsibility**: Services handle one domain
3. **Database Isolation**: Each service has its own database
4. **Scalability by Design**: Microservices scale independently
5. **Security as a Requirement**: Not an afterthought
6. **Data Sovereignty**: Services fully own their data
7. **Maintainability**: Code should be easy to understand and change

## The Developer's Mindset

When building Olive Table, always ask:
- "What is this component's single responsibility?"
- "How does this fit into the bigger picture?"
- "Which service (and database) should own this data?"
- "How do I handle cross-service data needs?"
- "What could go wrong, and how do I handle it?"
- "Is this the simplest solution that works?"
- "How will this scale?"
- "How easy is this to test?"
- "What if we add social features later?"
- "Is my data model flexible enough to evolve?"
- "Are my types helping or hindering development?"

This conceptual understanding is the foundation upon which the actual code is built. Every line of code serves a purpose in this greater architecture.