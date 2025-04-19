const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const { getSupervisors, getProfile } = require('../controllers/userController');

const router = express.Router();

// Get all supervisors
router.get('/supervisors', authMiddleware, getSupervisors);

// Get user profile
router.get('/profile', authMiddleware, getProfile);

module.exports = router;