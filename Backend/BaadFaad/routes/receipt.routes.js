/**
 * @fileoverview Receipt Routes
 * @description Express router for receipt (bill data) management.
 *              Handles storing parsed/manual bill data and retrieval.
 *
 * Routes:
 *  POST /    - Create a new receipt with item data from a scanned/manual bill
 *  GET  /:id - Retrieve a receipt by its ID
 *
 * @module routes/receipt.routes
 */
import express from 'express';
import {
  createReceipt,
  getReceiptById,
} from '../controllers/receipt.controller.js';

const router = express.Router();

router.post('/', createReceipt);
router.get('/:id', getReceiptById);

export default router;
