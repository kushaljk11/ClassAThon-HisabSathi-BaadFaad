import express from 'express';
import {
  createSettlements,
  getSettlementById,
  getSessionSettlements,
  getUserSettlements,
  markAsPaid,
  verifySettlement,
  cancelSettlement,
} from '../controllers/settlement.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/session/:sessionId', protect, createSettlements);
router.get('/session/:sessionId', protect, getSessionSettlements);
router.get('/user/:userId', protect, getUserSettlements);
router.get('/:id', protect, getSettlementById);
router.put('/:id/pay', protect, markAsPaid);
router.put('/:id/verify', protect, verifySettlement);
router.put('/:id/cancel', protect, cancelSettlement);

export default router;
