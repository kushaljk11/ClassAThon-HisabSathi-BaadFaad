import express from 'express';
import {
  joinSession,
  getSessionParticipants,
  updateParticipant,
  removeParticipant,
} from '../controllers/participant.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/join', protect, joinSession);
router.get('/session/:sessionId', protect, getSessionParticipants);
router.put('/:id', protect, updateParticipant);
router.delete('/:id', protect, removeParticipant);

export default router;
