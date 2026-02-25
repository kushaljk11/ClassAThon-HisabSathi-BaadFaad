import express from "express";
import fs from "fs";
import path from "path";
import { parseBill } from "../utils/BillParsher.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allow JSON bodies (used by the base64 upload endpoint)
router.use(express.json({ limit: "12mb" }));

// POST route to handle base64 JSON image upload
router.post("/parse-bill-base64", async (req, res) => {
  try {
    const dataUrl = req.body.image || req.body.data;
    if (!dataUrl) return res.status(400).json({ error: "No image provided" });

    const m = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!m) return res.status(400).json({ error: "Invalid data URL" });

    const mime = m[1];
    const base64 = m[2];
    const ext = (mime.split("/")[1] || "jpg").split("+")[0];

    const buffer = Buffer.from(base64, "base64");
    const outPath = path.join(uploadDir, `upload-${Date.now()}.${ext}`);
    await fs.promises.writeFile(outPath, buffer);

    const result = await parseBill(outPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
