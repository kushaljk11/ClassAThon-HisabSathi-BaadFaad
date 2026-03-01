// Quick Mailjet send test for local or Render environments
// Usage:
//   node scripts/test-mailjet.js you@example.com
//   TEST_EMAIL=you@example.com node scripts/test-mailjet.js

import fs from "fs";
import path from "path";
import url from "url";
import dotenv from "dotenv";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present (Render already provides env vars)
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Resolve mail.js regardless of where the script is run from
const mailPath = path.resolve(__dirname, "../src/Backend/BaadFaad/config/mail.js");
const mailModule = await import(url.pathToFileURL(mailPath));
const { sendEmail, verifyMailConnection } = mailModule;

const recipient = process.argv[2] || process.env.TEST_EMAIL;
if (!recipient) {
  console.error("Recipient email is required. Pass as CLI arg or set TEST_EMAIL.");
  process.exit(1);
}

const from = process.env.MAIL_FROM_EMAIL || process.env.EMAIL_USER;

async function main() {
  try {
    console.log("Checking Mailjet credentials...");
    await verifyMailConnection();
    console.log("Mailjet credentials verified.");

    console.log(`Sending test email to ${recipient}...`);
    const body = await sendEmail({
      to: recipient,
      subject: "BaadFaad Mailjet test",
      text: "This is a Mailjet connectivity test from the BaadFaad backend.",
      html: "<p>This is a Mailjet connectivity test from the <strong>BaadFaad</strong> backend.</p>",
      fromName: "BaadFaad",
      fromEmail: from,
    });

    console.log("Mailjet send response:", JSON.stringify(body, null, 2));
    console.log("Test email sent successfully.");
  } catch (err) {
    console.error("Mailjet test failed.");
    console.error("Message:", err?.message || err);
    if (err?.statusCode) console.error("Status:", err.statusCode);
    if (err?.details) console.error("Details:", JSON.stringify(err.details, null, 2));
    process.exit(1);
  }
}

main();
