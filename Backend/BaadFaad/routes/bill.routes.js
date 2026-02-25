/**
 * @fileoverview Bill Parsing Routes
 * @description Express router for AI-powered bill/receipt parsing.
 *              Accepts a base64-encoded bill image and returns structured item data
 *              using the Google Gemini AI vision model.
 *
 * Routes:
 *  POST /parse - Parse a bill image and extract line items
 *
 * @module routes/bill.routes
 */
import express from 'express';
import billController from '../controllers/BillController.js';

const router = express.Router();

router.post('/parse', billController);

export default router;
