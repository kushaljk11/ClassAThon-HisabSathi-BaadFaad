/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration.
 * Supports both Gmail (default) and custom SMTP. Uses lazy initialization
 * so the transporter is only created when actually needed.
 */
import nodemailer from "nodemailer";
import dns from "dns";

// Force IPv4 DNS resolution to avoid ENETUNREACH errors
dns.setDefaultResultOrder("ipv4first");

// Validation happens when transporter is actually used, not at import time
const getTransporterConfig = () => {
  const requiredEnvVars = ["EMAIL_USER", "EMAIL_PASS"];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  const baseConfig = {
    // Force IPv4 connection
    family: 4,
    // Timeouts
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  };

  return process.env.SMTP_HOST
    ? {
        ...baseConfig,
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    : {
        ...baseConfig,
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
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