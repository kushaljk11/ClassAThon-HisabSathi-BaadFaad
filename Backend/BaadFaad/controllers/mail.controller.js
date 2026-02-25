/**
 * @file controllers/mail.controller.js
 * @description Mail controller — utility endpoint for sending a basic test email.
 * Used during development to verify SMTP / Gmail configuration.
 */
import transporter from "../config/mail.js";

/**
 * Send a simple test email.
 * @route POST /api/mail/send
 * @param {import('express').Request} req - body: { to, subject?, text? }
 * @param {import('express').Response} res
 */
export const sendTestMail = async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"BaadFaad" <${process.env.EMAIL_USER}>`,
      to: req.body.to, // Recipient email
      subject: req.body.subject || "Test Email from BaadFaad",
      text: req.body.text || "Hello! Nodemailer Gmail setup is working 🚀",
    });

    res.status(200).json({ message: "Email sent", info: info.response });
  } catch (error) {
    res.status(500).json({ message: "Email sending failed", error: error.message });
  }
};