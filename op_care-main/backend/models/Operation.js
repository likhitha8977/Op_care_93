const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // ISO date string
  type: { type: String, required: true },
  outcome: { type: String, default: '' },
  notes: { type: String, default: '' },
});

module.exports = mongoose.model('Operation', operationSchema);
