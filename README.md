# Olive Table - API Gateway & Microservices

This repository contains a microservices architecture with:
- **API Gateway**: Reverse proxy with JWT authentication and path rewriting
- **Identity Service**: User registration and authentication
- **Event Service**: Event management (CRUD operations)
- **Invitation Service**: Invitation and RSVP management

---

## Architectural Overview

```mermaid
graph TD
    A[Client] -->|HTTP Requests| B[API Gateway]
    B -->|/api/auth/*| C[Identity Service]
    B -->|/api/events → /events| D[Event Service]
    B -->|/api/invitations → /api| E[Invitation Service]
    
    C --> F[(MongoDB Users)]
    D --> G[(MongoDB Events)]
    E --> H[(MongoDB Invitations)]
```

---

## Key Components

1. **API Gateway** (`/services/api-gateway`)
  - Entry point for all requests
  - Handles:
    - JWT Authentication
    - Path Rewriting:
      - `/api/auth/*` → Identity Service
      - `/api/events/*` → `/events/*` (Event Service)
      - `/api/invitations/*` → `/api/*` (Invitation Service)
2. **Identity Service** (`/services/identity-service`)
  - Manages:
    - User registration (`POST /api/auth/register`)
    - User login (`POST /api/auth/login`)
  - Key files:
    - `authController.js` (register/login logic)
    - `User.js` (Mongoose model)
3. **Event Service** (`/services/event-service`)
  - Handles:
    - Event CRUD operations
  - Key endpoints:
    - `POST /events` (Create event)
    - `GET /events/:id` (Get event)
4. **Invitation Service** (`/services/invitation-service`)
  - Manages:
    - Invitations
    - RSVPs
  - Key files:
    - `invitationController.js`
    - `Invitation.js` (Mongoose model)

---

## Local Development Setup

### 1. Prerequisites
 - [Node.js](https://www.nodejs.org) (v18+ recommended)
 - [MongoDB](https://www.mongodb.com) (running locally or via Docker)
 - [Docker](https://www.docker.com/) (optional, for containerized setup)

### 2. Clone and Configure
```bash
git clone https://github.com/your-repo/olive-table.git
cd olive-table
```

#### Create `.env` files in each service directory:
```bash
# API Gateway (.env)
NODE_ENV=development
PORT=3000
IDENTITY_SERVICE=http://identity-service:3001
EVENT_SERVICE=http://event-service:3002
INVITATION_SERVICE=http://invitation-service:3003
JWT_SECRET=replace_this_with_a_long_random_string_you_generated

# Identity Service (.env)
NODE_ENV=development
PORT=3001
DB_CONNECTION=mongodb://mongo:27017/identity
JWT_SECRET=same_as_jwt_secret_stored_in_api_gateway_.env

# Event Service (.env) 
NODE_ENV=development
PORT=3002
DB_CONNECTION=mongodb://mongo:27017/events

# Invitation Service (.env)
NODE_ENV=development
PORT=3003
DB_CONNECTION=mongodb://mongo:27017/invitations
```

### 3. Install Dependencies
```bash
cd services/api-gateway && npm install
cd services/identity-service && npm install
cd services/event-service && npm install
cd services/invitation-service && npm install
```

### 4. Start Services

#### Running services locally

Run each service in separate terminals:
```bash
# Terminal 1 - Identity Service (port 3001)
cd services/identity-service && npm start

# Terminal 2 - Event Service (port 3002)  
cd services/event-service && npm start

# Terminal 3 - Invitation Service (port 3003)
cd services/invitation-service && npm start

# Terminal 4 - API Gateway (port 3000)
cd services/api-gateway && npm start
```

#### Running services in Docker containers

Or using Docker:
```bash
docker compose up --build
```

### 5. Verify Setup
```bash
# Check services directly

# Api-Gateway   
curl http://localhost:3000/health # Should return { "status": "ok" }

# Identity
curl http://localhost:3001/health # Should return { "status": "ok" }

# Events
curl http://localhost:3002/health # Should return { "status": "ok" }

# Invitation
curl http://localhost:3003/health # Should return { "status": "ok" }
```

### 6. First-Time User Setup
#### 1. Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 2. Login to get JWT token and user ID:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 3. Use the returned token and user ID in subsequent requests:
```bash
curl -X POST http://localhost:3002/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Test Description",
    "date": "YYYY-MM-DD_HAS_TO_BE_IN_THE_FUTURE",
    "startTime":"18:00",
    "location": "Test Location",
    "visibility": "public",
    "creatorId": "YOUR_USER_ID"
  }'
```

### Troubleshooting

- **Port conflicts**: Ensure ports 3000-3003 are free
- **MongoDB connection**: Verify MongoDB is running (`mongod`)
- **Environment variables**: Double-check `.env` files in each service
- **Docker issues**: Run `docker system prune` if containers fail to start

---

## Complete Request Flow Example

### **User Registration → Event Creation → Invitation Flow:**

```mermaid
sequenceDiagram
    participant Client
    participant API_Gateway
    participant Identity_Service
    participant Event_Service
    participant Invitation_Service

    Client->>API_Gateway: POST /api/auth/register
    API_Gateway->>Identity_Service: /register
    Identity_Service-->>API_Gateway: JWT Token
    API_Gateway-->>Client: Token
    
    Client->>API_Gateway: POST /api/events (with JWT)
    API_Gateway->>Event_Service: /events
    Event_Service-->>API_Gateway: Event ID
    API_Gateway-->>Client: 201 Created
    
    Client->>API_Gateway: POST /api/invitations (with JWT)
    API_Gateway->>Invitation_Service: /api
    Invitation_Service-->>API_Gateway: Invitation Data
    API_Gateway-->>Client: 201 Created
```

---

## Project Structure
```
services/
├── api-gateway/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT verification
│   │   └── index.js          # Proxy configuration
│
├── identity-service/
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   │   └── authController.js
│   │   │   └── routes/
│   │   │       └── auth.js
│   │   └── domain/
│   │       └── models/
│   │           └── User.js
│
├── event-service/
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   │   └── eventController.js
│   │   │   └── routes/
│   │   │       └── events.js
│   │   └── domain/
│   │       └── models/
│   │           └── Event.js
│
└── invitation-service/
    ├── src/
    │   ├── api/
    │   │   ├── controllers/
    │   │   │   └── invitationController.js
    │   │   └── routes/
    │   │       └── invitations.js
    │   └── domain/
    │       └── models/
    │           └── Invitation.js
```

---

## Key Implementation Files

| Service          | File                          | Key Functions/Middleware       |
|------------------|-------------------------------|--------------------------------|
| **API Gateway**  | `middleware/auth.js`          | `verifyToken()`                |
|                  | `index.js`                    | Proxy configuration            |
| **Identity**     | `authController.js`           | `register()`, `login()`        |
| **Event**        | `eventController.js`          | `createEvent()`, `getEvents()` |
| **Invitation**   | `invitationController.js`     | `createInvitation()`           |

### Usage Examples:
- **Authentication**: `verifyToken()` middleware checks JWT before routing to protected services
- **Event Creation**: `createEvent()` handles validation and MongoDB persistence
- **User Registration**: `register()` hashes passwords and generates JWTs

---

## API Endpoints

### Identity Service

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Event Service

- `POST /api/events` - Create new event
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Invitation Service

- `POST /api/invitations` - Create invitation
- `GET /api/invitations` - List invitations
- `PUT /api/invitations/:id` - Update RSVP status

---

## Debugging

### View logs for each service:

#### If running locally:
```bash
# API Gateway
tail -f services/api-gateway/logs/app.log

# Identity Service
tail -f services/identity-service/logs/app.log

# Event Service
tail -f services/event-service/logs/app.log

# Event Service
tail -f services/invitation-service/logs/app.log
```

#### Or, if running Docker:
```bash
docker compose logs api-gateway -f # Logs for the API Gateway service
docker compose logs identity-service -f # Logs for the identity service
docker compose logs event-service -f # Logs for the event service
docker compose logs invitation-service -f # Logs for the invitation service
```

---

## Error Handling

### - **401 Unauthorized**: Invalid/missing JWT'
### - **404 Not Found**: Invalid route
### - **500 Server Error**: Database/validation issues

---

This README provides a high-level overview of the project setup, usage, and testing of the endpoints. Please make sure to replace the placeholders with your own credentials and IDs to ensure proper functionality.