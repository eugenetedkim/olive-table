// Fike path: services/identity-service/src/infrastructure/db/mongoose.js

// Import the mongoose library, which is an ODM (Object Data Modeling) library for MongoDB
const mongoose = require('mongoose');

// Import winston, a popular logging libary for Node.js
const winston = require('winston');

// Create a logger instance using winston
const logger = winston.createLogger({
  // Set the default log level to 'info'
  level: 'info',

  // Combine multiple formatters:
  format: winston.format.combine(
    // Add timestamps to each log entry
    winston.format.timestamp(),
    // Format the log output as JSON
    winston.format.json()
  ),

  // Define where logs should be sent
  transports: [
    // Send all logs to the console
    new winston.transports.Console()
  ],
});

// Export a function named connectDB that will handle database connection
exports.connectDB = async () => {
  // Guard clause: Check for missing DB connection string
  if (!process.env.DB_CONNECTION) {
    logger.error("Missing DB_CONNECTION in environment variables");
    process.exit(1); // Exit with failure
  }
  
  try {
    // Attempt to connect to MongoDB using the connection string from environment variables
    const conn = await mongoose.connect(process.env.DB_CONNECTION, {
      // Options for the MongoDB connection
      useNewUrlParser: true,  // Use the new URL parser
      useUnifiedTopology: true, // Use the new Server Discovery and Monitoring engine
    });

    // If connection succeeds, log a success message with the host information
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error message
    logger.error(`Error: ${error.message}`);

    //Exit the process with code 1 (indicating error)
    process.exit(1);
  }
};