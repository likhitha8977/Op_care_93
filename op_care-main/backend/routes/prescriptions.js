const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
  createPrescription,
  getPatientPrescriptions,
  getPrescription,
  updatePrescription,
  getDoctorPrescriptions,
  getAppointmentPrescriptions,
} = require("../controllers/prescriptionController");

// Create prescription (doctor only)
router.post("/", authMiddleware, createPrescription);

// Get patient's prescriptions
router.get("/patient/:patientId", authMiddleware, getPatientPrescriptions);

// Get doctor's prescriptions
router.get("/doctor/my-prescriptions", authMiddleware, getDoctorPrescriptions);

// Get prescriptions for specific appointment
router.get(
  "/appointment/:appointmentId",
  authMiddleware,
  getAppointmentPrescriptions
);

// Get single prescription
router.get("/:prescriptionId", authMiddleware, getPrescription);

// Update prescription (doctor only)
router.put("/:prescriptionId", authMiddleware, updatePrescription);

module.exports = router;
