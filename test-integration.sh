#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Function to wait for server to be ready
wait_for_service() {
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    until curl -s ${BASE_URL}/health > /dev/null; do
        sleep 1
    done
    echo -e "${GREEN}Services are ready!${NC}"
}

# Function to extract values from JSON response
extract_json_value() {
    echo "$1" | grep -o '"'$2'": *"[^"]*"' | cut -d'"' -f4
}

echo -e "${GREEN}=== Olive Table Integration Test ===${NC}"

# Start services
echo -e "${YELLOW}Starting Docker services...${NC}"
docker compose up -d

# Wait for services to be ready
wait_for_service

echo -e "${GREEN}=== Step 1: Create Users ===${NC}"

# Create event creator
echo -e "${YELLOW}Creating event creator...${NC}"
creator_response=$(curl -s -X POST ${BASE_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "creator@test.com", "password": "password123", "firstName": "Event", "lastName": "Creator"}')
echo $creator_response

# Create invitee
echo -e "${YELLOW}Creating invitee...${NC}"
invitee_response=$(curl -s -X POST ${BASE_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invitee@test.com", "password": "password123", "firstName": "Test", "lastName": "Invitee"}')
echo $invitee_response

echo -e "${GREEN}=== Step 2: Login Users ===${NC}"

# Login creator
echo -e "${YELLOW}Logging in creator...${NC}"
creator_login=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "creator@test.com", "password": "password123"}')
creator_token=$(extract_json_value "$creator_login" "token")
creator_id=$(extract_json_value "$creator_login" "id")
echo "Creator token: ${creator_token:0:20}..."
echo "Creator ID: $creator_id"

# Login invitee
echo -e "${YELLOW}Logging in invitee...${NC}"
invitee_login=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invitee@test.com", "password": "password123"}')
invitee_token=$(extract_json_value "$invitee_login" "token")
invitee_id=$(extract_json_value "$invitee_login" "id")
echo "Invitee token: ${invitee_token:0:20}..."
echo "Invitee ID: $invitee_id"

echo -e "${GREEN}=== Step 3: Create Event ===${NC}"

# Create event
echo -e "${YELLOW}Creating event...${NC}"
event_response=$(curl -s -X POST ${BASE_URL}/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $creator_token" \
  -d "{\"title\": \"Test Event $(date +%H%M%S)\", \"description\": \"Integration Test Event\", \"date\": \"2025-06-01\", \"startTime\": \"18:00\", \"location\": \"Test Location\", \"visibility\": \"public\", \"creatorId\": \"$creator_id\"}")
event_id=$(extract_json_value "$event_response" "_id")
echo "Event ID: $event_id"

echo -e "${GREEN}=== Step 4: Send Invitation ===${NC}"

# Send invitation
echo -e "${YELLOW}Sending invitation...${NC}"
invitation_response=$(curl -s -X POST ${BASE_URL}/api/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $creator_token" \
  -d "{\"eventId\": \"$event_id\", \"userId\": \"$invitee_id\", \"invitedBy\": \"$creator_id\"}")
invitation_id=$(extract_json_value "$invitation_response" "_id")
echo "Invitation ID: $invitation_id"

echo -e "${GREEN}=== Step 5: Respond to Invitation ===${NC}"

# Respond to invitation
echo -e "${YELLOW}Responding to invitation...${NC}"
response_result=$(curl -s -X PUT ${BASE_URL}/api/invitations/$invitation_id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $invitee_token" \
  -d "{\"userId\": \"$invitee_id\", \"status\": \"accepted\", \"responseMessage\": \"Looking forward to it!\"}")
echo $response_result

echo -e "${GREEN}=== Verification ===${NC}"

# Verify event
echo -e "${YELLOW}Verifying event...${NC}"
event_verification=$(curl -s -X GET ${BASE_URL}/api/events/$event_id \
  -H "Authorization: Bearer $creator_token")
echo "Event status: $event_verification"

# Verify invitation
echo -e "${YELLOW}Verifying invitation...${NC}"
invitation_verification=$(curl -s -X GET ${BASE_URL}/api/invitations/$invitation_id \
  -H "Authorization: Bearer $invitee_token")
echo "Invitation status: $invitation_verification"

echo -e "${GREEN}=== Integration Test Complete ===${NC}"