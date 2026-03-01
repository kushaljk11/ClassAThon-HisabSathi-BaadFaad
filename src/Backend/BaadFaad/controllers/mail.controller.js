/**
 * @file controllers/mail.controller.js
 * @description Mail controller - utility endpoint for sending a basic test email.
 */
import { inspectMailConfig, sendEmail, verifyMailConnection } from "../config/mail.js";

export const getMailHealth = async (_req, res) => {
  const config = inspectMailConfig();

  try {
    const verification = await verifyMailConnection();
    return res.status(200).json({
      ok: true,
      verifiedProvider: verification.provider,
      config,
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      error: error?.message || "Mail verification failed",
      code: error?.code || null,
      provider: error?.provider || null,
      config,
    });
  }
};

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
      text: req.body.text || "Hello! BaadFaad mail setup is working.",
    });
    return res.status(200).json({ message: "Email sent", info });
  } catch (error) {
    return res.status(500).json({
      message: "Email sending failed",
      error: error?.message || "Unknown mail error",
      code: error?.code || null,
      provider: error?.provider || null,
      details: error?.details || null,
    });
  }
};
