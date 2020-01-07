const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

const { isAuth } = require('../middleware/auth');

const authController = require('../controllers/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('email', 'Please enter a valid email.')
      .isEmail()
      .trim()
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error('E-mail already exists.');
        }
        return true;
      }),
    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Password is required and with at least 5 chars.'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
  ],
  authController.signup
);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.patch(
  '/status',
  isAuth,
  body('status')
    .trim()
    .notEmpty(),
  authController.updateUserStatus
);

module.exports = router;
