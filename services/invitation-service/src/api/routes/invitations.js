const express = require('express');

const router = express.Router();

const {
  getInvitations,
  getInvitationById,
  createInvitation,
  updateInvitationStatus,
  deleteInvitation
} = require('../controllers/invitationController');

router.get('/', getInvitations);
router.get('/:id', getInvitationById);
router.post('/', createInvitation);
router.put('/:id/status', updateInvitationStatus);
router.delete('/:id', deleteInvitation);

module.exports = router;