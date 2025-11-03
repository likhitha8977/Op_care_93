const express = require("express");
const router = express.Router();
const {
  listHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  seedSampleHospital,
  getDoctorsByHospital,
} = require("../controllers/hospitalController");

// List with search & pagination
router.get("/", listHospitals);

// Get doctors by hospital
router.get("/:id/doctors", getDoctorsByHospital);

// Create
router.post("/", createHospital);

// Update
router.put("/:id", updateHospital);

// Delete
router.delete("/:id", deleteHospital);

// Seed sample (dev only)
router.post("/seed/sample", seedSampleHospital);

module.exports = router;
