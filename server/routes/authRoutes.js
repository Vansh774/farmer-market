const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin, validate } = require('../utils/validators');

// Public routes
router.post('/register', validateRegistration, validate, register);
router.post('/login', validateLogin, validate, login);

// Protected route
router.get('/me', authenticate, getCurrentUser);

module.exports = router;