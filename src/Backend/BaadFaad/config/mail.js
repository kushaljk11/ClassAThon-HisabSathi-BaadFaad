/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration.
 * Supports both Gmail (default) and custom SMTP. Uses lazy initialization
 * so the transporter is only created when actually needed.
 */
import nodemailer from "nodemailer";

// Validation happens when transporter is actually used, not at import time
const getTransporterConfig = () => {
  const requiredEnvVars = ["EMAIL_USER", "EMAIL_PASS"];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    : {
        host: "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
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
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export default { getTransporter, verifyMailConnection, sendMail };