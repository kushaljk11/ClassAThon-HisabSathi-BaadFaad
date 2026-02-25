import express from 'express';
import {
  uploadReceipt,
  getReceiptById,
  getSessionReceipts,
  updateReceipt,
  deleteReceipt,
} from '../controllers/receipt.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', protect, upload.single('receipt'), uploadReceipt);
router.get('/session/:sessionId', protect, getSessionReceipts);
router.get('/:id', protect, getReceiptById);
router.put('/:id', protect, updateReceipt);
router.delete('/:id', protect, deleteReceipt);

export default router;
