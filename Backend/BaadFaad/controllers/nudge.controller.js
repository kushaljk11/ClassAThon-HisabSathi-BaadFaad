import Nudge from "../models/nudge.model.js";
import transporter from "../config/mail.js";
import createNudgeTemplate from "../templates/nudge.templates.js";
import createSplitSummaryTemplate from "../templates/splitSummary.templates.js";

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

    try {
      await transporter.sendMail({
        from: `"BaadFaad" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
    } catch (mailError) {
      status = "failed";
      errorMessage = mailError.message;
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
      return res.status(500).json({
        message: "Nudge saved, but email sending failed",
        nudge,
      });
    }

    return res.status(201).json({
      message: "Nudge sent successfully",
      nudge,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create nudge", error: error.message });
  }
};

export const getAllNudges = async (_req, res) => {
  try {
    const nudges = await Nudge.find().sort({ createdAt: -1 });
    return res.status(200).json(nudges);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch nudges", error: error.message });
  }
};

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

    let sent = 0;
    let failed = 0;

    for (const b of breakdown) {
      if (!b.email) continue;

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
        await transporter.sendMail({
          from: `"BaadFaad" <${process.env.EMAIL_USER}>`,
          to: b.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });
        sent++;
      } catch {
        failed++;
      }
    }

    return res.status(200).json({ message: "Summary emails processed", sent, failed });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send split summary", error: error.message });
  }
};

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
