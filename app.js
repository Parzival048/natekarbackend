const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const complaintRoutes = require('./routes/complaint');
const userRoutes = require('./routes/user');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/users', userRoutes);

module.exports = app;