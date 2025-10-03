const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  status: { type: String, enum: ['Available', 'Busy', 'On Leave'], default: 'Available' },
  hours: { type: String, default: '' },
}, { _id: false });

const doctorProfileSchema = new mongoose.Schema({
  specialization: { type: String, default: '' },
  experience: { type: String, default: '' },
  qualifications: { type: String, default: '' },
  fees: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
  // Doctor specific optional fields
  doctorProfile: { type: doctorProfileSchema, default: {} },
  availability: { type: availabilitySchema, default: {} },
  // Video Consultation controls
  // Admin can enable/disable video for a doctor
  videoEnabledByAdmin: { type: Boolean, default: false },
  // Doctor can set availability and hours for video consults
  videoAvailable: { type: Boolean, default: false },
  videoHours: { type: String, default: '' },
});

module.exports = mongoose.model('User', userSchema);
