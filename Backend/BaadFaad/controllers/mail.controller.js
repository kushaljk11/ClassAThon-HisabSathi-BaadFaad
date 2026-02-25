import { sendMail } from "../config/mail.js";

export const sendTestMail = async (req, res) => {
  try {
    const info = await sendMail({
      to: req.body.to,
      subject: req.body.subject || "Test Email from BaadFaad",
      text: req.body.text || "Hello! Nodemailer Gmail setup is working 🚀",
    });

    res.status(200).json({ message: "Email sent", info: info.response });
  } catch (error) {
    res.status(500).json({ message: "Email sending failed", error: error.message });
  }
};