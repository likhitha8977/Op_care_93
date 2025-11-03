const OPSlip = require("../models/OPSlip");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Hospital = require("../models/Hospital");
const User = require("../models/User");

// Create OP Slip after successful payment
const createOPSlip = async (paymentId, bookingId) => {
  try {
    const payment = await Payment.findById(paymentId).populate("booking user");
    const booking = await Booking.findById(bookingId).populate(
      "hospital doctor"
    );

    if (!payment || !booking || payment.status !== "completed") {
      throw new Error("Payment not found or not completed");
    }

    // Check if OP slip already exists for this payment
    const existingSlip = await OPSlip.findOne({ payment: paymentId });
    if (existingSlip) {
      return existingSlip;
    }

    // Set valid until date (30 days from visit date)
    const validUntil = new Date(booking.date);
    validUntil.setDate(validUntil.getDate() + 30);

    const opSlip = new OPSlip({
      patient: payment.user._id,
      booking: booking._id,
      payment: payment._id,
      hospital: booking.hospital._id,
      doctor: booking.doctor ? booking.doctor._id : null,
      visitDate: booking.date,
      visitTime: booking.time,
      department: booking.service || "General Medicine",
      chiefComplaint: booking.notes || "",
      consultationFee: payment.amount,
      validUntil: validUntil,
    });

    await opSlip.save();
    return opSlip;
  } catch (error) {
    console.error("Error creating OP slip:", error);
    throw error;
  }
};

// Get patient's OP slips
const getPatientOPSlips = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const { date, hospital, status } = req.query;

    // Build filter
    const filter = { patient: patientId };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.visitDate = { $gte: startDate, $lt: endDate };
    }

    if (hospital) {
      filter.hospital = hospital;
    }

    if (status) {
      filter.status = status;
    }

    const opSlips = await OPSlip.find(filter)
      .populate("hospital", "name address phone")
      .populate("doctor", "fullName specialization")
      .populate("booking", "type consultationType")
      .populate("payment", "amount paymentMethod transactionId")
      .sort({ visitDate: -1 });

    res.json({
      success: true,
      count: opSlips.length,
      opSlips: opSlips,
    });
  } catch (error) {
    console.error("Error fetching OP slips:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching OP slips",
      error: error.message,
    });
  }
};

// Get single OP slip
const getOPSlip = async (req, res) => {
  try {
    const slipId = req.params.slipId;

    const opSlip = await OPSlip.findById(slipId)
      .populate("patient", "fullName email phone")
      .populate("hospital", "name address phone")
      .populate("doctor", "fullName specialization")
      .populate("booking", "type consultationType notes")
      .populate("payment", "amount paymentMethod transactionId");

    if (!opSlip) {
      return res.status(404).json({
        success: false,
        message: "OP slip not found",
      });
    }

    // Check if user has access to this slip
    if (
      req.user.role === "patient" &&
      opSlip.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      opSlip: opSlip,
    });
  } catch (error) {
    console.error("Error fetching OP slip:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching OP slip",
      error: error.message,
    });
  }
};

// Update OP slip status (for doctors/admin)
const updateOPSlipStatus = async (req, res) => {
  try {
    const slipId = req.params.slipId;
    const { status, notes } = req.body;

    const opSlip = await OPSlip.findById(slipId);
    if (!opSlip) {
      return res.status(404).json({
        success: false,
        message: "OP slip not found",
      });
    }

    opSlip.status = status;
    if (notes) opSlip.notes = notes;
    if (status === "completed") opSlip.completedAt = new Date();

    await opSlip.save();

    res.json({
      success: true,
      message: "OP slip updated successfully",
      opSlip: opSlip,
    });
  } catch (error) {
    console.error("Error updating OP slip:", error);
    res.status(500).json({
      success: false,
      message: "Error updating OP slip",
      error: error.message,
    });
  }
};

// Get OP slips for hospital/doctor
const getHospitalOPSlips = async (req, res) => {
  try {
    const { hospitalId, doctorId, date, status } = req.query;

    const filter = {};

    if (hospitalId) filter.hospital = hospitalId;
    if (doctorId) filter.doctor = doctorId;
    if (status) filter.status = status;

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.visitDate = { $gte: startDate, $lt: endDate };
    }

    const opSlips = await OPSlip.find(filter)
      .populate("patient", "fullName email phone")
      .populate("hospital", "name")
      .populate("doctor", "fullName specialization")
      .sort({ visitDate: -1 });

    res.json({
      success: true,
      count: opSlips.length,
      opSlips: opSlips,
    });
  } catch (error) {
    console.error("Error fetching hospital OP slips:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching OP slips",
      error: error.message,
    });
  }
};

module.exports = {
  createOPSlip,
  getPatientOPSlips,
  getOPSlip,
  updateOPSlipStatus,
  getHospitalOPSlips,
};
