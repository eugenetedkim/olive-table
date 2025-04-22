const Invitation = require('../../domain/models/Invitation');

exports.getInvitations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.status) filter.status = req.query.status;

    const invitations = await Invitation.find(filter);

    res.json(invitations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInvitationById = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    res.json(invitation);
  } catch (err) {
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid invitation ID format'});
    }

    res.status(500).json({ message: err.message });
  }
};

exports.createInvitation = async (req, res) => {
  try {
    // Check if invitation already exists for this user and event
    // This prevents duplicate invitations to the same person
    const existingInvitation = await Invitation.findOne({
      eventId: req.body.eventId,
      userId: req.body.userId
    });

    // If invitation already exists, return 400 Bad Request
    // Enforces business rule that each user can only be invited once per event
    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already exists for this user and event' });
    }

    // Create new Invitation document from request body
    // req.body contains the JSON data sent in the request
    const newInvitation = new Invitation(req.body);

    // Save the new invitation to the database
    // Returns the saved document with generated ID
    const savedInvitation = await newInvitation.save();

    // In a complete implementation, we would emit an event here
    // to notify the user of the invitation using an event bus

    // Return the created invitation with 201 Created status
    // 201 is the appropriate status code for resource creation
    res.status(201).json(savedInvitation);
  } catch (err) {
    // Error handling for validation failures or other errors
    // Returns 400 Bad Request for client-side errors
    res.status(400).json({ message: err.message });
  }
};

exports.updateInvitationStatus = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.userId.toString() !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized to update this invitation' });
    }

    invitation.status = req.body.status;
    invitation.responseMessage = req.body.responseMessage || '';
    invitation.dietaryResponse = req.body.dietaryResponse || {};
    invitation.respondedAt = Date.now();

    const updatedInvitation = await invitation.save();

    res.json(updatedInvitation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.invitedBy !== req.body.userId && invitation.userId !== req.body.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this invitation' });
    }

    await Invitation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Invitation removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};