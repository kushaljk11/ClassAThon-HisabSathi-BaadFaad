/**
 * @fileoverview Nudge (Payment Reminder) Routes
 * @description Express router for creating, sending, and managing payment
 *              reminder nudges. Also supports emailing full split summaries
 *              to all participants.
 *
 * Routes:
 *  POST  /send            - Create a nudge record and send reminder email
 *  POST  /split-summary   - Email the full split breakdown to all participants
 *  GET   /                - List all nudges
 *  GET   /:id             - Get a single nudge by ID
 *  PATCH /:id/status      - Update nudge status (e.g. mark as acknowledged)
 *
 * @module routes/nudge.route
 */
import express from "express";
import {
  createAndSendNudge,
  sendSplitSummary,
  getAllNudges,
  getNudgeById,
  updateNudgeStatus,
} from "../controllers/nudge.controller.js";

const router = express.Router();

router.post("/send", createAndSendNudge);
router.post("/split-summary", sendSplitSummary);
router.get("/", getAllNudges);
router.get("/:id", getNudgeById);
router.patch("/:id/status", updateNudgeStatus);

export default router;
