/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration.
 * Supports both Gmail (default) and custom SMTP. Uses lazy initialization
 * so the transporter is only created when actually needed.
 */
import nodemailer from "nodemailer";

const MAIL_USER = process.env.EMAIL_USER || process.env.SMTP_MAIL;
const MAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS;

// Validation happens when transporter is actually used, not at import time
const getTransporterConfig = () => {
  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("Missing mail credentials: set EMAIL_USER/EMAIL_PASS or SMTP_MAIL/SMTP_PASS");
  }

  return process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS,
        },
      }
    : {
        host: "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        requireTLS: true,
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS,
        },
      };
};

// Lazy initialization - transporter is created only when actually used
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(getTransporterConfig());
  }
  return transporter;
};

export const verifyMailConnection = async () => {
  await getTransporter().verify();
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  return getTransporter().sendMail({
    from: `"${fromName}" <${MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export default { getTransporter, verifyMailConnection, sendMail };