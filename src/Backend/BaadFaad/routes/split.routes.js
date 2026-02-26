/**
 * @fileoverview Split Routes
 * @description Express router for the core bill-splitting lifecycle.
 *              Manages creation, retrieval, update, payment tracking,
 *              finalization, and deletion of split records.
 *              Some routes require JWT authentication via the `protect` middleware.
 *
 * Routes:
 *  POST   /                                  - Create a new split
 *  GET    /                                  - List all splits (auth required)
 *  GET    /:id                               - Get a split by ID
 *  PUT    /:id                               - Update split details
 *  PUT    /:id/participant/:participantIndex  - Mark a participant's payment status
 *  POST   /:id/finalize                      - Finalize split calculations (auth required)
 *  DELETE /:id                               - Delete a split (auth required)
 *
 * @module routes/split.routes
 */
import express from 'express';
import {
  createSplit,
  getAllSplits,
  getSplitById,
  updateSplit,
  updateParticipantPayment,
  finalizeSplit,
  deleteSplit,
} from '../controllers/split.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', createSplit);
router.get('/', protect, getAllSplits);
router.get('/:id', getSplitById);
router.put('/:id', updateSplit);
router.put('/:id/participant/:participantIndex', updateParticipantPayment);
router.post('/:id/finalize', protect, finalizeSplit);
router.delete('/:id', protect, deleteSplit);

export default router;
