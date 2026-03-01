import nodemailer from "nodemailer";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config();

// Force IPv4 DNS resolution to avoid ENETUNREACH on IPv6
dns.setDefaultResultOrder("ipv4first");

async function testMail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.SMTP_MAIL || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
    // Force IPv4 to avoid ENETUNREACH
    family: 4,
    // Custom DNS lookup to force IPv4
    dnsLookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    },
  });

  try {
    await transporter.verify();
    console.log("SMTP connection OK");
  } catch (err) {
    console.error("SMTP failed:", err.message);
  } finally {
    transporter.close();
  }
}

testMail();
