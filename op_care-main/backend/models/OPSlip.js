const mongoose = require("mongoose");

const opSlipSchema = new mongoose.Schema(
  {
    // Core References
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
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
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // Identification Numbers
    slipNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    opNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    queueNumber: {
      type: Number,
      required: true,
      index: true,
    },

    // Visit Information
    visitDate: {
      type: Date,
      required: true,
      index: true,
    },
    visitTime: {
      type: String,
      required: true,
    },
    actualVisitTime: {
      type: Date,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    consultationType: {
      type: String,
      enum: ["routine", "follow_up", "emergency", "referral", "consultation"],
      default: "routine",
    },

    // Medical Information
    chiefComplaint: {
      type: String,
      default: "",
    },
    symptoms: {
      type: [String],
      default: [],
    },
    vitalSigns: {
      temperature: { type: Number, min: 90, max: 120 }, // in Fahrenheit
      bloodPressure: {
        systolic: { type: Number, min: 60, max: 250 },
        diastolic: { type: Number, min: 30, max: 150 },
      },
      pulse: { type: Number, min: 40, max: 200 }, // bpm
      respiratoryRate: { type: Number, min: 8, max: 60 }, // per minute
      oxygenSaturation: { type: Number, min: 70, max: 100 }, // percentage
      weight: { type: Number, min: 0.5, max: 500 }, // in kg
      height: { type: Number, min: 30, max: 250 }, // in cm
      bmi: { type: Number, min: 10, max: 80 },
    },
    allergies: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },

    // Financial Information
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Status and Workflow
    status: {
      type: String,
      enum: [
        "pending",
        "checked_in",
        "waiting",
        "in_consultation",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
      index: true,
    },
    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },
    validUntil: {
      type: Date,
      required: true,
      index: true,
    },

    // Timestamps
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    checkedInAt: {
      type: Date,
    },
    consultationStartedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },

    // Additional Information
    notes: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    attendedBy: {
      nurse: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      receptionist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    // Follow-up Information
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
      default: "",
    },

    // Emergency Information
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },

    // QR Code for quick access
    qrCode: {
      type: String,
    },

    // Audit Trail
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    modifications: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        modifiedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate unique slip number
opSlipSchema.pre("save", async function (next) {
  try {
    // Generate slip number if not exists
    if (!this.slipNumber) {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      this.slipNumber = `OPD/${year}/${month}/${day}/${String(
        count + 1
      ).padStart(4, "0")}`;
    }

    // Generate OP number if not exists
    if (!this.opNumber) {
      const count = await this.constructor.countDocuments();
      const timestamp = Date.now();
      this.opNumber = `OP${timestamp}${String(count + 1).padStart(3, "0")}`;
    }

    // Generate queue number for the day
    if (!this.queueNumber) {
      const startOfDay = new Date(this.visitDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(this.visitDate);
      endOfDay.setHours(23, 59, 59, 999);

      const todayCount = await this.constructor.countDocuments({
        visitDate: { $gte: startOfDay, $lte: endOfDay },
        hospital: this.hospital,
        department: this.department,
      });
      this.queueNumber = todayCount + 1;
    }

    // Calculate total amount
    this.totalAmount =
      this.consultationFee +
      (this.additionalCharges || 0) -
      (this.discount || 0);

    // Calculate BMI if height and weight are provided
    if (this.vitalSigns?.height && this.vitalSigns?.weight) {
      const heightInMeters = this.vitalSigns.height / 100;
      this.vitalSigns.bmi = parseFloat(
        (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(2)
      );
    }

    // Set default valid until date (24 hours from generation)
    if (!this.validUntil) {
      this.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance Methods
opSlipSchema.methods.checkIn = function () {
  this.status = "checked_in";
  this.checkedInAt = new Date();
  return this.save();
};

opSlipSchema.methods.startConsultation = function () {
  this.status = "in_consultation";
  this.consultationStartedAt = new Date();
  return this.save();
};

opSlipSchema.methods.completeConsultation = function (notes) {
  this.status = "completed";
  this.completedAt = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

opSlipSchema.methods.cancel = function (reason) {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.isValid = false;
  if (reason) this.adminNotes = reason;
  return this.save();
};

opSlipSchema.methods.markNoShow = function () {
  this.status = "no_show";
  this.isValid = false;
  return this.save();
};

opSlipSchema.methods.updateVitalSigns = function (vitalSigns) {
  this.vitalSigns = { ...this.vitalSigns, ...vitalSigns };

  // Recalculate BMI if height and weight are updated
  if (this.vitalSigns.height && this.vitalSigns.weight) {
    const heightInMeters = this.vitalSigns.height / 100;
    this.vitalSigns.bmi = parseFloat(
      (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(2)
    );
  }

  return this.save();
};

opSlipSchema.methods.addModification = function (
  field,
  oldValue,
  newValue,
  modifiedBy,
  reason
) {
  this.modifications.push({
    field,
    oldValue,
    newValue,
    modifiedBy,
    reason,
    modifiedAt: new Date(),
  });
  this.modifiedBy = modifiedBy;
  return this.save();
};

opSlipSchema.methods.isExpired = function () {
  return new Date() > this.validUntil;
};

opSlipSchema.methods.canBeModified = function () {
  return (
    this.status !== "completed" &&
    this.status !== "cancelled" &&
    !this.isExpired()
  );
};

opSlipSchema.methods.getEstimatedWaitTime = async function () {
  const queuePosition = await this.constructor.countDocuments({
    hospital: this.hospital,
    department: this.department,
    visitDate: this.visitDate,
    queueNumber: { $lt: this.queueNumber },
    status: { $in: ["pending", "checked_in", "waiting"] },
  });

  // Assuming 15 minutes per consultation
  return queuePosition * 15;
};

// Static Methods
opSlipSchema.statics.getTodaysSlips = function (hospitalId, departmentId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    visitDate: { $gte: startOfDay, $lte: endOfDay },
    hospital: hospitalId,
  };

  if (departmentId) {
    query.department = departmentId;
  }

  return this.find(query)
    .populate("patient", "fullName phone email")
    .populate("doctor", "fullName specialization")
    .populate("booking")
    .sort({ queueNumber: 1 });
};

opSlipSchema.statics.getQueueStatus = function (hospitalId, department) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        hospital: hospitalId,
        department: department,
        visitDate: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgWaitTime: { $avg: "$estimatedWaitTime" },
      },
    },
  ]);
};

opSlipSchema.statics.getPatientHistory = function (patientId, limit = 10) {
  return this.find({ patient: patientId })
    .populate("hospital", "name address")
    .populate("doctor", "fullName specialization")
    .sort({ visitDate: -1 })
    .limit(limit);
};

opSlipSchema.statics.getDoctorSlips = function (doctorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    doctor: doctorId,
    visitDate: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("patient", "fullName phone email age gender")
    .populate("booking")
    .sort({ queueNumber: 1 });
};

// Virtual fields
opSlipSchema.virtual("waitingTime").get(function () {
  if (this.checkedInAt && this.consultationStartedAt) {
    return Math.floor(
      (this.consultationStartedAt - this.checkedInAt) / (1000 * 60)
    ); // in minutes
  }
  return null;
});

opSlipSchema.virtual("consultationDuration").get(function () {
  if (this.consultationStartedAt && this.completedAt) {
    return Math.floor(
      (this.completedAt - this.consultationStartedAt) / (1000 * 60)
    ); // in minutes
  }
  return null;
});

opSlipSchema.virtual("isToday").get(function () {
  const today = new Date();
  const visitDate = new Date(this.visitDate);
  return today.toDateString() === visitDate.toDateString();
});

// Indexes for better performance
opSlipSchema.index({ hospital: 1, department: 1, visitDate: 1 });
opSlipSchema.index({ patient: 1, visitDate: -1 });
opSlipSchema.index({ doctor: 1, visitDate: 1 });
opSlipSchema.index({ status: 1, visitDate: 1 });
opSlipSchema.index({
  queueNumber: 1,
  hospital: 1,
  department: 1,
  visitDate: 1,
});

module.exports = mongoose.model("OPSlip", opSlipSchema);
