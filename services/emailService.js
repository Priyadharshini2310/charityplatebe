const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Function to send newsletter subscription email
const sendSubscriptionEmail = async (email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank You for Subscribing!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #0ea5e9; margin-bottom: 20px;">Welcome to Our Newsletter! 🎉</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for subscribing to our newsletter!
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              You'll now receive the latest updates, news, and exclusive content directly in your inbox.
            </p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
              <p style="color: #0369a1; margin: 0; font-weight: 500;">
                Stay tuned for exciting updates!
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you didn't subscribe to this newsletter, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Your Company. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Subscription Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending subscription email:', error);
    throw new Error('Failed to send subscription email');
  }
};

module.exports = { sendOTPEmail, sendSubscriptionEmail };