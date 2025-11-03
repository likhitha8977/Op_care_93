const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    default: "",
  },
  beforeFood: {
    type: Boolean,
    default: false,
  },
  afterFood: {
    type: Boolean,
    default: true,
  },
});

const prescriptionSchema = new mongoose.Schema({
  prescriptionNumber: {
    type: String,
    unique: true,
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
  },
  visitDate: {
    type: Date,
    required: true,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  symptoms: [
    {
      type: String,
    },
  ],
  medications: [medicationSchema],
  labTests: [
    {
      testName: String,
      instructions: String,
      urgent: {
        type: Boolean,
        default: false,
      },
    },
  ],
  followUpDate: {
    type: Date,
  },
  followUpInstructions: {
    type: String,
    default: "",
  },
  generalInstructions: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  validUntil: {
    type: Date,
  },
  attachments: [
    {
      filename: String,
      url: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate unique prescription number
prescriptionSchema.pre("save", async function (next) {
  if (!this.prescriptionNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    this.prescriptionNumber = `RX/${year}/${month}/${String(count + 1).padStart(
      4,
      "0"
    )}`;
  }

  // Set valid until date (30 days from creation)
  if (!this.validUntil) {
    this.validUntil = new Date();
    this.validUntil.setDate(this.validUntil.getDate() + 30);
  }

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
