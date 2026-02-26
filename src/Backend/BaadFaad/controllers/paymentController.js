import Transaction from "../models/payment.models.js";
import { generateHmacSha256Hash } from "../utils/helper.js";
import axios from "axios";

const getMissingEnv = (keys) => keys.filter((key) => !process.env[key]);
const normalizeEnvValue = (value) => {
  if (!value) return "";
  return String(value).trim().replace(/^['\"]|['\"]$/g, "");
};

const getKhaltiSecretKey = () =>
  normalizeEnvValue(process.env.KHALTI_SECRET_KEY).replace(/^Key\s+/i, "");

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const initiatePayment = async (req, res) => {
  const {
    amount,
    productId,
    paymentGateway,
    customerName,
    customerEmail,
    customerPhone,
    productName,
  } = req.body;

  if (!paymentGateway) {
    return res.status(400).json({ message: "Payment gateway is required" });
  }

  const normalizedGateway = String(paymentGateway).trim().toLowerCase();
  if (!["esewa", "khalti"].includes(normalizedGateway)) {
    return res.status(400).json({ message: "Invalid payment gateway. Use esewa or khalti" });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: "Amount must be a valid number greater than 0" });
  }

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  try {
    const customerDetails = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    };

    const transactionData = {
      customerDetails,
      product_name: productName,
      product_id: productId,
      amount: numericAmount,
      payment_gateway: normalizedGateway,
    };

    let paymentConfig;
    if (normalizedGateway === "esewa") {
      const missingEsewaEnv = getMissingEnv([
        "FAILURE_URL",
        "SUCCESS_URL",
        "ESEWA_MERCHANT_ID",
        "ESEWA_SECRET",
        "ESEWA_PAYMENT_URL",
      ]);

      if (missingEsewaEnv.length) {
        return res.status(400).json({
          message: `Missing eSewa configuration: ${missingEsewaEnv.join(", ")}`,
        });
      }

      const paymentData = {
        amount: numericAmount,
        failure_url: process.env.FAILURE_URL,
        product_delivery_charge: "0",
        product_service_charge: "0",
        product_code: process.env.ESEWA_MERCHANT_ID,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        success_url: process.env.SUCCESS_URL,
        tax_amount: "0",
        total_amount: numericAmount,
        transaction_uuid: productId,
      };

      const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
      const signature = generateHmacSha256Hash(data, process.env.ESEWA_SECRET);

      paymentConfig = {
        url: process.env.ESEWA_PAYMENT_URL,
        data: { ...paymentData, signature },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        responseHandler: (response) => response.request?.res?.responseUrl,
      };
    } else if (normalizedGateway === "khalti") {
  const missingKhaltiEnv = getMissingEnv([
    "SUCCESS_URL",
    "KHALTI_PAYMENT_URL",
  ]);

  if (missingKhaltiEnv.length) {
    return res.status(400).json({
      message: `Missing Khalti configuration: ${missingKhaltiEnv.join(", ")}`,
    });
  }

  const khaltiSecret = getKhaltiSecretKey();
  if (!khaltiSecret || khaltiSecret === "your_khalti_secret_key_here") {
    return res.status(400).json({
      message: "KHALTI_SECRET_KEY is not configured",
    });
  }

  paymentConfig = {
    url: process.env.KHALTI_PAYMENT_URL, // should be v2/epayment/initiate
    data: {
      return_url: process.env.SUCCESS_URL,
      website_url: process.env.WEBSITE_URL || "http://localhost:5173",
      amount: Math.round(numericAmount * 100),
      purchase_order_id: productId,
      purchase_order_name: productName,
      customer_info: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
    },
    headers: {
      Authorization: `Key ${khaltiSecret}`,
      "Content-Type": "application/json",
    },
    responseHandler: (response) => response.data?.payment_url,
  };
}

    if (!paymentConfig || !isValidHttpUrl(paymentConfig.url)) {
      return res.status(400).json({
        message: `Payment gateway URL is not configured correctly for ${normalizedGateway}`,
      });
    }
 
    // Make payment request
    const payment = await axios.post(paymentConfig.url, paymentConfig.data, {
      headers: paymentConfig.headers,
    });

    const paymentUrl = paymentConfig.responseHandler(payment);
    if (!paymentUrl) {
      throw new Error("Payment URL is missing in the response");
    }

    // Save transaction record
    const transaction = new Transaction(transactionData);
    await transaction.save();

    return res.send({ url: paymentUrl });
  } catch (error) {
    console.error(
      "Error during payment initiation:",
      error.response?.data || error.message
    );
    res.status(502).send({
      message: "Payment initiation failed",
      error: error.response?.data || error.message,
    });
  }
};

const paymentStatus = async (req, res) => {
  const { product_id, pidx, status } = req.body;
  try {
    const transaction = await Transaction.findOne({ product_id });
    if (!transaction) {
      return res.status(400).json({ message: "Transaction not found" });
    }

    const { payment_gateway } = transaction;

    if (status === "FAILED") {
      // Directly update status when failure is reported
      await Transaction.updateOne(
        { product_id },
        { $set: { status: "FAILED", updatedAt: new Date() } }
      );

      return res.status(200).json({
        message: "Transaction status updated to FAILED",
        status: "FAILED",
      });
    }

    let paymentStatusCheck;

    if (payment_gateway === "esewa") {
      const paymentData = {
        product_code: process.env.ESEWA_MERCHANT_ID,
        total_amount: transaction.amount,
        transaction_uuid: transaction.product_id,
      };

      const response = await axios.get(
        process.env.ESEWA_PAYMENT_STATUS_CHECK_URL,
        {
          params: paymentData,
        }
      );

      paymentStatusCheck = response.data;

      if (paymentStatusCheck.status === "COMPLETE") {
        await Transaction.updateOne(
          { product_id },
          { $set: { status: "COMPLETED", updatedAt: new Date() } }
        );

        return res.status(200).json({
          message: "Transaction status updated successfully",
          status: "COMPLETED",
        });
      } else {
        await Transaction.updateOne(
          { product_id },
          { $set: { status: "FAILED", updatedAt: new Date() } }
        );

        return res.status(200).json({
          message: "Transaction status updated to FAILED",
          status: "FAILED",
        });
      }
    }

    if (payment_gateway === "khalti") {
      try {
        const response = await axios.post(
          process.env.KHALTI_VERIFICATION_URL,
          { pidx },
          {
            headers: {
              Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        paymentStatusCheck = response.data;
      } catch (error) {
        if (error.response?.status === 400) {
          paymentStatusCheck = error.response.data;
        } else {
          console.error(
            "Error verifying Khalti payment:",
            error.response?.data || error.message
          );
          throw error;
        }
      }

      if (paymentStatusCheck.status === "Completed") {
        await Transaction.updateOne(
          { product_id },
          { $set: { status: "COMPLETED", updatedAt: new Date() } }
        );

        return res.status(200).json({
          message: "Transaction status updated successfully",
          status: "COMPLETED",
        });
      } else {
        await Transaction.updateOne(
          { product_id },
          { $set: { status: "FAILED", updatedAt: new Date() } }
        );

        return res.status(200).json({
          message: "Transaction status updated to FAILED",
          status: "FAILED",
        });
      }
    }

    return res.status(400).json({ message: "Invalid payment gateway" });
  } catch (error) {
    console.error("Error during payment status check:", error);
    res.status(500).send({
      message: "Payment status check failed",
      error: error.response?.data || error.message,
    });
  }
};

export { initiatePayment, paymentStatus };