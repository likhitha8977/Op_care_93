const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getNotifications);
router.post("/", authMiddleware, createNotification);
router.put("/:notificationId/read", authMiddleware, markAsRead);
router.put("/mark-all-read", authMiddleware, markAllAsRead);

module.exports = router;
