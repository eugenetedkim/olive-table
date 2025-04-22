const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  invitedBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'declined', 'maybe'],
    default: 'pending'
  },
  responseMessage: {
    type: String
  },
  dietaryResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Invitation', InvitationSchema);