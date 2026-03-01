/**
 * @file config/mail.js
 * @description Mailjet client wrapper with a reusable sendEmail helper.
 */
import Mailjet from "node-mailjet";

let mailjetClient = null;

const getMailjetClient = () => {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Missing MAILJET_API_KEY or MAILJET_SECRET_KEY environment variables");
  }

  if (!mailjetClient) {
    mailjetClient = new Mailjet({ apiKey, apiSecret: secretKey });
  }

  return mailjetClient;
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
  if (!to) throw new Error("Recipient email (to) is required");
  if (!fromEmail) throw new Error("Sender email is required (set MAIL_FROM_EMAIL or EMAIL_USER)");

  const recipients = Array.isArray(to) ? to : [to];

  const messages = recipients.map((email) => ({
    From: {
      Email: fromEmail,
      Name: fromName,
    },
    To: [
      {
        Email: email,
      },
    ],
    Subject: subject || "",
    TextPart: text || html || "",
    HTMLPart: html || text || "",
  }));

  const client = getMailjetClient();

  try {
    const response = await client
      .post("send", { version: "v3.1" })
      .request({
        Messages: messages,
      });
    return response.body;
  } catch (err) {
    // Bubble up a readable Mailjet error
    const statusCode = err?.statusCode || err?.response?.status;
    const mjMessage = err?.response?.body?.ErrorMessage || err?.message || "Mailjet send failed";
    const details = err?.response?.body || null;
    const wrapped = new Error(mjMessage);
    if (statusCode) wrapped.statusCode = statusCode;
    if (details) wrapped.details = details;
    throw wrapped;
  }
};

// Convenience helper for simple signature (to, subject, html)
export const sendEmailSimple = async (to, subject, html) =>
  sendEmail({ to, subject, html, text: html });

export const verifyMailConnection = async () => {
  // Basic ping by fetching the API key info; throws if creds are invalid
  const client = getMailjetClient();
  await client.get("apikey", { version: 3 }).request();
};

// Default export preserves the previous shape for existing imports
export default { sendMail: sendEmail, sendEmail, verifyMailConnection };