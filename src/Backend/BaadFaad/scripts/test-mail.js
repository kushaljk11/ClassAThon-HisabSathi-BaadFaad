import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendEmail, verifyMailConnection } from "../config/mail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  process.env.BACKEND_ENV_PATH,
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", ".env"),
  path.join(__dirname, "..", "..", "..", ".env"),
  path.join(__dirname, "..", "..", "..", "..", ".env"),
  path.join(process.cwd(), ".env"),
].filter(Boolean);

for (const envPath of envCandidates) {
  if (!fs.existsSync(envPath)) {
    continue;
  }
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    break;
  }
}

const recipient = process.argv[2] || process.env.TEST_EMAIL;

if (!recipient) {
  console.error("Missing recipient. Pass email as arg or set TEST_EMAIL in .env");
  process.exit(1);
}

try {
  const connection = await verifyMailConnection();
  console.log(`Mail provider verified: ${connection.provider}`);

  const result = await sendEmail({
    to: recipient,
    subject: "BaadFaad mail smoke test",
    text: "This is a backend smoke test email from BaadFaad.",
    html: "<h3>BaadFaad mail smoke test</h3><p>This is a backend smoke test email from BaadFaad.</p>",
  });

  console.log("Email sent successfully");
  console.log(`Provider: ${result.provider}`);
  process.exit(0);
} catch (error) {
  console.error("Mail smoke test failed");
  console.error("Message:", error?.message || "Unknown error");
  if (error?.provider) console.error("Provider:", error.provider);
  if (error?.code) console.error("Code:", error.code);
  if (error?.details) console.error("Details:", JSON.stringify(error.details, null, 2));
  process.exit(1);
}
