
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { sendOTPEmail } = require('../utils/emailService');

// // Generate OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Signup with OTP
// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Validate input
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields'
//       });
//     } 

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       if (existingUser.isVerified) {
//         return res.status(400).json({
//           success: false,
//           message: 'User already exists with this email'
//         });
//       } else {
//         // User exists but not verified, delete old record
//         await User.findByIdAndDelete(existingUser._id);
//       }
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate OTP
//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // Create user (not verified yet)
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || 'donor',
//       otp,
//       otpExpiry,
//       isVerified: false
//     });

//     // Send OTP email
//     await sendOTPEmail(email, otp, name);

//     res.status(201).json({
//       success: true,
//       message: 'OTP sent to your email. Please verify to complete registration.',
//       email: email
//     });
//   } catch (error) {
//     console.error('Signup error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating account',
//       error: error.message
//     });
//   }
// };

// // Verify OTP
// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and OTP'
//       });
//     }

//     // Find user
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Check if already verified
//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already verified'
//       });
//     }

//     // Check OTP expiry
//     if (user.otpExpiry < new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: 'OTP has expired. Please request a new one.'
//       });
//     }

//     // Verify OTP
//     if (user.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid OTP'
//       });
//     }

//     // Mark user as verified
//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpiry = undefined;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: 'Email verified successfully. You can now login.'
//     });
//   } catch (error) {
//     console.error('OTP verification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error verifying OTP',
//       error: error.message
//     });
//   }
// };

// // Resend OTP
// exports.resendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email'
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: 'User already verified'
//       });
//     }

//     // Generate new OTP
//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = otp;
//     user.otpExpiry = otpExpiry;
//     await user.save();

//     // Send OTP email
//     await sendOTPEmail(email, otp, user.name);

//     res.status(200).json({
//       success: true,
//       message: 'OTP resent successfully'
//     });
//   } catch (error) {
//     console.error('Resend OTP error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error resending OTP',
//       error: error.message
//     });
//   }
// };

// // Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email and password'
//       });
//     }

//     // Find user
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Check if user is verified
//     if (!user.isVerified) {
//       return res.status(401).json({
//         success: false,
//         message: 'Please verify your email first'
//       });
//     }

//     // Check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
    
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid credentials'
//       });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET || 'your-super-secret-jwt-key',
//       { expiresIn: '30d' }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error logging in',
//       error: error.message
//     });
//   }
// };
// // Get current user (ME endpoint)
// exports.getCurrentUser = async (req, res) => {
//   try {
//     // req.user is set by the auth middleware
//     const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         isVerified: user.isVerified,
//         createdAt: user.createdAt
//       }
//     });
//   } catch (error) {
//     console.error('Get current user error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching user data',
//       error: error.message
//     });
//   }
// };
// // Update user profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const { name, password } = req.body;
//     const userId = req.user.id;

//     const user = await User.findById(userId);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Update name
//     if (name) {
//       user.name = name;
//     }

//     // Update password if provided
//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//     }

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: 'Profile updated successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         createdAt: user.createdAt
//       }
//     });
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating profile',
//       error: error.message
//     });
//   }
// };
// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const nodemailer = require('nodemailer');

// helper: create transporter (uses same config as your utils/emailService)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// helper: send reset email (local in controller to avoid changing utils)
const sendResetEmail = async (email, name, resetUrl) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'CharityPlate'} <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password reset instructions - CharityPlate',
      html: `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <style>
              body { font-family: Arial, Helvetica, sans-serif; color:#222; }
              .wrap { max-width:600px;margin:0 auto;padding:20px; }
              .hero { background: linear-gradient(135deg,#56c1ff,#9cdbff); padding:20px; border-radius:10px; text-align:center; color:white; }
              .btn { display:inline-block; background:#0ea5e9; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; }
              .card { background:#fff; padding:20px; border-radius:8px; margin-top:12px; box-shadow:0 6px 20px rgba(0,0,0,0.08); }
              .muted { color:#6b7280; font-size:13px; }
            </style>
          </head>
          <body>
            <div class="wrap">
              <div class="hero">
                <h2>Password reset</h2>
              </div>
              <div class="card">
                <p>Hi ${name || ''},</p>
                <p>We received a request to reset your CharityPlate password. Click the button below to set a new password. This link expires in 1 hour.</p>
                <p style="text-align:center;margin:18px 0;">
                  <a href="${resetUrl}" class="btn">Reset password</a>
                </p>
                <p class="muted">If the button does not work, copy and paste this URL into your browser:</p>
                <p class="muted" style="word-break:break-all;">${resetUrl}</p>
                <p class="muted">If you didn’t request a password reset, you can ignore this email.</p>
                <hr />
                <p class="muted">— CharityPlate Team</p>
              </div>
            </div>
          </body>
        </html>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('sendResetEmail error:', err);
    throw err;
  }
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup with OTP
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      } else {
        await User.findByIdAndDelete(existingUser._id);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'donor',
      otp,
      otpExpiry,
      isVerified: false
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get current user (ME endpoint)
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Forgot password - sends reset email (public)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide email' });

    const user = await User.findOne({ email });

    // respond with generic message to avoid account enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, password reset instructions have been sent.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashed;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontend}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    await sendResetEmail(user.email, user.name, resetUrl);

    return res.status(200).json({ success: true, message: 'If an account with that email exists, password reset instructions have been sent.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Error processing request', error: err.message });
  }
};

// Reset password - consumes token and sets new password
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ success: false, message: 'Provide email, token and new password' });

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordToken) return res.status(400).json({ success: false, message: 'Invalid token or email' });

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    if (hashed !== user.resetPasswordToken) return res.status(400).json({ success: false, message: 'Invalid token' });
    if (user.resetPasswordExpiry < new Date()) return res.status(400).json({ success: false, message: 'Token expired' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Error resetting password', error: err.message });
  }
};
