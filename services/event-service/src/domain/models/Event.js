// services/event-service/src/domain/models/Event.js

// Import Mongoose ODM for schema definition and model creation
// Mongoose provides a schema-based solution to model application data
const mongoose = require('mongoose');

// Define the Event schema using Mongoose's schema constructor
// This represents the structure and validation rules for event documents
const EventSchema = new mongoose.Schema({
  // Event title field - required string with whitespace trimming
  title: {
    type: String,       // Data type specification
    required: true,     // Makes this field mandatory
    trim: true          // Automatically removes leading/trailing whitespace
  },

  // Event description field - required string
  description: {
    type: String,
    required: true
  },

  // Creator reference field - links to the user who created the event
  // In a microservices architecture, this stores the ID of a user from the Identity service
  creatorId: {
    type: String,
    required: true
  },

  // Event date field - required date object
  date: {
    type: Date,
    required: true
  },

  // Start time field - required string (e.g., "18:00")
  // Stored as string for flexibility with time formats
  startTime: {
    type: String,
    required: true
  },

  // End time field - optional string
  endTime: {
    type: String,
  },

  // Location field - required string
  location: {
    type: String,
    required: true
  },

  // Visibility setting - controls who can see the event
  // Uses enum to restrict values to a predefined set
  visibility: {
    type: String,
    required: true,
    enum: ['public', 'friends-only', 'invite-only'],  // Valid values list
    default: 'friends-only'
  },

  // Dietary preferences and restrictions - optional nested object
  // This is an example of embedding related data for the future dietary features
  dietary: {
    preferences: [String],  // Array of strings for food preferences
    restrictions: [String]  // Array of strings for dietary restrictions
  },

  // Created timestamp - automatically set to current time on creation
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Updated timestamp - automatically set to current time on creation
  // Will be updated on document modifications by the pre-save middleware below
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// This is a "pre-save" mongoose middleware function that hooks into the document lifecycle
// It intercepts the document saving process before it completes (between save initiation and database write)
// Implemenation note: Uses a traditional function declaration (not arrow function) to preserve 'this' context,
// where 'this' refers to the specific document instance being saved
EventSchema.pre('save', function(next) {
  // Set updatedAt field to current timestamp (milliseconds since Unix epoch)
  this.updatedAt = Date.now();
  // Call next() to proceed to the next middleware in the chain or complete the save operation
  // Without calling next(), the save operation would hang indefinitely
  next();
});

// Export the model created from the schema
// First argument is the singular name of the collection
// Mongoose automatically creates a collection named 'events' (pluralized)

// Export the model for our data schema
// First argument 'Event' is the singular, PascalCase name of the model
// Mongoose automatically created a lowercase, pluralized collection named 'events'
// This follows the convention: models are singular (representing one document)
// while collections are pluaral (storing many documents)
module.exports = mongoose.model('Event', EventSchema);