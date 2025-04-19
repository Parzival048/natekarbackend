const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'RESOLVED', 'REJECTED'],
    default: 'PENDING'
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  response: { type: String }
});

module.exports = mongoose.model('Complaint', complaintSchema);