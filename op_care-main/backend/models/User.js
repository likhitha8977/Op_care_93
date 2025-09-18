const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
});
module.exports = mongoose.model('User', userSchema);
