import  {parseBill}  from "../utils/BillParsher.js";

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