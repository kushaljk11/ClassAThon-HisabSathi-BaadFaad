import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"BaadFaad" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error: ', error);
    throw error;
  }
};

export default transporter;
