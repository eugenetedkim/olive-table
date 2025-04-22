// services/api-gateway/src/config/index.js

// ------------------------------------------------------------------------
// Environment Configuration Loading
// ------------------------------------------------------------------------

require('dotenv').config(); // Loads environment variables from a .env file into process.env
// This allows storing sensitive configuration in environment variables instead of hardcoding them in the application

// ------------------------------------------------------------------------
// Configuration Object Export
// ------------------------------------------------------------------------

module.exports = {
  // ------------------------------------------------------------------------
  // Microservices Configuration
  // ------------------------------------------------------------------------
  
  services: {
    // Identity Service URL configuration
    identity: process.env.IDENTITY_SERVICE || 'http://identity-service:3001',
    // Primary service for authentication and user management
    // Falls back to the Docker container service name and default port if env var is not set
    
    // Events Service URL configuration
    events: process.env.EVENT_SERVICE || 'http://event-service:3002',
    // Service for handling event creation, management, and querying
    // Falls back to the Docker container service name and default port if env var is not set
    
    // Invitations Service URL configuration
    invitations: process.env.INVITATION_SERVICE || 'http://invitation-service:3003'
    // Service for managing invitations to events and related functionality
    // Falls back to the Docker container service name and default port if env var is not set
  },
  
  // ------------------------------------------------------------------------
  // JWT Authentication Configuration
  // ------------------------------------------------------------------------
  
  jwt: {
    // Secret key used for signing and verifying JWT tokens
    secret: process.env.JWT_SECRET || 'your-secret-key',
    // IMPORTANT: The fallback value 'your-secret-key' should be replaced in production
    // This secret is used to sign tokens issued by the identity service and verify them in the auth middleware
    
    // Token expiration time
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    // Controls how long the authentication tokens remain valid
    // Default is 1 hour if not specified in environment variables
  }
};