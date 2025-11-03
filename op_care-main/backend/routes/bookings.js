const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");

// Test route without middleware
router.get("/test", (req, res) => {
  res.json({ message: "Bookings route is working" });
});

// Simple routes without middleware for now
router.get("/", (req, res) => {
  res.json({ message: "Get bookings endpoint" });
});

router.post("/", (req, res) => {
  res.json({ message: "Create booking endpoint" });
});

router.put("/:id", (req, res) => {
  res.json({ message: "Update booking endpoint", bookingId: req.params.id });
});

router.delete("/:id", (req, res) => {
  res.json({ message: "Delete booking endpoint", bookingId: req.params.id });
});

module.exports = router;
