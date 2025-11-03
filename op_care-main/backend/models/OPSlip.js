const mongoose = require("mongoose");

const opSlipSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    slipNumber: {
      type: String,
      unique: true,
      required: true,
    },
    opNumber: {
      type: String,
      unique: true,
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
    visitTime: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    chiefComplaint: {
      type: String,
      default: "",
    },
    symptoms: {
      type: String,
      default: "",
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique slip number
opSlipSchema.pre("save", async function (next) {
  if (!this.slipNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    this.slipNumber = `OPD/${year}/${month}/${String(count + 1).padStart(
      4,
      "0"
    )}`;
  }

  if (!this.opNumber) {
    const count = await this.constructor.countDocuments();
    this.opNumber = `OP${Date.now()}${String(count + 1).padStart(3, "0")}`;
  }

  next();
});

module.exports = mongoose.model("OPSlip", opSlipSchema);
