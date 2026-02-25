import express from 'express';
import {
  createReceipt,
  getReceiptById,
  getSessionReceipts,
} from '../controllers/receipt.controller.js';

const router = express.Router();

router.post('/', createReceipt);
router.get('/:id', getReceiptById);
router.get('/session/:sessionId', getSessionReceipts);

export default router;
