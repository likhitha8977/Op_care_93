const express = require("express");
const router = express.Router();
const { authMiddleware, doctorMiddleware } = require("../middleware/auth");
const dc = require("../controllers/doctorController");

// Public route to get all doctors (for appointment booking)
router.get("/", dc.getDoctors);

// All routes below require auth and doctor role
router.use(authMiddleware, doctorMiddleware);

// Profile & availability
router.get("/profile", dc.getDoctorProfile);
router.put("/profile", dc.updateDoctorProfile);
router.get("/availability", dc.getAvailability);
router.put("/availability", dc.updateAvailability);

// Stats & lists
router.get("/stats", dc.getStats);
router.get("/dashboard", dc.getDashboard);
router.get("/appointments", dc.getAppointments);
router.put("/appointments/:id", dc.updateAppointment);
router.get("/patients", dc.getPatients);
router.get("/search-patients", dc.searchPatients);

// Operations/Surgeries management
router.get("/operations", dc.getOperations);
router.post("/operations", dc.createOperation);
router.put("/operations/:id", dc.updateOperation);
router.delete("/operations/:id", dc.deleteOperation);

// Video consultation
router.put("/video/availability", dc.setVideoAvailability);
router.post("/appointments/:id/video/confirm", dc.confirmVideoAppointment);
router.post("/appointments/:id/video/start", dc.startVideoAppointment);
router.post("/appointments/:id/video/end", dc.endVideoAppointment);

module.exports = router;
