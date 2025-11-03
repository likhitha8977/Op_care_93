const Prescription = require("../models/Prescription");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Hospital = require("../models/Hospital");

// Create prescription (doctor only)
const createPrescription = async (req, res) => {
  try {
    // Verify user is a doctor
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can create prescriptions",
      });
    }

    const {
      patientId,
      appointmentId,
      hospitalId,
      diagnosis,
      symptoms,
      medications,
      labTests,
      followUpDate,
      followUpInstructions,
      generalInstructions,
    } = req.body;

    // Validate required fields
    if (!patientId || !diagnosis || !medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Patient ID, diagnosis, and at least one medication are required",
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Get appointment details if provided
    let appointment = null;
    let visitDate = new Date();
    if (appointmentId) {
      appointment = await Booking.findById(appointmentId);
      if (appointment) {
        visitDate = appointment.date;
      }
    }

    const prescription = new Prescription({
      doctor: req.user.id,
      patient: patientId,
      appointment: appointmentId,
      hospital: hospitalId,
      visitDate: visitDate,
      diagnosis: diagnosis,
      symptoms: symptoms || [],
      medications: medications,
      labTests: labTests || [],
      followUpDate: followUpDate,
      followUpInstructions: followUpInstructions,
      generalInstructions: generalInstructions,
    });

    await prescription.save();

    // Populate the prescription for response
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("doctor", "fullName specialization")
      .populate("patient", "fullName email phone")
      .populate("hospital", "name address")
      .populate("appointment", "date time type");

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: populatedPrescription,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    res.status(500).json({
      success: false,
      message: "Error creating prescription",
      error: error.message,
    });
  }
};

// Get patient's prescriptions
const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const { date, doctor, status } = req.query;

    // Build filter
    const filter = { patient: patientId };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.visitDate = { $gte: startDate, $lt: endDate };
    }

    if (doctor) {
      filter.doctor = doctor;
    }

    if (status) {
      filter.status = status;
    }

    const prescriptions = await Prescription.find(filter)
      .populate("doctor", "fullName specialization")
      .populate("hospital", "name address phone")
      .populate("appointment", "date time type")
      .sort({ visitDate: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescriptions",
      error: error.message,
    });
  }
};

// Get single prescription
const getPrescription = async (req, res) => {
  try {
    const prescriptionId = req.params.prescriptionId;

    const prescription = await Prescription.findById(prescriptionId)
      .populate("doctor", "fullName specialization email phone")
      .populate("patient", "fullName email phone")
      .populate("hospital", "name address phone")
      .populate("appointment", "date time type notes");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Check if user has access to this prescription
    if (
      req.user.role === "patient" &&
      prescription.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      req.user.role === "doctor" &&
      prescription.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      prescription: prescription,
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescription",
      error: error.message,
    });
  }
};

// Update prescription (doctor only)
const updatePrescription = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update prescriptions",
      });
    }

    const prescriptionId = req.params.prescriptionId;
    const updateData = req.body;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Check if doctor owns this prescription
    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own prescriptions",
      });
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate("doctor", "fullName specialization")
      .populate("patient", "fullName email")
      .populate("hospital", "name");

    res.json({
      success: true,
      message: "Prescription updated successfully",
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.error("Error updating prescription:", error);
    res.status(500).json({
      success: false,
      message: "Error updating prescription",
      error: error.message,
    });
  }
};

// Get doctor's prescriptions
const getDoctorPrescriptions = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access this endpoint",
      });
    }

    const { date, patient, status } = req.query;

    const filter = { doctor: req.user.id };

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.visitDate = { $gte: startDate, $lt: endDate };
    }

    if (patient) {
      filter.patient = patient;
    }

    if (status) {
      filter.status = status;
    }

    const prescriptions = await Prescription.find(filter)
      .populate("patient", "fullName email phone")
      .populate("hospital", "name")
      .sort({ visitDate: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescriptions",
      error: error.message,
    });
  }
};

// Get prescriptions for appointment
const getAppointmentPrescriptions = async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;

    const prescriptions = await Prescription.find({
      appointment: appointmentId,
    })
      .populate("doctor", "fullName specialization")
      .populate("patient", "fullName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching appointment prescriptions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointment prescriptions",
      error: error.message,
    });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  getPrescription,
  updatePrescription,
  getDoctorPrescriptions,
  getAppointmentPrescriptions,
};
