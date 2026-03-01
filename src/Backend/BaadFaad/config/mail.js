/**
 * @file config/mail.js
 * @description Email service using Resend API (HTTP-based).
 * Works on Vercel and other serverless platforms that block SMTP.
 * 
 * Required env var: RESEND_API_KEY
 * Optional: EMAIL_FROM (defaults to onboarding@resend.dev for testing)
 */
import { Resend } from "resend";

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  return new Resend(apiKey);
};

// Default "from" address - use your verified domain in production
const getFromAddress = () => {
  return process.env.EMAIL_FROM || "BaadFaad <onboarding@resend.dev>";
};

export const verifyMailConnection = async () => {
  // Resend doesn't need connection verification - it's HTTP-based
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return true;
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  const resend = getResendClient();
  const fromAddress = getFromAddress();
  
  // Use custom fromName if EMAIL_FROM is not set
  const from = process.env.EMAIL_FROM 
    ? fromAddress 
    : `${fromName} <onboarding@resend.dev>`;

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message || "Failed to send email");
    }

    console.log(`[mail] sent to=${to} id=${result.data?.id}`);
    return result;
  } catch (error) {
    console.error(`[mail] failed to=${to} error=${error.message}`);
    throw error;
  }
};

// Export both named exports and default object for backward compatibility
export default { verifyMailConnection, sendMail };
