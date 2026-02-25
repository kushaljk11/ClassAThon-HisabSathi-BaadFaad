import { formatCurrency, formatDateTime } from '../utils/dateFormatter.js';

export const getPaymentTemplate = ({ senderName, receiverName, amount, method, transactionId, completedAt }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .checkmark {
          font-size: 64px;
          margin-bottom: 10px;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .details {
          background: white;
          padding: 25px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .label {
          color: #666;
        }
        .value {
          font-weight: bold;
        }
        .amount {
          font-size: 36px;
          font-weight: bold;
          color: #11998e;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          margin-top: 30px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="checkmark">✅</div>
        <h1>Payment Received!</h1>
        <p>BaadFaad - Split Bills Made Easy</p>
      </div>
      <div class="content">
        <p>Hi ${receiverName},</p>
        <p>Great news! You've received a payment from ${senderName}.</p>
        
        <div class="amount">
          ${formatCurrency(amount)}
        </div>
        
        <div class="details">
          <div class="detail-row">
            <span class="label">From:</span>
            <span class="value">${senderName}</span>
          </div>
          <div class="detail-row">
            <span class="label">To:</span>
            <span class="value">${receiverName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Amount:</span>
            <span class="value">${formatCurrency(amount)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Payment Method:</span>
            <span class="value">${method.toUpperCase()}</span>
          </div>
          ${transactionId ? `
          <div class="detail-row">
            <span class="label">Transaction ID:</span>
            <span class="value">${transactionId}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="label">Date & Time:</span>
            <span class="value">${formatDateTime(completedAt)}</span>
          </div>
        </div>
        
        <p>The payment has been recorded in your BaadFaad account.</p>
        
        <div class="footer">
          <p>This is a payment confirmation from BaadFaad</p>
          <p>&copy; ${new Date().getFullYear()} BaadFaad. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
