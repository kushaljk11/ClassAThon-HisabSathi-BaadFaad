/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration for Gmail SMTP.
 * Uses IPv4 to avoid ENETUNREACH on some hosting platforms.
 */
import nodemailer from "nodemailer";
import dns from "dns";

// Force DNS to resolve IPv4 addresses first
dns.setDefaultResultOrder("ipv4first");

const getMailUser = () => process.env.EMAIL_USER || process.env.SMTP_MAIL;
const getMailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASS;

/**
 * Create a fresh transporter for each send operation.
 */
const createTransporter = () => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();

  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("Missing mail credentials: set EMAIL_USER/EMAIL_PASS");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    // Force IPv4 connection
    family: 4,
    // Timeouts
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    // TLS settings
    tls: {
      rejectUnauthorized: true,
    },
  });
};

export const verifyMailConnection = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    return true;
  } finally {
    transporter.close();
  }
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  const MAIL_USER = getMailUser();
  const transporter = createTransporter();

  try {
    const result = await transporter.sendMail({
      from: `"${fromName}" <${MAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[mail] sent to=${to} messageId=${result.messageId}`);
    return result;
  } finally {
    transporter.close();
  }
};

export default { verifyMailConnection, sendMail };
