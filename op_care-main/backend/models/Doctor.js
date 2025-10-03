const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  availableSlots: [{
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isEmergency: { type: Boolean, default: false },
    isBooked: { type: Boolean, default: false }
  }],
  qualifications: [String],
  consultationFee: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
