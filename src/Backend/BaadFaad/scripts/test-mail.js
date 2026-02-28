import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendMail, verifyMailConnection } from "../config/mail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  process.env.BACKEND_ENV_PATH,
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", ".env"),
  path.join(__dirname, "..", "..", "..", ".env"),
  path.join(process.cwd(), ".env"),
].filter(Boolean);

for (const envPath of envCandidates) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) break;
}

const to = process.argv[2] || process.env.MAIL_TEST_TO || "kris.neparica@gmail.com";

if (!to) {
  console.error("MAIL_TEST_TO or CLI recipient is required.");
  process.exit(1);
}

(async () => {
  try {
    await verifyMailConnection();
    console.log("SMTP connection OK");

    await sendMail({
      to,
      subject: "Test Nudge",
      text: "Hello from BaadFaad!",
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email error", err?.message || err);
    process.exit(1);
  }
})();
