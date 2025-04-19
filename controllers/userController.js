const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

const getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'supervisor' })
      .select('name email');
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getProfile,
  getSupervisors
};