/**
 * @file config/mail.js
 * @description Mail transport with provider selection.
 * - MAIL_PROVIDER=auto (default): use Resend if configured, else SMTP
 * - MAIL_PROVIDER=resend: force Resend API
 * - MAIL_PROVIDER=smtp: force SMTP
 */
import nodemailer from "nodemailer";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

const GMAIL_HOST = "smtp.gmail.com";
const RESEND_API_BASE = "https://api.resend.com";

const getMailUser = () => process.env.EMAIL_USER || process.env.SMTP_MAIL;
const getMailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASS;
const getResendApiKey = () => String(process.env.RESEND_API_KEY || "").trim();
const getMailProvider = () => String(process.env.MAIL_PROVIDER || "auto").trim().toLowerCase();
const getMailFrom = (fromName = "BaadFaad") => {
  const explicitFrom = String(process.env.MAIL_FROM || "").trim();
  if (explicitFrom) return explicitFrom;
  const smtpUser = getMailUser();
  if (smtpUser) return `"${fromName}" <${smtpUser}>`;
  return `"${fromName}" <onboarding@resend.dev>`;
};

const shouldUseResend = () => {
  const provider = getMailProvider();
  if (provider === "resend") return true;
  if (provider === "smtp") return false;
  return Boolean(getResendApiKey());
};

const getTransporterConfig = () => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();
  const MAIL_CONNECTION_TIMEOUT = Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000);
  const MAIL_GREETING_TIMEOUT = Number(process.env.MAIL_GREETING_TIMEOUT || 10000);
  const MAIL_SOCKET_TIMEOUT = Number(process.env.MAIL_SOCKET_TIMEOUT || 15000);
  const MAIL_DNS_TIMEOUT = Number(process.env.MAIL_DNS_TIMEOUT || 8000);
  const SMTP_HOST = process.env.SMTP_HOST || GMAIL_HOST;
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_SECURE = process.env.SMTP_SECURE === "true";

  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("Missing SMTP credentials: set EMAIL_USER/EMAIL_PASS or SMTP_MAIL/SMTP_PASS");
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
    lookup: (hostname, _options, callback) => {
      dns.lookup(hostname, { family: 4, all: false }, callback);
    },
    tls: {
      servername: SMTP_HOST,
    },
  };
};

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

const buildIpv4PinnedConfig = ({ ipHost, port, secure, servername }) => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();
  const MAIL_CONNECTION_TIMEOUT = Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000);
  const MAIL_GREETING_TIMEOUT = Number(process.env.MAIL_GREETING_TIMEOUT || 10000);
  const MAIL_SOCKET_TIMEOUT = Number(process.env.MAIL_SOCKET_TIMEOUT || 15000);
  const MAIL_DNS_TIMEOUT = Number(process.env.MAIL_DNS_TIMEOUT || 8000);

  return {
    host: ipHost,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    connectionTimeout: MAIL_CONNECTION_TIMEOUT,
    greetingTimeout: MAIL_GREETING_TIMEOUT,
    socketTimeout: MAIL_SOCKET_TIMEOUT,
    dnsTimeout: MAIL_DNS_TIMEOUT,
    tls: {
      servername,
    },
  };
};

const sendWithResend = async ({ to, subject, text, html, fromName }) => {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.MAIL_SEND_TIMEOUT_MS || 45000));
  try {
    const response = await fetch(`${RESEND_API_BASE}/emails`, {
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
        html: html || undefined,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.message || JSON.stringify(data) || "Unknown Resend error";
      throw new Error(`Resend send failed (${response.status}): ${message}`);
    }
    return { response: `resend:${data?.id || "ok"}` };
  } finally {
    clearTimeout(timeout);
  }
};

const sendWithSmtp = async ({ to, subject, text, html, fromName }) => {
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

    if (shouldRetryWithGmail465(error)) {
      try {
        const ipv4List = await dnsPromises.resolve4(originalHost);
        const ipv4 = ipv4List?.[0];
        if (ipv4) {
          const ipv4Transporter = nodemailer.createTransport(
            buildIpv4PinnedConfig({
              ipHost: ipv4,
              port: originalPort,
              secure: originalPort === 465 || process.env.SMTP_SECURE === "true",
              servername: originalHost,
            })
          );
          const ipv4Result = await ipv4Transporter.sendMail(payload);
          console.warn(`[mail] IPv4-pinned retry succeeded via ${ipv4}:${originalPort}`);
          return ipv4Result;
        }
      } catch (ipv4Error) {
        console.error(
          `[mail] IPv4-pinned retry failed: code=${ipv4Error?.code || "na"} address=${ipv4Error?.address || "na"} message=${ipv4Error?.message || ipv4Error}`
        );
      }
    }

    if (shouldRetryWithGmail465(error) && originalHost === GMAIL_HOST && originalPort !== 465) {
      try {
        const ipv4List = await dnsPromises.resolve4(GMAIL_HOST);
        const ipv4 = ipv4List?.[0];
        if (ipv4) {
          const pinned465 = nodemailer.createTransport(
            buildIpv4PinnedConfig({
              ipHost: ipv4,
              port: 465,
              secure: true,
              servername: GMAIL_HOST,
            })
          );
          const pinnedResult = await pinned465.sendMail(payload);
          console.warn(`[mail] 465 IPv4-pinned retry succeeded via ${ipv4}:465`);
          return pinnedResult;
        }
      } catch (pinned465Error) {
        console.error(
          `[mail] 465 IPv4-pinned retry failed: code=${pinned465Error?.code || "na"} address=${pinned465Error?.address || "na"} message=${pinned465Error?.message || pinned465Error}`
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

export const verifyMailConnection = async () => {
  if (shouldUseResend()) {
    const apiKey = getResendApiKey();
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    const response = await fetch(`${RESEND_API_BASE}/domains`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Resend verify failed (${response.status}): ${text}`);
    }
    return;
  }

  await getTransporter().verify();
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  if (shouldUseResend()) {
    return sendWithResend({ to, subject, text, html, fromName });
  }
  return sendWithSmtp({ to, subject, text, html, fromName });
};

export default { getTransporter, verifyMailConnection, sendMail };
