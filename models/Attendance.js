const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  cleaning: { type: Boolean, required: true },
  sweeping: { type: Boolean, required: true },
  mopping: { type: Boolean, required: true }
});

module.exports = mongoose.model('Attendance', attendanceSchema);