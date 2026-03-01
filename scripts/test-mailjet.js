import dotenv from 'dotenv';
import Mailjet from 'node-mailjet';

// Load local .env variables
dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

(async () => {
  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_FROM_EMAIL,
            Name: "BaadFaad",
          },
          To: [
            {
              Email: "recipient@example.com", // your test recipient
              Name: "Test User",
            },
          ],
          Subject: "Hello from Mailjet!",
          TextPart: "This is a plain text body",
          HTMLPart: "<h3>This is HTML body</h3><p>Hello from Mailjet!</p>",
        },
      ],
    });

    console.log("✅ Email sent:", request.body);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
})();