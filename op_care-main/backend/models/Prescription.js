const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    notes: String,
  }],
  notes: { type: String, default: '' },
  attachments: [{ type: String }], // URLs or file identifiers for test results
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
