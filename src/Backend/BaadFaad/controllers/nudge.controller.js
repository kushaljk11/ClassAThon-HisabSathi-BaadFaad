/**
 * @file controllers/nudge.controller.js
 * @description Nudge controller — creates payment reminder nudges, sends
 * branded HTML emails to recipients, and exposes CRUD + split-summary endpoints.
 */
import Nudge from "../models/nudge.model.js";
import { sendEmail } from "../config/mail.js";
import createNudgeTemplate from "../templates/nudge.templates.js";
import createSplitSummaryTemplate from "../templates/splitSummary.templates.js";

/**
 * Create a nudge record and send a reminder email to the recipient.
 * @route POST /api/nudge/send
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const createAndSendNudge = async (req, res) => {
  try {
    const {
      recipientName,
      recipientEmail,
      senderName,
      groupName,
      amount,
      currency,
      dueDate,
      payLink,
    } = req.body;

    if (!recipientName || !recipientEmail || !senderName || !groupName || amount === undefined) {
      return res.status(400).json({
        message: "recipientName, recipientEmail, senderName, groupName and amount are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0 to send a nudge",
      });
    }

    const template = createNudgeTemplate({
      recipientName,
      senderName,
      groupName,
      amount,
      currency,
      dueDate,
      payLink,
    });

    let status = "sent";
    let errorMessage = null;
    let mailCode = 200;
    let mailDetails = null;
    let mailProvider = null;

    try {
      const mailResult = await sendEmail({
        to: recipientEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      mailProvider = mailResult?.provider || null;
    } catch (mailError) {
      status = "failed";
      errorMessage = mailError?.message || "Mailjet send failed";
      mailCode = mailError?.statusCode || 502;
      mailDetails = mailError?.details || null;
      mailProvider = mailError?.provider || null;
    }

    const nudge = await Nudge.create({
      recipientName,
      recipientEmail,
      senderName,
      groupName,
      amount,
      currency,
      dueDate,
      payLink,
      status,
      errorMessage,
    });

    if (status === "failed") {
      const isTimeout = typeof errorMessage === "string" && errorMessage.toLowerCase().includes("timeout");
      return res.status(mailCode).json({
        success: false,
        delivered: false,
        message: isTimeout
          ? "Nudge saved, but email sending failed: provider timed out or is unreachable"
          : `Nudge saved, but email sending failed: ${errorMessage || "Mail provider error"}`,
        error: errorMessage,
        provider: mailProvider,
        details: mailDetails,
        nudge,
      });
    }

    return res.status(201).json({
      success: true,
      delivered: true,
      message: "Nudge sent successfully",
      provider: mailProvider,
      nudge,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create nudge",
      error: error?.message || "Unknown error",
      details: error?.details || null,
    });
  }
};

/**
 * List all nudges, newest first.
 * @route GET /api/nudge
 */
export const getAllNudges = async (_req, res) => {
  try {
    const nudges = await Nudge.find().sort({ createdAt: -1 });
    return res.status(200).json(nudges);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch nudges", error: error.message });
  }
};

/**
 * Get a single nudge by MongoDB _id.
 * @route GET /api/nudge/:id
 */
export const getNudgeById = async (req, res) => {
  try {
    const nudge = await Nudge.findById(req.params.id);

    if (!nudge) {
      return res.status(404).json({ message: "Nudge not found" });
    }

    return res.status(200).json(nudge);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch nudge", error: error.message });
  }
};

/**
 * POST /nudge/split-summary
 * Sends a detailed split-summary email to every participant in the breakdown.
 * Body: { groupName, totalAmount, breakdown: [{ name, email, share, amountPaid, balanceDue }] }
 */
export const sendSplitSummary = async (req, res) => {
  try {
    const { groupName, totalAmount, breakdown } = req.body;

    if (!breakdown || !Array.isArray(breakdown) || breakdown.length === 0) {
      return res.status(400).json({ message: "breakdown array is required" });
    }

    const participantCount = breakdown.length;
    const allParticipants = breakdown.map((b) => ({
      name: b.name || "Participant",
      share: b.share || 0,
      amountPaid: b.amountPaid || 0,
      balanceDue: b.balanceDue || 0,
    }));

    const recipients = breakdown.filter((b) => Boolean(String(b?.email || "").trim()));
    const jobs = recipients.map(async (b) => {
      const template = createSplitSummaryTemplate({
        recipientName: b.name || "Friend",
        groupName: groupName || "Split",
        totalAmount: totalAmount || 0,
        participantCount,
        recipientShare: b.share || 0,
        recipientPaid: b.amountPaid || 0,
        recipientDue: b.balanceDue || 0,
        participants: allParticipants,
      });

      try {
        const result = await sendEmail({
          to: b.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });

        return {
          email: b.email,
          provider: result?.provider || null,
        };
      } catch (mailError) {
        mailError.details = {
          ...(mailError?.details || {}),
          email: b.email,
        };
        throw mailError;
      }
    });

    const settled = await Promise.allSettled(jobs);
    let sent = 0;
    let failed = 0;
    const failures = [];

    for (const item of settled) {
      if (item.status === "fulfilled") {
        sent++;
        continue;
      }

      failed++;
      const reason = item.reason || {};
      failures.push({
        email: reason?.details?.email || null,
        error: reason?.message || "Email send failed",
        status: reason?.statusCode || null,
        code: reason?.code || null,
        provider: reason?.provider || null,
      });
    }

    return res.status(failed > 0 ? 207 : 200).json({
      message: failed > 0 ? "Summary emails processed with some failures" : "Summary emails processed",
      sent,
      failed,
      totalRecipients: recipients.length,
      failures,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send split summary", error: error.message });
  }
};

/**
 * Update the delivery status of a nudge.
 * @route PATCH /api/nudge/:id/status
 * @param {import('express').Request} req - body: { status: 'sent'|'failed'|'pending' }
 */
export const updateNudgeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const nudge = await Nudge.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!nudge) {
      return res.status(404).json({ message: "Nudge not found" });
    }

    return res.status(200).json({ message: "Nudge status updated", nudge });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update nudge", error: error.message });
  }
};