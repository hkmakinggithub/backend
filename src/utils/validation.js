const validator = require('express-validator');

const validateRegister = [
  validator.body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  validator.body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Invalid phone number')
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
  
  validator.body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  
  validator.body('pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .isPostalCode('IN').withMessage('Invalid Indian pincode'),
  
  validator.body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  validator.body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  
  validator.body('profile_image')
    .optional()
    .isURL().withMessage('Invalid image URL')
];

const validateLogin = [
  validator.body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  
  validator.body('password')
    .notEmpty().withMessage('Password is required')
];

const validateUpdateProfile = [
  validator.body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  validator.body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  
  validator.body('pincode')
    .optional()
    .trim()
    .isPostalCode('IN').withMessage('Invalid Indian pincode'),
  
  validator.body('profile_image')
    .optional()
    .isURL().withMessage('Invalid image URL')
];

const validateForgotPassword = [
  validator.body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Invalid phone number')
];

const validateResetPassword = [
  validator.body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  validator.body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateForgotPassword,
  validateResetPassword
};