import express from 'express';
import {
  createPayment,
  getPaymentById,
  getUserPayments,
  getSettlementPayments,
  updatePayment,
} from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createPayment);
router.get('/user/:userId', protect, getUserPayments);
router.get('/settlement/:settlementId', protect, getSettlementPayments);
router.get('/:id', protect, getPaymentById);
router.put('/:id', protect, updatePayment);

export default router;
