/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration.
 * Supports both Gmail (default) and custom SMTP. Uses lazy initialization
 * so the transporter is only created when actually needed.
 */
import nodemailer from "nodemailer";

const getMailUser = () => process.env.EMAIL_USER || process.env.SMTP_MAIL;
const getMailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASS;

// Validation happens when transporter is actually used, not at import time
const getTransporterConfig = () => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();
  const MAIL_CONNECTION_TIMEOUT = Number(process.env.MAIL_CONNECTION_TIMEOUT || 15000);
  const MAIL_GREETING_TIMEOUT = Number(process.env.MAIL_GREETING_TIMEOUT || 15000);
  const MAIL_SOCKET_TIMEOUT = Number(process.env.MAIL_SOCKET_TIMEOUT || 30000);

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
        connectionTimeout: MAIL_CONNECTION_TIMEOUT,
        greetingTimeout: MAIL_GREETING_TIMEOUT,
        socketTimeout: MAIL_SOCKET_TIMEOUT,
        // Force IPv4 to avoid ENETUNREACH on IPv6-only resolved hosts
        family: 4,
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
        connectionTimeout: MAIL_CONNECTION_TIMEOUT,
        greetingTimeout: MAIL_GREETING_TIMEOUT,
        socketTimeout: MAIL_SOCKET_TIMEOUT,
        // Force IPv4 to avoid ENETUNREACH on IPv6-only resolved hosts
        family: 4,
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
  const MAIL_USER = getMailUser();
  return getTransporter().sendMail({
    from: `"${fromName}" <${MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export default { getTransporter, verifyMailConnection, sendMail };
