const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, getUser, updateProfile } = require('./user.controller');
const { protect } = require('../../middleware/auth');
const { upload } = require('../../config/cloudinary');

router.post('/auth/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], register);

router.post('/auth/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], login);

router.get('/users/get-user/:id', protect, getUser);
router.put('/users/profile/update', protect, upload.single('avatar'), updateProfile);

module.exports = router;
