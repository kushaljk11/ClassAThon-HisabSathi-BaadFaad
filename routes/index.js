import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import sessionRoutes from './session.routes.js';
import participantRoutes from './participant.routes.js';
import receiptRoutes from './receipt.routes.js';
import splitRoutes from './split.routes.js';
import settlementRoutes from './settlement.routes.js';
import nudgeRoutes from './nudge.routes.js';
import paymentRoutes from './payment.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sessions', sessionRoutes);
router.use('/participants', participantRoutes);
router.use('/receipts', receiptRoutes);
router.use('/splits', splitRoutes);
router.use('/settlements', settlementRoutes);
router.use('/nudges', nudgeRoutes);
router.use('/payments', paymentRoutes);

export default router;
