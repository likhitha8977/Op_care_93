const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

// Analytics endpoints
router.get("/appointment-trends", analyticsController.getAppointmentTrends);
router.get("/hospital-usage", analyticsController.getHospitalUsage);
router.get("/doctor-performance", analyticsController.getDoctorPerformance);
router.get("/dashboard", analyticsController.getAnalyticsDashboard);

module.exports = router;
