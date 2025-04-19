const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getMonthlyAttendance, exportAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

// Add auth middleware to protect these routes
router.post('/mark-attendance', authMiddleware, markAttendance);
router.get('/', authMiddleware, getAttendance);
router.get('/monthly', authMiddleware, getMonthlyAttendance);
router.get('/export', authMiddleware, exportAttendance);

module.exports = router;

