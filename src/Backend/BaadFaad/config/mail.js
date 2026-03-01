/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration.
 * Uses Gmail SMTP with explicit IPv4 resolution to avoid ENETUNREACH errors
 * in serverless environments that don't support IPv6.
 */
import nodemailer from "nodemailer";
import dns from "dns";

// Force DNS to resolve IPv4 addresses only (fixes ENETUNREACH on Vercel/serverless)
dns.setDefaultResultOrder("ipv4first");

const getMailUser = () => process.env.EMAIL_USER || process.env.SMTP_MAIL;
const getMailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASS;

/**
 * Create a fresh transporter for each send operation.
 * This ensures clean connections in serverless environments.
 */
const createTransporter = () => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();

  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("Missing mail credentials: set EMAIL_USER/EMAIL_PASS or SMTP_MAIL/SMTP_PASS");
  }

  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // Use STARTTLS on port 587
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    // Force IPv4 to avoid ENETUNREACH
    family: 4,
    // Connection settings
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    // TLS options
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    // DNS lookup override to force IPv4
    dnsLookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    },
    // Debug logging
    logger: process.env.NODE_ENV !== "production",
    debug: process.env.NODE_ENV !== "production",
  };

  return nodemailer.createTransport(config);
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
    return result;
  } finally {
    transporter.close();
  }
};

// Export both named exports and default object for backward compatibility
export default { createTransporter, verifyMailConnection, sendMail };
