const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  service: String,
  date: String, // ISO string preferred
  status: { type: String, default: 'booked' }, // booked|accepted|rejected|rescheduled|completed
  // Video consultation fields
  consultationType: { type: String, enum: ['in_person', 'video'], default: 'in_person' },
  videoStatus: { type: String, enum: ['pending', 'ready', 'started', 'ended'], default: 'pending' },
  videoProvider: { type: String, default: 'webrtc' },
  videoLink: { type: String, default: '' },
  videoRoomId: { type: String, default: '' },
  videoNotes: { type: String, default: '' },
  videoStartedAt: { type: Date },
  videoEndedAt: { type: Date },
});
module.exports = mongoose.model('Booking', bookingSchema);
