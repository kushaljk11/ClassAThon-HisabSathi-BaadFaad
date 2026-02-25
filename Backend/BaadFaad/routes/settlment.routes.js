import express from 'express';
import {
  createSettlement,
  getSettlementById,
  getSessionSettlement,
  getMySettlements,
  markParticipantPaid,
  archiveSettlement,
} from '../controllers/settlement.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Session-level settlement
router.post('/session/:sessionId', protect, createSettlement);
router.get('/session/:sessionId', protect, getSessionSettlement);

// User settlements
router.get('/my', protect, getMySettlements);

// Settlement by ID
router.get('/:id', protect, getSettlementById);

// Participant payment within a settlement
router.put('/:id/participant/:participantId/pay', protect, markParticipantPaid);

// Archive / finish session
router.put('/:id/archive', protect, archiveSettlement);

export default router;
