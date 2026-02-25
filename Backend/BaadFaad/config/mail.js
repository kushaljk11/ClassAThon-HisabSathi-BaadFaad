import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: '.env' });

const requiredEnvVars = ["EMAIL_USER", "EMAIL_PASS"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const transporter = nodemailer.createTransport(
  process.env.SMTP_HOST
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
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
);

export const verifyMailConnection = async () => {
  await transporter.verify();
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  return transporter.sendMail({
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

export default transporter;