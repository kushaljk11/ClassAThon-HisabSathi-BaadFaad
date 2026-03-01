/**
 * @file controllers/mail.controller.js
 * @description Mail controller - utility endpoint for sending a basic test email.
 */
import { sendEmail } from "../config/mail.js";

/**
 * Send a simple test email.
 * @route POST /api/mail/send
 * @param {import('express').Request} req - body: { to, subject?, text? }
 * @param {import('express').Response} res
 */
export const sendTestMail = async (req, res) => {
  try {
    const info = await sendEmail({
      to: req.body.to,
      subject: req.body.subject || "Test Email from BaadFaad",
      text: req.body.text || "Hello! Mailjet setup is working.",
    });
    return res.status(200).json({ message: "Email sent", info });
  } catch (error) {
    return res.status(500).json({ message: "Email sending failed", error: error.message });
  }
};
