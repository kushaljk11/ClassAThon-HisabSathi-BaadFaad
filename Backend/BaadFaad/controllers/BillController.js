/**
 * @file controllers/BillController.js
 * @description Bill parsing controller — accepts a base64-encoded bill image,
 * sends it to the Gemini AI model for OCR extraction, and returns
 * structured JSON (items, subtotal, tax, grand_total).
 */
import  {parseBill}  from "../utils/BillParsher.js";

/**
 * Parse a bill image using AI OCR.
 * @route POST /api/bills/parse
 * @param {import('express').Request} req - body: { image: string } (base64)
 * @param {import('express').Response} res - parsed bill JSON
 */
export default async function billController(req, res) {

  try {

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "Base64 image required"
      });
    }

    const result = await parseBill(image);

    res.json(result);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
}