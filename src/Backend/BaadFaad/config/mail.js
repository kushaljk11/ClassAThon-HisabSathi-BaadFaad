/**
 * @file config/mail.js
 * @description Resilient mail sender with provider fallback (Mailjet + SMTP).
 */
import Mailjet from "node-mailjet";
import nodemailer from "nodemailer";

let mailjetClient = null;
let smtpTransporter = null;

const MAIL_SEND_TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.MAIL_SEND_TIMEOUT_MS || 12000)
);

const PROVIDERS = {
  MAILJET: "mailjet",
  SMTP: "smtp",
};

const hasMailjetCredentials = () =>
  Boolean(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY);

const hasSmtpCredentials = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const buildMailError = (message, { statusCode, code, provider, details } = {}) => {
  const err = new Error(message);
  if (statusCode) err.statusCode = statusCode;
  if (code) err.code = code;
  if (provider) err.provider = provider;
  if (details) err.details = details;
  return err;
};

const extractMailjetError = (err) => {
  const statusCode = err?.statusCode || err?.response?.status || err?.response?.statusCode || null;
  const body = err?.response?.body || {};

  const firstMessageError = body?.Messages?.[0]?.Errors?.[0] || null;
  const message =
    firstMessageError?.ErrorMessage ||
    body?.ErrorMessage ||
    body?.message ||
    err?.message ||
    "Mailjet send failed";

  const isBlocked =
    Number(statusCode) === 401 &&
    String(message || "").toLowerCase().includes("temporarily blocked");

  return {
    statusCode: statusCode || (isBlocked ? 401 : null),
    message,
    code: isBlocked ? "MAILJET_ACCOUNT_BLOCKED" : "MAILJET_SEND_FAILED",
    details: {
      ...(body || {}),
      rawMessageError: firstMessageError || null,
    },
  };
};

const withTimeout = async (promise, { timeoutMs = MAIL_SEND_TIMEOUT_MS, provider, operation } = {}) => {
  let timer = null;

  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(
            buildMailError(
              `${provider || "Mail provider"} ${operation || "request"} timed out after ${timeoutMs}ms`,
              {
                statusCode: 504,
                code: "MAIL_PROVIDER_TIMEOUT",
                provider,
                details: { timeoutMs, operation: operation || "request" },
              }
            )
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const normalizeRecipients = (to) => {
  if (!to) return [];
  if (Array.isArray(to)) return to.filter(Boolean).map(String).map((v) => v.trim()).filter(Boolean);
  if (typeof to === "string") {
    return to
      .split(/[;,]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [String(to).trim()].filter(Boolean);
};

const getMailjetClient = () => {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw buildMailError("Missing MAILJET_API_KEY or MAILJET_SECRET_KEY", {
      statusCode: 500,
      code: "MAILJET_CONFIG_MISSING",
      provider: PROVIDERS.MAILJET,
    });
  }

  if (!mailjetClient) {
    mailjetClient = Mailjet.apiConnect(apiKey, secretKey);
  }

  return mailjetClient;
};

const getSmtpTransporter = () => {
  if (!hasSmtpCredentials()) {
    throw buildMailError("Missing SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)", {
      statusCode: 500,
      code: "SMTP_CONFIG_MISSING",
      provider: PROVIDERS.SMTP,
    });
  }

  if (!smtpTransporter) {
    const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
    const smtpTimeout = Math.max(
      1000,
      Number(process.env.SMTP_TIMEOUT_MS || MAIL_SEND_TIMEOUT_MS)
    );
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure,
      connectionTimeout: smtpTimeout,
      greetingTimeout: smtpTimeout,
      socketTimeout: smtpTimeout,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return smtpTransporter;
};

const resolveProviderOrder = () => {
  const explicit = String(process.env.MAIL_PROVIDER || "").trim().toLowerCase();

  if (explicit === PROVIDERS.SMTP) return [PROVIDERS.SMTP, PROVIDERS.MAILJET];
  if (explicit === PROVIDERS.MAILJET) return [PROVIDERS.MAILJET, PROVIDERS.SMTP];

  // Auto mode: pick available provider first.
  if (hasMailjetCredentials()) return [PROVIDERS.MAILJET, PROVIDERS.SMTP];
  if (hasSmtpCredentials()) return [PROVIDERS.SMTP, PROVIDERS.MAILJET];

  // Default preference when nothing is configured yet.
  return [PROVIDERS.MAILJET, PROVIDERS.SMTP];
};

export const inspectMailConfig = () => {
  const providerOrder = resolveProviderOrder();
  const missing = {
    mailjet: [],
    smtp: [],
    sender: [],
  };

  if (!process.env.MAILJET_API_KEY) missing.mailjet.push("MAILJET_API_KEY");
  if (!process.env.MAILJET_SECRET_KEY) missing.mailjet.push("MAILJET_SECRET_KEY");

  if (!process.env.SMTP_HOST) missing.smtp.push("SMTP_HOST");
  if (!process.env.SMTP_PORT) missing.smtp.push("SMTP_PORT");
  if (!process.env.SMTP_USER) missing.smtp.push("SMTP_USER");
  if (!process.env.SMTP_PASS) missing.smtp.push("SMTP_PASS");

  if (!process.env.MAIL_FROM_EMAIL && !process.env.EMAIL_USER) {
    missing.sender.push("MAIL_FROM_EMAIL|EMAIL_USER");
  }

  return {
    providerPreference: String(process.env.MAIL_PROVIDER || "auto").toLowerCase() || "auto",
    providerOrder,
    mailjetConfigured: hasMailjetCredentials(),
    smtpConfigured: hasSmtpCredentials(),
    senderConfigured: Boolean(process.env.MAIL_FROM_EMAIL || process.env.EMAIL_USER),
    missing,
  };
};

const sendViaMailjet = async ({ recipients, subject, text, html, fromEmail, fromName }) => {
  const client = getMailjetClient();

  const messages = recipients.map((email) => ({
    From: {
      Email: fromEmail,
      Name: fromName,
    },
    To: [{ Email: email }],
    Subject: subject || "",
    TextPart: text || html || "",
    HTMLPart: html || text || "",
  }));

  try {
    const response = await withTimeout(
      client
        .post("send", { version: "v3.1" })
        .request({ Messages: messages }),
      { timeoutMs: MAIL_SEND_TIMEOUT_MS, provider: PROVIDERS.MAILJET, operation: "send" }
    );
    return { provider: PROVIDERS.MAILJET, response: response?.body || response };
  } catch (err) {
    const parsed = extractMailjetError(err);
    throw buildMailError(parsed.message, {
      statusCode: parsed.statusCode,
      code: parsed.code,
      provider: PROVIDERS.MAILJET,
      details: parsed.details,
    });
  }
};

const sendViaSmtp = async ({ recipients, subject, text, html, fromEmail, fromName }) => {
  const transporter = getSmtpTransporter();

  try {
    const info = await withTimeout(
      transporter.sendMail({
        from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
        to: recipients.join(", "),
        subject: subject || "",
        text: text || html || "",
        html: html || text || "",
      }),
      { timeoutMs: MAIL_SEND_TIMEOUT_MS, provider: PROVIDERS.SMTP, operation: "send" }
    );
    return { provider: PROVIDERS.SMTP, response: info };
  } catch (err) {
    throw buildMailError(err?.message || "SMTP send failed", {
      statusCode: 502,
      code: "SMTP_SEND_FAILED",
      provider: PROVIDERS.SMTP,
      details: err,
    });
  }
};

/**
 * Send an email via Mailjet.
 * @param {object} params
 * @param {string|string[]} params.to - Recipient email(s)
 * @param {string} params.subject - Email subject
 * @param {string} [params.text] - Plain-text body
 * @param {string} [params.html] - HTML body
 * @param {string} [params.fromEmail] - Sender email; defaults to EMAIL_USER or MAIL_FROM_EMAIL
 * @param {string} [params.fromName] - Sender display name
 */
export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  fromEmail = process.env.MAIL_FROM_EMAIL || process.env.EMAIL_USER,
  fromName = "BaadFaad",
}) => {
  const recipients = normalizeRecipients(to);

  if (!recipients.length) {
    throw buildMailError("Recipient email (to) is required", {
      statusCode: 400,
      code: "MAIL_TO_REQUIRED",
    });
  }

  if (!fromEmail) {
    throw buildMailError("Sender email is required (set MAIL_FROM_EMAIL or EMAIL_USER)", {
      statusCode: 500,
      code: "MAIL_FROM_REQUIRED",
    });
  }

  const order = resolveProviderOrder();
  const errors = [];

  for (const provider of order) {
    try {
      if (provider === PROVIDERS.MAILJET && hasMailjetCredentials()) {
        return await sendViaMailjet({ recipients, subject, text, html, fromEmail, fromName });
      }
      if (provider === PROVIDERS.SMTP && hasSmtpCredentials()) {
        return await sendViaSmtp({ recipients, subject, text, html, fromEmail, fromName });
      }
    } catch (error) {
      errors.push(error);
    }
  }

  if (!hasMailjetCredentials() && !hasSmtpCredentials()) {
    throw buildMailError(
      "No mail provider configured. Set MAILJET_API_KEY/MAILJET_SECRET_KEY or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS",
      { statusCode: 500, code: "MAIL_PROVIDER_NOT_CONFIGURED" }
    );
  }

  const topError = errors[0];
  const providerTrail = errors.map((e) => e?.provider).filter(Boolean);

  if (
    topError?.code === "MAILJET_ACCOUNT_BLOCKED" &&
    !hasSmtpCredentials()
  ) {
    throw buildMailError(
      "Mailjet account is temporarily blocked (401). Configure SMTP_* variables or contact Mailjet support.",
      {
        statusCode: 401,
        code: "MAILJET_ACCOUNT_BLOCKED",
        provider: PROVIDERS.MAILJET,
        details: topError?.details || null,
      }
    );
  }

  throw buildMailError(topError?.message || "Email send failed", {
    statusCode: topError?.statusCode || 502,
    code: topError?.code || "MAIL_SEND_FAILED",
    provider: topError?.provider,
    details: {
      attempts: providerTrail,
      failures: errors.map((e) => ({
        provider: e?.provider,
        code: e?.code,
        message: e?.message,
      })),
    },
  });
};

// Convenience helper for simple signature (to, subject, html)
export const sendEmailSimple = async (to, subject, html) =>
  sendEmail({ to, subject, html, text: html });

export const verifyMailConnection = async () => {
  const order = resolveProviderOrder();

  for (const provider of order) {
    if (provider === PROVIDERS.MAILJET && hasMailjetCredentials()) {
      const client = getMailjetClient();
      await withTimeout(
        client.get("apikey", { version: "v3" }).request(),
        { timeoutMs: MAIL_SEND_TIMEOUT_MS, provider: PROVIDERS.MAILJET, operation: "verify" }
      );
      return { ok: true, provider: PROVIDERS.MAILJET };
    }
    if (provider === PROVIDERS.SMTP && hasSmtpCredentials()) {
      const transporter = getSmtpTransporter();
      await withTimeout(
        transporter.verify(),
        { timeoutMs: MAIL_SEND_TIMEOUT_MS, provider: PROVIDERS.SMTP, operation: "verify" }
      );
      return { ok: true, provider: PROVIDERS.SMTP };
    }
  }

  throw buildMailError(
    "No mail provider configured for verification",
    { statusCode: 500, code: "MAIL_PROVIDER_NOT_CONFIGURED" }
  );
};

// Default export preserves the previous shape for existing imports
export default { sendMail: sendEmail, sendEmail, verifyMailConnection, inspectMailConfig };