import express from 'express';
import * as participantCtrl from '../controllers/participant.controller.js';

const router = express.Router();

// create a new participant
router.post('/', participantCtrl.createParticipant);

// list participants
router.get('/', participantCtrl.getParticipants);

// single participant operations
router.get('/:id', participantCtrl.getParticipantById);
router.put('/:id', participantCtrl.updateParticipant);
router.delete('/:id', participantCtrl.deleteParticipant);

export default router;
