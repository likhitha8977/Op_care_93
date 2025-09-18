const mongoose = require('mongoose');
const recordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Record', recordSchema);
