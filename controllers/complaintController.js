const Complaint = require('../models/Complaint');

const raiseComplaint = async (req, res) => {
  const { supervisorId, subject, description } = req.body;

  if (!supervisorId || !subject || !description) {
    return res.status(400).json({ message: 'SupervisorId, subject, and description are required fields.' });
  }

  try {
    const complaint = new Complaint({
      customerId: req.user.id,
      supervisorId,
      subject,
      description,
      status: 'PENDING',
      createdAt: new Date(),
    });

    const savedComplaint = await complaint.save();
    
    res.status(201).json({ message: 'Complaint raised successfully.', complaint: savedComplaint });
  } catch (err) {
    console.error('Error raising complaint:', err);
    res.status(500).json({ message: 'Failed to raise complaint. Please try again.' });
  }
};

const getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      query.customerId = req.user._id;
    }

    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('supervisorId', 'name email')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (err) {
    console.error('Error updating complaint:', err);
    res.status(500).json({ message: 'Error updating complaint' });
  }
};

const getUserComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    let query = { customerId: req.user._id };

    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('supervisorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Error fetching user complaints:', err);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
};

module.exports = { raiseComplaint, getComplaints, updateComplaint, getUserComplaints };