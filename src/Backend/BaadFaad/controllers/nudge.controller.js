/**
 * @file controllers/nudge.controller.js
 * @description Nudge controller — creates payment reminder nudges, sends
 * branded HTML emails to recipients, and exposes CRUD + split-summary endpoints.
 */
import Nudge from "../models/nudge.model.js";
import Split from "../models/split.model.js";
import Group from "../models/group.model.js";
import { sendMail } from "../config/mail.js";
import createNudgeTemplate from "../templates/nudge.templates.js";
import createSplitSummaryTemplate from "../templates/splitSummary.templates.js";

const toId = (value) => String(value?._id || value?.id || value || "");

const entryId = (entry) =>
  toId(
    (entry?.user && (entry.user._id || entry.user)) ||
      (entry?.participant && (entry.participant._id || entry.participant)) ||
      entry?._id ||
      ""
  );

const entryName = (entry) =>
  String(entry?.name || entry?.fullName || entry?.user?.name || entry?.participant?.name || "").trim();

const entryEmail = (entry) =>
  String(entry?.email || entry?.user?.email || entry?.participant?.email || "").trim().toLowerCase();

const isEntrySettled = (entry) => {
  const share = Number(entry?.amount || 0);
  const paid = Number(entry?.amountPaid || 0);
  const due = Math.max(0, share - paid);
  return String(entry?.paymentStatus || "").toLowerCase() === "paid" || due <= 0;
};

const findBreakdownEntry = (breakdown, { id, email, name }) => {
  const idStr = toId(id);
  const emailStr = String(email || "").trim().toLowerCase();
  const nameStr = String(name || "").trim().toLowerCase();

  return (breakdown || []).find((entry) => {
    const eid = entryId(entry);
    const eemail = entryEmail(entry);
    const ename = entryName(entry).toLowerCase();
    if (idStr && eid && idStr === eid) return true;
    if (emailStr && eemail && emailStr === eemail) return true;
    if (nameStr && ename && nameStr === ename) return true;
    return false;
  });
};

const buildSettlementLink = ({ providedLink, groupId }) => {
  if (providedLink && String(providedLink).trim()) return String(providedLink).trim();
  const rawFrontend = String(process.env.FRONTEND_URL || "https://baadfaad.vercel.app");
  const firstOrigin = rawFrontend.split(",")[0].trim().replace(/\/$/, "");
  if (!groupId) return firstOrigin;
  return `${firstOrigin}/group/${groupId}/settlement`;
};

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
      senderEmail,
      senderId,
      splitId,
      groupId,
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

    // Strict permission enforcement: require splitId or groupId so we can
    // verify settlement status of sender and recipient before creating a nudge.
    if (!splitId && !groupId) {
      return res.status(400).json({ message: "splitId or groupId is required to send a nudge" });
    }

    const split = splitId ? await Split.findById(splitId).lean() : null;
    if (!split) {
      return res.status(404).json({ message: "Split not found" });
    }

    const group = groupId
      ? await Group.findById(groupId).select("createdBy splitId").lean()
      : await Group.findOne({ splitId: split._id }).select("createdBy splitId").lean();

    if (!group) {
      return res.status(400).json({ message: "Group context is required to send nudge" });
    }

    if (!senderId) {
      return res.status(400).json({ message: "senderId is required" });
    }

    const hostId = toId(group.createdBy);
    const breakdown = Array.isArray(split.breakdown) ? split.breakdown : [];

    // Rule: only the highest payer can send nudges.
    const highestPayer = (breakdown || [])
      .slice()
      .sort((a, b) => Number(b?.amountPaid || 0) - Number(a?.amountPaid || 0))[0] || null;
    const highestPayerId = highestPayer ? entryId(highestPayer) : "";
    const highestPaidAmount = Number(highestPayer?.amountPaid || 0);

    // If nobody has paid anything yet, no one can send nudge.
    const effectiveSenderId = highestPaidAmount > 0 ? highestPayerId : "";

    if (!effectiveSenderId) {
      return res.status(200).json({ success: true, delivered: false, message: "No eligible sender yet. Highest payer can send nudges after payment is recorded." });
    }

    if (toId(senderId) !== effectiveSenderId) {
      const allowedName = entryName(highestPayer) || (toId(effectiveSenderId) === hostId ? "host" : "highest payer");
      return res.status(200).json({
        success: true,
        delivered: false,
        message: `Only ${allowedName} (highest payer) can send nudges for this group`,
      });
    }

    const recipientMatch = findBreakdownEntry(breakdown, {
      email: recipientEmail,
      name: recipientName,
    });

    if (!recipientMatch) {
      return res.status(200).json({ success: true, delivered: false, message: "Recipient is not part of this split" });
    }

    if (isEntrySettled(recipientMatch)) {
      return res.status(200).json({ success: true, delivered: false, message: "Recipient already settled; no nudge created" });
    }

    const { paidByName = '' } = req.body;
    const finalPayLink = buildSettlementLink({ providedLink: payLink, groupId: group?._id || groupId });

    const template = createNudgeTemplate({
      recipientName,
      senderName,
      groupName,
      amount,
      currency,
      dueDate,
      payLink: finalPayLink,
      paidByName,
      anonymous: !!paidByName === false,
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
      payLink: finalPayLink,
      paidByName: paidByName || '',
      status,
      errorMessage,
    });

    if (status === "failed") {
      const isTimeout = typeof errorMessage === "string" && errorMessage.includes("ETIMEDOUT");
      return res.status(200).json({
        success: false,
        delivered: false,
        message: isTimeout
          ? "Nudge saved, but email sending failed: SMTP server is unreachable from backend"
          : "Nudge saved, but email sending failed",
        error: errorMessage,
        nudge,
      });
    }

    return res.status(201).json({
      success: true,
      delivered: true,
      message: "Nudge sent successfully",
      nudge,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create nudge", error: error.message });
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

    const recipients = breakdown.filter((b) => String(b?.email || "").trim());
    if (recipients.length === 0) {
      return res.status(400).json({ message: "No participant emails found in split summary payload" });
    }

    const participantCount = breakdown.length;
    const allParticipants = breakdown.map((b) => ({
      name: b.name || "Participant",
      share: b.share || 0,
      amountPaid: b.amountPaid || 0,
      balanceDue: b.balanceDue || 0,
      paidByName: b.paidByName || '',
    }));

    let sent = 0;
    let failed = 0;
    const failures = [];

    for (const b of recipients) {

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
        await sendMail({
          to: b.email,
          subject: template.subject,
          text: template.text,
          html: template.html,
        });
        sent++;
      } catch (mailErr) {
        failed++;
        failures.push({
          email: b.email,
          error: mailErr?.message || "Unknown mail error",
        });
      }
    }

    return res.status(200).json({ message: "Summary emails processed", sent, failed, failures });
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
