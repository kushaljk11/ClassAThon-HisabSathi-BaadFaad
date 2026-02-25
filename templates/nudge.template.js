import { formatCurrency } from '../utils/dateFormatter.js';

export const getNudgeTemplate = ({ toName, fromName, amount, message, type }) => {
  const urgency = type === 'urgent' ? '⚠️ URGENT' : type === 'final' ? '🔴 FINAL REMINDER' : '📢';

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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .amount {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin: 20px 0;
        }
        .message {
          background: white;
          padding: 20px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
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
        <h1>${urgency} Payment Reminder</h1>
        <p>BaadFaad - Split Bills Made Easy</p>
      </div>
      <div class="content">
        <p>Hi ${toName},</p>
        <p>${fromName} is reminding you about a pending payment:</p>
        
        <div class="amount">
          ${formatCurrency(amount)}
        </div>
        
        <div class="message">
          <strong>Message:</strong><br>
          ${message}
        </div>
        
        <p>Please settle this payment at your earliest convenience.</p>
        
        <a href="#" class="button">Pay Now</a>
        
        <div class="footer">
          <p>This is an automated reminder from BaadFaad</p>
          <p>&copy; ${new Date().getFullYear()} BaadFaad. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
