import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testMail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
    port: Number(process.env.SMTP_PORT || 587), // 587
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || process.env.SMTP_MAIL || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify(); // just check connection
    console.log("SMTP connection OK");
  } catch (err) {
    console.error("SMTP failed:", err.message);
  }
}

testMail();
