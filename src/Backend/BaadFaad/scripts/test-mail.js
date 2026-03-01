import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

async function testMail() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY in environment variables");
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  
  try {
    // Test by sending to yourself or a test email
    const testEmail = process.env.TEST_EMAIL || "delivered@resend.dev";
    
    const result = await resend.emails.send({
      from: "BaadFaad <onboarding@resend.dev>",
      to: [testEmail],
      subject: "Test Email from BaadFaad",
      text: "Hello! Resend email setup is working.",
      html: "<p>Hello! <strong>Resend</strong> email setup is working.</p>",
    });

    if (result.error) {
      console.error("Email failed:", result.error.message);
    } else {
      console.log("Email sent successfully! ID:", result.data?.id);
    }
  } catch (err) {
    console.error("Email failed:", err.message);
  }
}

testMail();
