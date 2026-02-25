import Nudge from "../models/nudge.model.js";
import { sendMail } from "../config/mail.js";
import createNudgeTemplate from "../templates/nudge.templates.js";

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
      await sendMail({
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
