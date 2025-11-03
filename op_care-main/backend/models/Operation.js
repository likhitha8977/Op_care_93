const mongoose = require("mongoose");

const operationSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  date: { type: String, required: true }, // ISO date string
  time: { type: String }, // Operation time
  type: { type: String, required: true }, // Surgery type
  outcome: { type: String, default: "" }, // Post-operation outcome
  notes: { type: String, default: "" }, // Doctor's notes
  status: {
    type: String,
    enum: ["scheduled", "in-progress", "completed", "cancelled"],
    default: "scheduled",
  },
  duration: { type: Number }, // Duration in minutes
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
operationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Operation", operationSchema);
