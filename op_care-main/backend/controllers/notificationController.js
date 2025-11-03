const Notification = require("../models/Notification");
const User = require("../models/User");

exports.getNotifications = async (req, res, next) => {
  try {
    // Identify current user and role
    const user = await User.findById(req.userId).select("role");
    const role = user?.role || "patient";

    // Show notifications targeted to this role or to all, or directly to this user
    const list = await Notification.find({
      $or: [{ roleTarget: "all" }, { roleTarget: role }, { user: req.userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { recipient, title, message, type, appointmentId, roleTarget } =
      req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const notification = new Notification({
      user: recipient || null,
      roleTarget: roleTarget || null,
      title,
      message,
      type: type || "general",
      appointmentId: appointmentId || null,
      read: false,
      createdAt: new Date(),
    });

    await notification.save();

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const user = await User.findById(req.userId).select("role");
    const role = user?.role || "patient";

    // Find the notification and verify user can access it
    const notification = await Notification.findOne({
      _id: notificationId,
      $or: [{ roleTarget: "all" }, { roleTarget: role }, { user: req.userId }],
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    const role = user?.role || "patient";

    // Mark all accessible notifications as read
    await Notification.updateMany(
      {
        $or: [
          { roleTarget: "all" },
          { roleTarget: role },
          { user: req.userId },
        ],
        read: false,
      },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
