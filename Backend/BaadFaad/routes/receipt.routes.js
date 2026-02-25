import express from 'express';
import {
  createReceipt,
  getReceiptById,
} from '../controllers/receipt.controller.js';

const router = express.Router();

router.post('/', createReceipt);
router.get('/:id', getReceiptById);

export default router;
