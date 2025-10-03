const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async (req, res, next) => {
  try {
    // Identify current user and role
    const user = await User.findById(req.userId).select('role');
    const role = user?.role || 'patient';

    // Show notifications targeted to this role or to all, or directly to this user
    const list = await Notification.find({
      $or: [
        { roleTarget: 'all' },
        { roleTarget: role },
        { user: req.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    res.json(list);
  } catch (err) {
    next(err);
  }
};
