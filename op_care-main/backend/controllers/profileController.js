const User = require('../models/User');
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};
