
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');




// const protect = async (req, res, next) => {
//   try {
//     let token;
    
//     // Check if token exists in headers
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Not authorized. No token provided.'
//       });
//     }
    
//     // Verify token cryptographically
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
//     // Check if user still exists in the database
//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not found. Token invalid.'
//       });
//     }
    
//     // Attach user profile to the request lifecycle
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
    
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token. Please login again.'
//       });
//     }
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token expired. Please login again.'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Server error in authentication'
//     });
//   }
// };




// const adminOnly = (req, res, next) => {
//   // This must run AFTER protect(), so req.user will already exist
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     return res.status(403).json({
//       success: false,
//       message: 'Access denied. Administrator privileges required.'
//     });
//   }
// };

// module.exports = { protect, adminOnly };
const jwt = require('jsonwebtoken');
// Ensure this path matches exactly where your User model is located
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    // 1. Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. Reject if no token is found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.'
      });
    }
    
    // 3. Verify token cryptographically
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    
    // 4. Check if user still exists AND securely remove the password from the data
   const user = await User.findById(decoded.id);

if (!user) {
  return res.status(401).json({ message: 'Not authorized, user not found' });
}

// Manually drop the password before passing the user forward
delete user.password; 
req.user = user;


    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors cleanly for the mobile app
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    // Fallback for database or server crashes
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

const adminOnly = (req, res, next) => {
  // This must run AFTER protect(), so req.user will already exist
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  }
};

module.exports = { protect, adminOnly };


