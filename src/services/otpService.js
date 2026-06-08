const crypto = require('crypto');


const otpStore = new Map();

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (mock - replace with actual SMS service)
const sendOTP = async (phoneNumber, otp) => {
 
  
  return { success: true, message: 'OTP sent successfully' };
};

// Create and send OTP
const createAndSendOTP = async (phoneNumber) => {
  const otp = generateOTP();
  otpStore.set(phoneNumber, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes expiry
  });
  
  // Auto-cleanup after 5 minutes
  setTimeout(() => {
    if (otpStore.get(phoneNumber)?.otp === otp) {
      otpStore.delete(phoneNumber);
    }
  }, 5 * 60 * 1000);
  
  const result = await sendOTP(phoneNumber, otp);
  return { ...result, otp: process.env.NODE_ENV === 'development' ? otp : undefined };
};

// Verify OTP
const verifyOTP = (phoneNumber, userOTP) => {
  const storedData = otpStore.get(phoneNumber);
  
  if (!storedData) {
    return { success: false, message: 'OTP expired or not found' };
  }
  
  if (storedData.expiresAt < Date.now()) {
    otpStore.delete(phoneNumber);
    return { success: false, message: 'OTP has expired' };
  }
  
  if (storedData.otp !== userOTP) {
    return { success: false, message: 'Invalid OTP' };
  }
  
  otpStore.delete(phoneNumber);
  return { success: true, message: 'OTP verified successfully' };
};

module.exports = { createAndSendOTP, verifyOTP };