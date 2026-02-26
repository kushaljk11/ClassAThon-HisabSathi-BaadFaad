/**
 * @fileoverview Mail Routes
 * @description Express router for email-related endpoints.
 *              Currently provides a test/debug endpoint for verifying
 *              the Nodemailer transporter configuration.
 *
 * Routes:
 *  POST /send - Send a test email to verify mail configuration
 *
 * @module routes/mail.routes
 */
import express from "express";
import { sendTestMail } from "../controllers/mail.controller.js";

const router = express.Router();

router.post("/send", sendTestMail);

export default router;