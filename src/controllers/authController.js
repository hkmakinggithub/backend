
// const User = require('../models/User');

// const jwt = require('jsonwebtoken');

// const { query } = require('../config/database'); 

// const { createAndSendOTP, verifyOTP } = require('../services/otpService');



// // Generate JWT Token
// const generateToken = (userId) => {
//   return jwt.sign(
//     { id: userId },
//     process.env.JWT_SECRET || 'fallback_secret_key',
//     { expiresIn: process.env.JWT_EXPIRE || '30d' }
//   );
// };


// // Google/Facebook legacy endpoint check
// const socialLogin = async (req, res) => {
//   try {
//     const { email, name, profileImage } = req.body;
//     let user = await User.findByEmail(email);
    
//     if (!user) {
//       user = await User.create({
//         name,
//         phone: `Social_${Date.now().toString().slice(-6)}`, 
//         city: 'Local',
//         pincode: '000000',
//         password: Math.random().toString(36).slice(-8),
//         profile_image: profileImage
//       });
//     }
    
//     const token = generateToken(user.id);
//     res.json({ success: true, message: 'Login successful', data: { user, token } });
//   } catch (error) {
//     console.error('Social login error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// // @desc    Register new user
// const register = async (req, res) => {
//   try {
//     const { name, phone, city, pincode, password, profile_image } = req.body;
    
//     if (!name || !phone || !city || !pincode || !password) {
//       return res.status(400).json({ success: false, message: 'All fields are required' });
//     }
//     if (phone.length < 10) {
//       return res.status(400).json({ success: false, message: 'Phone number must be at least 10 digits' });
//     }
//     if (pincode.length !== 6) {
//       return res.status(400).json({ success: false, message: 'Pincode must be 6 digits' });
//     }
//     if (password.length < 6) {
//       return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
//     }
    
//     const existingUser = await User.findByPhone(phone);
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: 'Phone number already registered' });
//     }
    
//     const user = await User.create({ name, phone, city, pincode, password, profile_image });
//     const token = generateToken(user.id);
    
//     res.status(201).json({ success: true, message: 'User registered successfully', data: { user, token } });
//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };

// // @desc    Login user
// const login = async (req, res) => {
//   try {
//     const { phone, password } = req.body;
//     if (!phone || !password) {
//       return res.status(400).json({ success: false, message: 'Phone and password are required' });
//     }
    
//     const user = await User.findByPhone(phone);
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
    
//     const isPasswordValid = await User.verifyPassword(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
    
//     const { password: _, ...userWithoutPassword } = user;
//     const token = generateToken(user.id);
    
//     // 🟢 THE FIX: Inject the role parameter directly into the user payload wrapper object!
//     res.json({ 
//       success: true, 
//       message: 'Login successful', 
//       data: { 
//         user: {
//           ...userWithoutPassword,
//           role: user.role 
//         }, 
//         token 
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };

// // @desc    Get current user profile
// const getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.json({ success: true, data: user });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };

// // @desc    Update user profile
// const updateProfile = async (req, res) => {
//   try {
//     const { name, city, pincode, profile_image } = req.body;
//     const updatedUser = await User.update(req.user.id, { name, city, pincode, profile_image });
    
//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
//     res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };

// // @desc    Forgot password
// const forgotPassword = async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) {
//       return res.status(400).json({ success: false, message: 'Phone number is required' });
//     }
    
//     const user = await User.findByPhone(phone);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found with this phone number' });
//     }
//     res.json({ success: true, message: 'Password reset instructions sent to your phone' });
//   } catch (error) {
//     console.error('Forgot password error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };

// // @desc    Reset password
// const resetPassword = async (req, res) => {
//   try {
//     const { phone, password } = req.body;
//     if (!phone || !password) {
//       return res.status(400).json({ success: false, message: 'Phone and password are required' });
//     }
//     if (password.length < 6) {
//       return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
//     }
    
//     const user = await User.findByPhone(phone);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     await User.updatePassword(user.id, password);
//     res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };

// // @desc    Logout user
// const logout = async (req, res) => {
//   try {
//     res.json({ success: true, message: 'Logged out successfully' });
//   } catch (error) {
//     console.error('Logout error:', error);
//     res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// };

// // Change password
// const changePassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;
//     const userId = req.user.id;
    
//     const user = await User.findByIdWithPassword(userId);
//     const isMatch = await User.verifyPassword(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ success: false, message: 'Current password is incorrect' });
//     }
    
//     await User.updatePassword(userId, newPassword);
//     res.json({ success: true, message: 'Password changed successfully' });
//   } catch (error) {
//     console.error('Change password error:', error);
//     res.status(500).json({ success: false, message: 'Failed to change password' });
//   }
// };

// // Get user's submitted businesses
// const getMyBusinesses = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const sql = `SELECT * FROM businesses WHERE submitted_by = $1 ORDER BY created_at DESC`;
//     const result = await query(sql, [userId]);
    
//     res.json({ success: true, data: result.rows });
//   } catch (error) {
//     console.error('Get my businesses error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch your businesses' });
//   }
// };

// // Upload profile picture
// const uploadProfilePicture = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { profile_image } = req.body;
    
//     await User.updateProfileImage(userId, profile_image);
//     res.json({ success: true, message: 'Profile picture updated', imageUrl: profile_image });
//   } catch (error) {
//     console.error('Upload profile picture error:', error);
//     res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
//   }
// };

// // Send OTP for login/registration
// const sendLoginOTP = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;
//     if (!phoneNumber || phoneNumber.length < 10) {
//       return res.status(400).json({ success: false, message: 'Valid phone number is required' });
//     }
    
//     const result = await createAndSendOTP(phoneNumber);
//     res.json({
//       success: true,
//       message: 'OTP sent successfully',
//       otp: process.env.NODE_ENV === 'development' ? result.otp : undefined
//     });
//   } catch (error) {
//     console.error('Send OTP error:', error);
//     res.status(500).json({ success: false, message: 'Failed to send OTP' });
//   }
// };

// // Verify OTP and login/register
// const verifyOTPAndLogin = async (req, res) => {
//   try {
//     const { phoneNumber, otp, name } = req.body;
//     const verification = verifyOTP(phoneNumber, otp);
//     if (!verification.success) {
//       return res.status(400).json(verification);
//     }
    
//     let user = await User.findByPhone(phoneNumber);
//     if (!user) {
//       user = await User.create({
//         name: name || `User_${phoneNumber.slice(-4)}`,
//         phone: phoneNumber,
//         city: 'Dhrangadhra', 
//         pincode: '363310',
//         password: Math.random().toString(36).slice(-8),
//         profile_image: null
//       });
//     }
    
//     const token = generateToken(user.id);
//     const { password: _, ...userWithoutPassword } = user;
    
//     res.json({ success: true, message: 'Login successful', data: { user: userWithoutPassword, token } });
//   } catch (error) {
//     console.error('OTP Login error:', error);
//     res.status(500).json({ success: false, message: 'Login failed' });
//   }
// };

// // Google Login
// const googleLogin = async (req, res) => {
//   try {
//     const { email, name, picture } = req.body;
//     let user = await User.findByEmail(email);
    
//     if (!user) {
//       user = await User.create({
//         name: name,
//         phone: `G_${Date.now().toString().slice(-6)}`,
//         city: 'Dhrangadhra',
//         pincode: '363310',
//         password: Math.random().toString(36).slice(-8),
//         profile_image: picture
//       });
//     }
    
//     const token = generateToken(user.id);
//     const { password: _, ...userWithoutPassword } = user;
    
//     res.json({ success: true, message: 'Google login successful', data: { user: userWithoutPassword, token } });
//   } catch (error) {
//     console.error('Google login error:', error);
//     res.status(500).json({ success: false, message: 'Google login failed' });
//   }
// };

// // Facebook Login
// const facebookLogin = async (req, res) => {
//   try {
//     const { email, name, picture } = req.body;
//     let user = await User.findByEmail(email);
    
//     if (!user) {
//       user = await User.create({
//         name: name,
//         phone: `FB_${Date.now().toString().slice(-6)}`,
//         city: 'Dhrangadhra',
//         pincode: '363310',
//         password: Math.random().toString(36).slice(-8),
//         profile_image: picture
//       });
//     }
    
//     const token = generateToken(user.id);
//     const { password: _, ...userWithoutPassword } = user;
    
//     res.json({ success: true, message: 'Facebook login successful', data: { user: userWithoutPassword, token } });
//   } catch (error) {
//     console.error('Facebook login error:', error);
//     res.status(500).json({ success: false, message: 'Facebook login failed' });
//   }
// };

// // 🟢 FIXED: Moved outside of the facebookLogin block so it can be exported correctly
// const getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const user = await User.findById(id); 
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User account not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     console.error('Error fetching single user profile:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error: ' + error.message
//     });
//   }
// };

// module.exports = {
//   socialLogin,
//   register,
//   login,
//   getMe,
//   updateProfile,
//   changePassword,
//   getMyBusinesses,
//   uploadProfilePicture,
//   forgotPassword,
//   resetPassword,
//   logout,
//   sendLoginOTP,        
//   verifyOTPAndLogin,   
//   googleLogin,         
//   facebookLogin,
//   getUserById      
// };



const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database'); 
const { createAndSendOTP, verifyOTP } = require('../services/otpService');

// ------------------------------------------------------------------
// Helper: Generate JWT Token
// ------------------------------------------------------------------
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ------------------------------------------------------------------
// Legacy Social Login
// ------------------------------------------------------------------
const socialLogin = async (req, res) => {
  try {
    const { email, name, profileImage } = req.body;
    let user = await User.findByEmail(email);
    
    if (!user) {
      user = await User.create({
        name,
        phone: `Social_${Date.now().toString().slice(-6)}`, 
        city: 'Local',
        pincode: '000000',
        password: Math.random().toString(36).slice(-8),
        profile_image: profileImage
      });
    }
    
    const token = generateToken(user.id);
    // 🟢 SECURED: Strip password before sending to frontend
    const { password: _, ...safeUser } = user;
    
    res.json({ success: true, message: 'Login successful', data: { user: safeUser, token } });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ success: false, message: 'Server error during social login' });
  }
};

// ------------------------------------------------------------------
// Register New User
// ------------------------------------------------------------------
const register = async (req, res) => {
  try {
    const { name, phone, city, pincode, password, profile_image } = req.body;
    
    if (!name || !phone || !city || !pincode || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Phone number must be at least 10 digits' });
    }
    if (pincode.length !== 6) {
      return res.status(400).json({ success: false, message: 'Pincode must be 6 digits' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    
    const user = await User.create({ name, phone, city, pincode, password, profile_image });
    const token = generateToken(user.id);
    
    // 🟢 SECURED: Strip password before sending to frontend
    const { password: _, ...safeUser } = user;
    
    res.status(201).json({ success: true, message: 'User registered successfully', data: { user: safeUser, token } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ------------------------------------------------------------------
// Login User
// ------------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }
    
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // SECURED: Strip password
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user.id);
    
    res.json({ 
      success: true, 
      message: 'Login successful', 
      data: { 
        user: {
          ...userWithoutPassword,
          role: user.role 
        }, 
        token 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ------------------------------------------------------------------
// Get Current User Profile
// ------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    // 🟢 OPTIMIZED: The middleware already securely fetched the user without the password.
    // No need to query the database again! Just return req.user.
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ------------------------------------------------------------------
// Update User Profile
// ------------------------------------------------------------------
const updateProfile = async (req, res) => {
  try {
    const { name, city, pincode, profile_image } = req.body;
    const updatedUser = await User.update(req.user.id, { name, city, pincode, profile_image });
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 🟢 SECURED: Strip password before returning updated profile
    const { password: _, ...safeUser } = updatedUser;

    res.json({ success: true, message: 'Profile updated successfully', data: safeUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ------------------------------------------------------------------
// Forgot Password / Reset Password / Change Password
// ------------------------------------------------------------------
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this phone number' });
    }
    res.json({ success: true, message: 'Password reset instructions sent to your phone' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findByPhone(phone);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    await User.updatePassword(user.id, password);
    res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const user = await User.findByIdWithPassword(userId);
    const isMatch = await User.verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    await User.updatePassword(userId, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

const logout = async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ------------------------------------------------------------------
// Businesses & Assets
// ------------------------------------------------------------------
const getMyBusinesses = async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `SELECT * FROM businesses WHERE submitted_by = $1 ORDER BY created_at DESC`;
    const result = await query(sql, [userId]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get my businesses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your businesses' });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profile_image } = req.body;
    
    await User.updateProfileImage(userId, profile_image);
    res.json({ success: true, message: 'Profile picture updated', imageUrl: profile_image });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
  }
};

// ------------------------------------------------------------------
// OTP Login
// ------------------------------------------------------------------
const sendLoginOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required' });
    }
    
    const result = await createAndSendOTP(phoneNumber);
    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? result.otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

const verifyOTPAndLogin = async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;
    const verification = verifyOTP(phoneNumber, otp);
    if (!verification.success) {
      return res.status(400).json(verification);
    }
    
    let user = await User.findByPhone(phoneNumber);
    if (!user) {
      user = await User.create({
        name: name || `User_${phoneNumber.slice(-4)}`,
        phone: phoneNumber,
        city: 'Dhrangadhra', 
        pincode: '363310',
        password: Math.random().toString(36).slice(-8),
        profile_image: null
      });
    }
    
    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ success: true, message: 'Login successful', data: { user: userWithoutPassword, token } });
  } catch (error) {
    console.error('OTP Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ------------------------------------------------------------------
// Google / Facebook Login
// ------------------------------------------------------------------
const googleLogin = async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    let user = await User.findByEmail(email);
    
    if (!user) {
      user = await User.create({
        name: name,
        phone: `G_${Date.now().toString().slice(-6)}`,
        city: 'Dhrangadhra',
        pincode: '363310',
        password: Math.random().toString(36).slice(-8),
        profile_image: picture
      });
    }
    
    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ success: true, message: 'Google login successful', data: { user: userWithoutPassword, token } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Google login failed' });
  }
};

const facebookLogin = async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    let user = await User.findByEmail(email);
    
    if (!user) {
      user = await User.create({
        name: name,
        phone: `FB_${Date.now().toString().slice(-6)}`,
        city: 'Dhrangadhra',
        pincode: '363310',
        password: Math.random().toString(36).slice(-8),
        profile_image: picture
      });
    }
    
    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ success: true, message: 'Facebook login successful', data: { user: userWithoutPassword, token } });
  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({ success: false, message: 'Facebook login failed' });
  }
};

// ------------------------------------------------------------------
// Fetch Single User
// ------------------------------------------------------------------
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id); 
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // 🟢 SECURED: Strip password before returning public profile
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('Error fetching single user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  socialLogin,
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getMyBusinesses,
  uploadProfilePicture,
  forgotPassword,
  resetPassword,
  logout,
  sendLoginOTP,        
  verifyOTPAndLogin,   
  googleLogin,         
  facebookLogin,
  getUserById      
};
