const express = require("express");
const router = express.Router();

// Simple test route without middleware
router.get("/test", (req, res) => {
  res.json({ message: "Payment route is working" });
});

module.exports = router;
