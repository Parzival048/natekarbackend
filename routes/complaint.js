const express = require('express');
const { raiseComplaint, getComplaints, updateComplaint } = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create new complaint
router.post('/', authMiddleware, raiseComplaint);

// Get user complaints with pagination and filters
router.get('/user', authMiddleware, getComplaints);

// Get all complaints (for admin)
router.get('/', authMiddleware, getComplaints);

// Update complaint status
router.patch('/:id', authMiddleware, updateComplaint);

module.exports = router;