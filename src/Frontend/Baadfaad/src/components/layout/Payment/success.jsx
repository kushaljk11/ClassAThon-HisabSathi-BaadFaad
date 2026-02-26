import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../config/config";
import { base64Decode } from "../../../utills/helper";

const Success = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationError, setVerificationError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  // For eSewa: Decode the data parameter
  const token = queryParams.get("data");
  const decoded = token ? base64Decode(token) : null;
  const product_id =
    decoded?.transaction_uuid || queryParams.get("purchase_order_id");

  const isKhalti = queryParams.get("pidx") !== null;
  const rawAmount =
    decoded?.total_amount ||
    queryParams.get("total_amount") ||
    queryParams.get("amount");
  const total_amount = isKhalti ? rawAmount / 100 : rawAmount;

  useEffect(() => {
    verifyPaymentAndUpdateStatus();
  }, [product_id]);

  const verifyPaymentAndUpdateStatus = async () => {
    if (!product_id) {
      setIsLoading(false);
      setVerificationError(true);
      return;
    }

    try {
      const response = await api.post("/payment/payment-status", {
        product_id,
        pidx: queryParams.get("pidx"),
      });

      if (response.status === 200) {
        setIsLoading(false);

        if (response.data.status === "COMPLETED") {
          setPaymentStatus("COMPLETED");
        } else {
          navigate("/payment-failure", {
            search: `?purchase_order_id=${product_id}`,
          });
          return;
        }
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setIsLoading(false);
      setVerificationError(true);
      if (error.response && error.response.status === 400) {
        navigate("/payment-failure", {
          search: `?purchase_order_id=${product_id}`,
        });
      }
    }
  };

  if (isLoading) return <div className="loading-container">Loading...</div>;

  // System error state - when can't verify the payment status
  if (verificationError) {
    return (
      <div className="error-container">
        <h1>Oops! Error occurred on confirming payment</h1>
        <h2>We will resolve it soon.</h2>
        <p>
          Your transaction is being processed, but we couldn't verify its
          status.
        </p>
        <p>
          If the amount was deducted from your account, please contact our
          support team.
        </p>
        <p>
          Reference ID: {product_id || queryParams.get("pidx") || "Unknown"}
        </p>
        <button onClick={() => navigate("/")} className="go-home-button">
          Go to Homepage
        </button>
      </div>
    );
  }

  // Success state - only shown for confirmed successful payments
  return (
    <div className="success-container">
      <div className="status-icon success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your payment. Your transaction was successful.</p>

      <div className="transaction-details">
        <h3>Transaction Details</h3>
        <p>
          <strong>Amount Paid:</strong> NPR {total_amount}
        </p>
        <p>
          <strong>Transaction ID:</strong> {product_id}
        </p>
        {paymentStatus === "COMPLETED" && (
          <>
            <p>
              <strong>Payment Method:</strong> {isKhalti ? "Khalti" : "eSewa"}
            </p>
            <p>
              <strong>Status:</strong> Completed
            </p>
          </>
        )}
      </div>

      {/* <p>
        We've sent a confirmation email with these details to your registered
        email address.
      </p> */}

      <button onClick={() => navigate("/")} className="go-home-button">
        Go to Homepage
      </button>
    </div>
  );
};

export default Success;