const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  service: String,
  date: { type: Date, required: true }, // Changed to Date type for better handling
  time: String, // Time in HH:MM format
  type: { type: String, default: "consultation" }, // consultation, follow-up, emergency, routine
  notes: { type: String, default: "" }, // Additional notes from patient
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"],
  },
  // Video consultation fields
  consultationType: {
    type: String,
    enum: ["in_person", "video"],
    default: "in_person",
  },
  videoStatus: {
    type: String,
    enum: ["pending", "ready", "started", "ended"],
    default: "pending",
  },
  videoProvider: { type: String, default: "webrtc" },
  videoLink: { type: String, default: "" },
  videoRoomId: { type: String, default: "" },
  videoNotes: { type: String, default: "" },
  videoStartedAt: { type: Date },
  videoEndedAt: { type: Date },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
