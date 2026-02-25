export const getWelcomeTemplate = ({ name }) => {
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
          padding: 40px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .content {
          background: #f9f9f9;
          padding: 40px;
          border-radius: 0 0 10px 10px;
        }
        .feature {
          background: white;
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .feature-title {
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }
        .button {
          display: inline-block;
          padding: 15px 40px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
          font-weight: bold;
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
        <div class="logo">🧾</div>
        <h1>Welcome to BaadFaad!</h1>
        <p>Split Bills Made Easy</p>
      </div>
      <div class="content">
        <p>Hi ${name},</p>
        <p>Welcome to BaadFaad! We're excited to help you manage and split bills with ease.</p>
        
        <h3>Here's what you can do:</h3>
        
        <div class="feature">
          <div class="feature-title">📸 Scan Bills</div>
          Upload receipt images and let our system extract the details automatically
        </div>
        
        <div class="feature">
          <div class="feature-title">👥 Create Sessions</div>
          Start a session and invite friends to join using a QR code or session link
        </div>
        
        <div class="feature">
          <div class="feature-title">💰 Smart Splitting</div>
          Split bills equally, by percentage, or item-wise - you choose!
        </div>
        
        <div class="feature">
          <div class="feature-title">🔔 Payment Nudges</div>
          Send friendly reminders to friends about pending payments
        </div>
        
        <div class="feature">
          <div class="feature-title">✅ Easy Settlements</div>
          Track payments and settle debts with optimized transactions
        </div>
        
        <center>
          <a href="#" class="button">Get Started</a>
        </center>
        
        <div class="footer">
          <p>Need help? Contact us at support@baadfaad.com</p>
          <p>&copy; ${new Date().getFullYear()} BaadFaad. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
