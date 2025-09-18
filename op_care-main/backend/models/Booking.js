const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  service: String,
  date: String,
  status: { type: String, default: 'booked' },
});
module.exports = mongoose.model('Booking', bookingSchema);
