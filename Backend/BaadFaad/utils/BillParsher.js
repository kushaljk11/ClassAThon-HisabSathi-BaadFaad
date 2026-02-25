import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const api = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

function extractJson(text) {
  if (!text) {
    throw new Error("No response from bill parser");
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text.trim();
}

export async function parseBill(base64Image) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    console.log("🤖 Sending to Gemini for parsing...");

    const dataUrlMatch = base64Image.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    const mimeType = dataUrlMatch?.[1] || "image/png";
    const base64Data = dataUrlMatch?.[2] || base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await api.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",

      contents: [
        {
          parts: [
            {
              text: `
Extract bill contents and return ONLY JSON.

Format:
{
  "items":[
    {
      "name":"",
      "quantity":0,
      "unit_price":0,
      "total_price":0
    }
  ],
  "subtotal":0,
  "tax":0,
  "grand_total":0
}
`,
            },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const rawText = typeof response.text === "function" ? response.text() : response.text;
    const jsonText = extractJson(rawText);

    console.log("\n✅ FINAL JSON OUTPUT:\n");
    console.log(jsonText);

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error in parseBill:", error);
    throw new Error("Failed to parse bill: " + error.message);
  }
}
