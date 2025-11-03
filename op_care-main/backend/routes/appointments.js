const express = require("express");
const router = express.Router();
const ac = require("../controllers/appointmentController");

// General appointments endpoints
router.get("/", ac.listAppointments);
router.put("/:id", ac.updateAppointment);

// Patient-specific endpoints
router.get("/patient/:id", ac.getPatientAppointments);
router.post("/", ac.createPatientAppointment);
router.put("/:id/status", ac.updateAppointmentStatus);
router.delete("/:id", ac.cancelAppointment);

module.exports = router;
