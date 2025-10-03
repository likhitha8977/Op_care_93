const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional specific user
  roleTarget: { type: String, enum: ['patient','doctor','admin','all'], default: 'all' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
