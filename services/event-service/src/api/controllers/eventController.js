// services/event-service/src/api/controllers/eventController.js

// Import the Event model from the domain layer
// This follows DDD principles where controllers depend on domain models
const Event = require('../../domain/models/Event');

// Controller method to get all events with optional filtering
// @desc annotation provides documentation for the API endpoints
// Follows REST principles for collection resource retrieval
// @desc  Get all events
// @route GET /api/events
exports.getEvents = async (req, res) => {
  try {
    // Initialize an empty JavaScript object that will hold all the MongoDB query conditions
    // This object will be passed to Mongoose's find() method to filter documents
    // Without any properties, find({}) would return all documents in the collection
    // Properties will be added to this object based on request parameters
    const filter = {};

    // Add creatorId filter if provided in query string
    // This allows filtering events by their creator
    if (req.query.creatorId) filter.creatorId = req.query.creatorId;

    // Add visibility filter if provided in query string
    // This allows filtering events by their visibility setting
    if (req.query.visibility) filter.visibility = req.query.visibility;

    // Query database for events matching the filter
    // Model.find() is a Mongoose method that returns all matching documents
    // Returns an array of event documents
    const events = await Event.find(filter);

    // Return events as JSON response with implicit 200 OK status
    // Express automatically serializes the Mongoose documents to JSON
    res.json(events);
  } catch (err) {
    // Error handling for any exceptions
    // Returns 500 Internal Server Error for server-side errors
    res.status(500).json({ message: err.message });
  }
  
};

// Controller method to get a specific event by ID
// @desc  Get event by ID
// @route GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    // Find event by ID from URL parameter
    // findById is a Mongoose method that converts the string ID to an ObjectId and queries the _id field
    // req.params.id comes from the route parameter in the URL (e.g., /api/events/60d21b4667d0d8992e610c85)
    // MongoDB ObjectIds are 12-byte values (displayed as 24-character hex strings) that include:
    //   - 4 bytes: timestamp, 5 bytes: random value, 3 bytes: counter
    const event = await Event.findById(req.params.id);

    // If no event is found, return 404 Not Found
    // This handles the case where a valid ObjectId format is provided but no matching document exists
    // Mongoose returns null when findById doesn't find a document with the specified _id
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Return the event document as JSON with implicit 200 OK status
    // The _id field will be included in the response as a string representation of the ObjectId
    res.json(event);

  } catch (err) {
    // Error handling for any exceptions including invalid ObjectId format
    // If req.params.id isn't a valid 24-character hex string, Mongoose will throw a CastError
    // Returns 500 Internal Server Error for server-side errors or malformed ObjectId values
    res.status(500).json({ message: err.message });
  }
};

// Controller method to create a new event
// @desc Create new event
// @route POST /api/events
exports.createEvent = async (req, res) => {
  console.log('Create event called');
  try {
    // Create new Event instance from request body
    // req.body contains the parsed JSON sent in the request
    // This assumes express.json() middleware has been applied to parse JSON
    // The Event constructor maps req.body fields to the EventSchema structure
    // Fields not in the schema will be ignored; required fields must be present
    const newEvent = new Event(req.body);

    // Save the new event to the database
    // save() is a Mongoose document method that persists the document to MongoDB
    // During save(), Mongoose runs:
    //   - All validation defined in the schema
    //   - Pre-save middleware/hooks (like the updatedAt timestamp hook)
    //   - Default values are applied for missing fields
    //   - MongoDB generates a unique ObjectId for the _id field if not provided
    const savedEvent = await newEvent.save();

    // Return the saved event with 201 Created status
    // 201 is the HTTP status code for successful resource creation
    // The response includes the complete document with its generated _id
    // and any default values or modifications made during save()
    res.status(201).json(savedEvent);
  } catch (err) {
    // Error handling for validation errors or other exceptions
    // Common errors include:
    //   - Validation failures (missing required fields, invalid formats)
    //   - Duplicate key errors (if uniqueness constraints exist)
    //   - Schema type mismatch (wrong data types for fields)
    // Returns 400 Bad Request for client-side errors
    res.status(400).json({ message: err.message });
  }
};

// Controller method to update an existing event
// @desc  Update existing event
// @route PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    // First, find the event by ObjectId to verify it exists and check ownership
    // This preliminary query retrieves the complete document before making changes
    // If the ID format is invalid, Mongoose will throw a CastError
    const event = await Event.findById(req.params.id);

    // If no event is found with this ObjectId, return 404 Not Found
    // This handles cases where the ID is valid format but no document exists
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization check - verify the requester is the event creator
    // This is a basic security measure to prevent unauthorized updates
    // toString() is needed because Mongoose ObjectIds are objects, not strings
    // Returns 403 Forbidden status if user isn't authorized
    //
    // HTTP Status Code Confusion Clarification:
    // HTTP 401 Unauthorized:
    //   - Despite the name, this actually means "Unauthenticated"
    //   - The client request lacks valid authentication credentials
    //   - Server doesn't know WHO you are
    //   - Equivalent to "You need to log in" or "Your login credentials are invalid"
    //   - Often prompts the browser to show a login dialog
    //
    // HTTP 403 Forbidden:
    //   - This means "Unauthorized" (despite 401's name)
    //   - Server knows WHO you are, but you don't have permission for this resource
    //   - Authentication was successful, but authorization failed
    //   - Equivalent to "You don't have permission to do this"
    //   - No amount of re-authentication will help - you simply lack privileges
    //
    // This naming confusion stems from the original HTTP specification's terminology
    if (event.creatorId.toString() !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Update the event with new data in a single database operation
    // findByIdAndUpdate combines findById and update methods efficiently
    // Parameters:
    //   1. The ObjectId to locate the document
    //   2. req.body contains the fields to update (Mongoose only updates provided fields)
    //   3. Options object with:
    //      - {new: true}: Return the modified document instead of the original
    //      - {runValidators: true}: Apply schema validation rules to the update operation
    //        (without this, updates would bypass validation defined in the schema)
    // Note: This method won't trigger 'save' middleware, only 'update' middleware
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Return the updated event document with implicit 200 OK status
    // The response includes all fields with their updated values
    res.json(updatedEvent);
  } catch (err) {
    // Error handling for validation errors or other exceptions
    // Common errors include:
    //   - CastError (invalid ObjectId format)
    //   - ValidationError (update violates schema validation)
    //   - General database connection errors
    // Returns 400 Bad Request for client-side errors
    res.status(400).json({ message: err.message });
  }
};

// Controller method to delete an event
// @desc Delete event
// @route DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    // Find the event by ID to check if it exists and verify ownership
    // Similar to updateEvent, we need to verify the event exists and the user is authorized
    const event = await Event.findById(req.params.id);

    // If no event is found, return 404 Not Found
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization check - verify the requester is the event creator
    // Similar authorization check as in updateEvent
    if (event.creatorId.toString() !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete the event from the database
    // findByIdAndDelete is a Mongoose method that removes a document by its _id
    await Event.findByIdAndDelete(req.params.id);

    // Returns success message with implicit 200 OK status
    // Many APIs return 204 No Content for successful deletion, but we're returning confirmation message
    res.json({ message: 'Event removed' });
  } catch (err) {
    // Error handling for any exceptions
    // Returns 500 Internal Server Error for server-side errors
    res.status(500).json({ message: err.message });
  }
};