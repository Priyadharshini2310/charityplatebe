const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['donor', 'charity'],
    default: 'donor'
  },
  phone: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

// ============================================
// utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or 'smtp.gmail.com'
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASSWORD // App password
    }
  });
};

// Send OTP Email
exports.sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `CharityPlate <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - CharityPlate',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #56c1ff 0%, #9cdbff 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #56c1ff; padding: 20px; 
                      text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #56c1ff; 
                       letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { background: #56c1ff; color: white; padding: 12px 30px; 
                     text-decoration: none; border-radius: 5px; display: inline-block; 
                     margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CharityPlate! 🍽️</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for signing up with CharityPlate. We're excited to have you join our mission to reduce food waste and help those in need.</p>
              
              <p>To complete your registration, please verify your email address using the OTP below:</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">
                  This code will expire in 10 minutes
                </p>
              </div>
              
              <p><strong>Note:</strong> If you didn't create an account with CharityPlate, please ignore this email.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666;">Best regards,</p>
                <p style="margin: 5px 0; font-weight: bold;">The CharityPlate Team</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CharityPlate. All rights reserved.</p>
              <p>Making the world a better place, one meal at a time.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Send Welcome Email (optional)
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `CharityPlate <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to CharityPlate! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #56c1ff 0%, #9cdbff 100%); 
                       color: white; padding: 30px; text-align: center; border-radius: 10px;">
              <h1>Welcome to CharityPlate! 🎉</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hi ${name}!</h2>
              <p>Your email has been verified successfully! You're now part of our community.</p>
              <p>Start making a difference today by:</p>
              <ul>
                <li>Donating excess food</li>
                <li>Connecting with NGOs</li>
                <li>Volunteering for deliveries</li>
                <li>Tracking your impact</li>
              </ul>
              <a href="http://localhost:3000/login" 
                 style="background: #56c1ff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Get Started
              </a>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};