// services/event-service/src/infrastructure/db/mongoose.js

// Import the mongoose ODM for MongoDB interaction
// Provides schema validation, query building, and business logic hooks
const mongoose = require('mongoose');

// Import Winston logging library for structured, level-based logging
// Industry standard logging solution for Node.js applications
const winston = require('winston');

// Configure the Winston logger with formatting and transports
// Creates a logger instance that will be used across this module
const logger = winston.createLogger({
  // Set minimum log level - messages below this level won't be logged
  level: 'info',

  // Combines multiple formatters into one processing pipeline
  format: winston.format.combine(
    // Adds ISO timestamp to each log entry for chronological tracking
    winston.format.timestamp(),
    // Outputs logs as JSON for machine readability and log aggregation
    winston.format.json()
  ),

  // Defines where log output will be sent
  transports: [
    new winston.transports.Console()
  ]
});


// Exports an asynchronous function that connects to MongoDB
// This follows the module pattern providing a named export
// Provides a named export for establshing the MongoDB connection
exports.connectDB = async () => {
    try {
      // Attempt to establish MongoDB connection
      // Uses connection string from environment variables for configuration
      // await suspends execution until the Promise resolves or rejects
      const conn = await mongoose.connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
};