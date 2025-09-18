const mongoose = require('mongoose');
const hospitalSchema = new mongoose.Schema({
  name: String,
  type: String,
  city: String,
  details: String,
  facilities: [String],
  services: [String],
});
module.exports = mongoose.model('Hospital', hospitalSchema);
