const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const {
  getPatientOPSlips,
  getOPSlip,
  updateOPSlipStatus,
  getHospitalOPSlips,
} = require("../controllers/opSlipController");

// Get patient's OP slips
router.get("/patient/:patientId", authMiddleware, getPatientOPSlips);

// Get OP slips for hospital/doctor
router.get("/hospital/list", authMiddleware, getHospitalOPSlips);

// Update OP slip status (for doctors/admin)
router.put("/:slipId/status", authMiddleware, updateOPSlipStatus);

// Get single OP slip (keep this last to avoid conflicts)
router.get("/:slipId", authMiddleware, getOPSlip);

module.exports = router;
