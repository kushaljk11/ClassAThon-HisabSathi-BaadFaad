
import "dotenv/config";
import Tesseract from "tesseract.js";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function extractText(imagePath) {
  console.log("🔍 Running OCR...");

  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng");

  return text;
}

async function parseTextToJson(text) {
  console.log("🤖 Parsing receipt with Groq...");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are a strict JSON generator. Always return valid JSON only.",
      },
      {
        role: "user",
        content: `
Extract:
- items (name, quantity, unit_price, total_price)
- subtotal
- tax
- grand_total

Return ONLY valid JSON.
No explanation.
No markdown.

Receipt:
${text}
`,
      },
    ],
  });

  const rawOutput = completion.choices[0].message.content;

  // -----------------------------
  // SAFE JSON EXTRACTION
  // -----------------------------
  const firstBrace = rawOutput.indexOf("{");
  const lastBrace = rawOutput.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    console.log("Model Output:\n", rawOutput);
    throw new Error("No valid JSON found.");
  }

  return JSON.parse(rawOutput.substring(firstBrace, lastBrace + 1));
}

// -----------------------------
// MAIN FUNCTION
// -----------------------------
export async function parseBill(imagePath) {
  try {
    const ocrText = await extractText(imagePath);

    console.log("\n📝 OCR TEXT:\n");
    console.log(ocrText);

    const json = await parseTextToJson(ocrText);

    console.log("\n✅ FINAL PARSED JSON:\n", json);
    // Return a JS object (not a JSON string)
    return json;
  } catch (err) {
    console.error("\n❌ ERROR:", err);
    // Throw so callers can handle the error consistently
    throw err;
  }
}

// 👉 Put your receipt image path here
