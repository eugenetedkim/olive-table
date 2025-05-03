# Integration Test Documentation

## Prerequisites
- Docker and Docker Compose installed
- All services running: `docker-compose up -d`

## Complete Flow Test Commands

### 1. Create Users

#### Create Event Creator
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "creator@example.com", "password": "password123", "firstName": "Event", "lastName": "Creator"}'
```

#### Create Invitee
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invitee@example.com", "password": "password123", "firstName": "Test", "lastName": "Invitee"}'
```

### 2. Login and Get Tokens

#### Login as Creator
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "creator@example.com", "password": "password123"}'
```
> Save the token and user ID from the response

#### Login as Invitee
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invitee@example.com", "password": "password123"}'
```
> Save the token and user ID from the response

### 3. Create Event

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CREATOR_TOKEN" \
  -d '{"title": "Test Event", "description": "Test Description", "date": "2025-06-01", "startTime": "18:00", "location": "Test Location", "visibility": "public", "creatorId": "CREATOR_USER_ID"}'
```
> Save the event ID from the response

### 4. Send Invitation

```bash
curl -X POST http://localhost:3000/api/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CREATOR_TOKEN" \
  -d '{"eventId": "EVENT_ID", "userId": "INVITEE_USER_ID", "invitedBy": "CREATOR_USER_ID"}'
```
> Save the invitation ID from the response

### 5. Respond to Invitation

```bash
curl -X PUT http://localhost:3000/api/invitations/INVITATION_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INVITEE_TOKEN" \
  -d '{"userId": "INVITEE_USER_ID", "status": "accepted", "responseMessage": "Looking forward to it!"}'
```

## Verification Endpoints

### Verify Event Details
```bash
curl -X GET http://localhost:3000/api/events/EVENT_ID \
  -H "Authorization: Bearer CREATOR_TOKEN"
```

### Verify Invitation Status
```bash
curl -X GET http://localhost:3000/api/invitations/INVITATION_ID \
  -H "Authorization: Bearer INVITEE_TOKEN"
```

## Expected Results

1. All requests should return 200/201 status codes
2. User registration should confirm successful creation
3. Login should return JWT tokens
4. Event creation should return event object with ID
5. Invitation creation should return invitation object with ID
6. Invitation status should update to "accepted" with timestamp
7. JWT tokens should be validated by all endpoints

## Troubleshooting

- Check service logs: `docker-compose logs <service-name>`
- Verify service status: `docker-compose ps`
- Test database connection: `docker exec -it mongo mongo`
- Check JWT token validity: Decode using [jwt.io](https://jwt.io/)

Last verified: [Current Date]