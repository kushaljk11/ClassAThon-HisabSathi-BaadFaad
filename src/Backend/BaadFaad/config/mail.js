/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration.
 * SMTP-only mail transport with strong diagnostics for cloud network issues.
 */
import nodemailer from "nodemailer";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

const getMailUser = () => process.env.EMAIL_USER || process.env.SMTP_MAIL;
const getMailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASS;
const getMailFrom = (fromName = "BaadFaad") =>
  process.env.MAIL_FROM || `"${fromName}" <${getMailUser()}>`;
const GMAIL_HOST = "smtp.gmail.com";

// Validation happens when transporter is actually used, not at import time
const getTransporterConfig = () => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();
  const MAIL_CONNECTION_TIMEOUT = Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000);
  const MAIL_GREETING_TIMEOUT = Number(process.env.MAIL_GREETING_TIMEOUT || 10000);
  const MAIL_SOCKET_TIMEOUT = Number(process.env.MAIL_SOCKET_TIMEOUT || 15000);
  const MAIL_DNS_TIMEOUT = Number(process.env.MAIL_DNS_TIMEOUT || 8000);
  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_SECURE = process.env.SMTP_SECURE === "true";

  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("Missing mail credentials: set EMAIL_USER/EMAIL_PASS or SMTP_MAIL/SMTP_PASS");
  }

  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    requireTLS: !SMTP_SECURE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    connectionTimeout: MAIL_CONNECTION_TIMEOUT,
    greetingTimeout: MAIL_GREETING_TIMEOUT,
    socketTimeout: MAIL_SOCKET_TIMEOUT,
    dnsTimeout: MAIL_DNS_TIMEOUT,
    // Force IPv4 DNS resolution to avoid ENETUNREACH on IPv6-only results.
    family: 4,
    lookup: (hostname, _options, callback) => {
      dns.lookup(hostname, { family: 4, all: false }, callback);
    },
    tls: {
      servername: SMTP_HOST,
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

const shouldRetryWithGmail465 = (error) => {
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  return (
    msg.includes("enetunreach") ||
    msg.includes("connection timeout") ||
    msg.includes("econnection") ||
    msg.includes("etimedout") ||
    code === "ETIMEDOUT" ||
    code === "ENETUNREACH"
  );
};

const buildFallback465Config = () => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();
  const MAIL_CONNECTION_TIMEOUT = Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000);
  const MAIL_GREETING_TIMEOUT = Number(process.env.MAIL_GREETING_TIMEOUT || 10000);
  const MAIL_SOCKET_TIMEOUT = Number(process.env.MAIL_SOCKET_TIMEOUT || 15000);
  const MAIL_DNS_TIMEOUT = Number(process.env.MAIL_DNS_TIMEOUT || 8000);

  return {
    host: GMAIL_HOST,
    port: 465,
    secure: true,
    requireTLS: false,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    connectionTimeout: MAIL_CONNECTION_TIMEOUT,
    greetingTimeout: MAIL_GREETING_TIMEOUT,
    socketTimeout: MAIL_SOCKET_TIMEOUT,
    dnsTimeout: MAIL_DNS_TIMEOUT,
    family: 4,
    tls: {
      servername: GMAIL_HOST,
    },
  };
};

export const verifyMailConnection = async () => {
  await getTransporter().verify();
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  const MAIL_USER = getMailUser();
  const payload = {
    from: getMailFrom(fromName),
    to,
    subject,
    text,
    html,
  };
  const originalPort = Number(process.env.SMTP_PORT || 587);
  const originalHost = process.env.SMTP_HOST || GMAIL_HOST;

  try {
    return await getTransporter().sendMail(payload);
  } catch (error) {
    console.error(
      `[mail] primary SMTP failed: host=${originalHost} port=${originalPort} code=${error?.code || "na"} address=${error?.address || "na"} message=${error?.message || error}`
    );

    // Auto-fallback for Render/Gmail IPv6 connectivity problems.
    if (shouldRetryWithGmail465(error) && originalHost === GMAIL_HOST && originalPort !== 465) {
      try {
        const fallbackTransporter = nodemailer.createTransport(buildFallback465Config());
        const result = await fallbackTransporter.sendMail(payload);
        console.warn("[mail] primary SMTP failed; fallback via smtp.gmail.com:465 succeeded");
        return result;
      } catch (fallbackError) {
        console.error(
          `[mail] fallback smtp.gmail.com:465 also failed: code=${fallbackError?.code || "na"} address=${fallbackError?.address || "na"} message=${fallbackError?.message || fallbackError}`
        );
      }
    }

    try {
      const [v4, v6] = await Promise.allSettled([
        dnsPromises.resolve4(originalHost),
        dnsPromises.resolve6(originalHost),
      ]);
      console.error(
        `[mail] DNS diagnostic for ${originalHost}: A=${v4.status === "fulfilled" ? v4.value.join(",") : "ERR"} AAAA=${v6.status === "fulfilled" ? v6.value.join(",") : "ERR"}`
      );
    } catch {}

    throw error;
  }
};

export default { getTransporter, verifyMailConnection, sendMail };
