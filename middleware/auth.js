// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//   try {
//     // Get token from header
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'No token provided, authorization denied' 
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(
//       token, 
//       process.env.JWT_SECRET || 'your-super-secret-jwt-key'
//     );

//     // Add user info to request
//     req.user = decoded;
//     next();
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Token has expired' 
//       });
//     }
    
//     res.status(401).json({ 
//       success: false,
//       message: 'Token is not valid' 
//     });
//   }
// };

// module.exports = authMiddleware;
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure you have a User model

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this route' 
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-super-secret-jwt-key'
    );

    // Get user from token and attach to request
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Not authorized to access this route' 
    });
  }
};

// Authorize based on roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'User role not defined'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};