/**
 * @file config/mail.js
 * @description Nodemailer transporter configuration.
 * Supports both Gmail (default) and custom SMTP. Uses lazy initialization
 * so the transporter is only created when actually needed.
 */
import nodemailer from "nodemailer";

const getMailUser = () => process.env.EMAIL_USER || process.env.SMTP_MAIL;
const getMailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASS;
const getResendApiKey = () => String(process.env.RESEND_API_KEY || "").trim();
const isResendEnabled = () => Boolean(getResendApiKey());
const getMailFrom = (fromName = "BaadFaad") =>
  process.env.MAIL_FROM || `"${fromName}" <${getMailUser() || "onboarding@resend.dev"}>`;
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
    family: 4,
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
  return (
    msg.includes("enetunreach") ||
    msg.includes("connection timeout") ||
    msg.includes("econnection") ||
    msg.includes("etimedout")
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
  if (isResendEnabled()) {
    const apiKey = getResendApiKey();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch("https://api.resend.com/domains", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Resend verify failed (${res.status}): ${text}`);
      }
      return;
    } finally {
      clearTimeout(timeout);
    }
  }
  await getTransporter().verify();
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  if (isResendEnabled()) {
    const apiKey = getResendApiKey();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: getMailFrom(fromName),
          to: Array.isArray(to) ? to : [to],
          subject,
          text: text || undefined,
          html: html || (text ? `<p>${String(text)}</p>` : undefined),
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.message || JSON.stringify(data) || "Unknown Resend error";
        throw new Error(`Resend send failed (${res.status}): ${message}`);
      }
      return { response: `resend:${data?.id || "ok"}` };
    } finally {
      clearTimeout(timeout);
    }
  }

  const MAIL_USER = getMailUser();
  const payload = {
    from: getMailFrom(fromName),
    to,
    subject,
    text,
    html,
  };

  try {
    return await getTransporter().sendMail(payload);
  } catch (error) {
    const originalPort = Number(process.env.SMTP_PORT || 587);
    const originalHost = process.env.SMTP_HOST || GMAIL_HOST;

    // Auto-fallback for Render/Gmail IPv6 connectivity problems.
    if (shouldRetryWithGmail465(error) && originalHost === GMAIL_HOST && originalPort !== 465) {
      try {
        const fallbackTransporter = nodemailer.createTransport(buildFallback465Config());
        const result = await fallbackTransporter.sendMail(payload);
        console.warn("[mail] primary SMTP failed; fallback via smtp.gmail.com:465 succeeded");
        return result;
      } catch (fallbackError) {
        console.error("[mail] fallback smtp.gmail.com:465 also failed:", fallbackError?.message || fallbackError);
      }
    }

    throw error;
  }
};

export default { getTransporter, verifyMailConnection, sendMail };
