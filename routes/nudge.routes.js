import express from 'express';
import {
  sendNudge,
  getUserNudges,
  markAsRead,
  getSettlementNudges,
} from '../controllers/nudge.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, sendNudge);
router.get('/user/:userId', protect, getUserNudges);
router.get('/settlement/:settlementId', protect, getSettlementNudges);
router.put('/:id/read', protect, markAsRead);

export default router;
