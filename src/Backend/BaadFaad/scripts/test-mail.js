import nodemailer from "nodemailer";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config();

// Force IPv4 DNS resolution
dns.setDefaultResultOrder("ipv4first");

async function testMail() {
  const user = process.env.EMAIL_USER || process.env.SMTP_MAIL;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error("Missing EMAIL_USER/EMAIL_PASS");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
    family: 4,
  });

  try {
    await transporter.verify();
    console.log("SMTP connection OK");
    
    // Optional: send test email
    const testTo = process.env.TEST_EMAIL || user;
    const result = await transporter.sendMail({
      from: `"BaadFaad Test" <${user}>`,
      to: testTo,
      subject: "Test Email from BaadFaad",
      text: "SMTP is working!",
    });
    console.log("Test email sent:", result.messageId);
  } catch (err) {
    console.error("SMTP failed:", err.message);
  } finally {
    transporter.close();
  }
}

testMail();
