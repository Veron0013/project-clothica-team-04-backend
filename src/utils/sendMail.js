import SibApiV3Sdk from 'sib-api-v3-sdk';

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SMTP_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendMail = async ({ to, subject, html }) => {
  try {
    const sendSmtpEmail = {
      sender: { name: 'Your App', email: process.env.SMTP_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent:', response.messageId || response);
  } catch (error) {
    console.error('❌ Email API error:', error);
    throw error;
  }
};
////////////////////////////
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendSubscriptEmail = async (options) => {
  return await transporter.sendMail(options);
};
