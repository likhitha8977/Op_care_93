const User = require("../models/User");
const Booking = require("../models/Booking");
const Hospital = require("../models/Hospital");
const Operation = require("../models/Operation");
const Notification = require("../models/Notification");

// ================= Get All Users =================
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// ================= Get All Appointments =================
exports.getAllAppointments = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "fullName email phone")
      .populate("hospital", "name address phone");
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// ================= Get Doctors =================
exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};

// ================= Get All Hospitals =================
exports.getAllHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    next(err);
  }
};

// ================= Create Hospital =================
exports.createHospital = async (req, res, next) => {
  try {
    const { name, address, phone, email } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const hospital = await Hospital.create({ name, address, phone, email });
    res.status(201).json(hospital);
  } catch (err) {
    next(err);
  }
};

// ================= Get Dashboard Stats =================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalAppointments, totalHospitals] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Hospital.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      totalAppointments,
      totalHospitals,
      pendingApprovals: 0, // Can be enhanced based on business logic
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// ================= Update User Role =================
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    next(err);
  }
};

// ================= Delete User =================
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Also delete user's bookings and related data
    await Booking.deleteMany({ user: userId });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ================= Update Hospital =================
exports.updateHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const { name, address, phone, email } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { name, address, phone, email },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    res.json({ message: "Hospital updated successfully", hospital });
  } catch (err) {
    next(err);
  }
};

// ================= Delete Hospital =================
exports.deleteHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findByIdAndDelete(hospitalId);

    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    // Also delete related bookings
    await Booking.deleteMany({ hospital: hospitalId });

    res.json({ message: "Hospital deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ================= Update Appointment Status =================
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate("user hospital");

    if (!booking) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment status updated successfully", booking });
  } catch (err) {
    next(err);
  }
};

// ================= Update Appointment (status/date) =================
exports.updateAppointment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status, date } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (date !== undefined) update.date = date;
    const booking = await Booking.findByIdAndUpdate(bookingId, update, {
      new: true,
    }).populate("user hospital");
    if (!booking)
      return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment updated", booking });
  } catch (err) {
    next(err);
  }
};

// ================= Doctor Availability (Admin) =================
exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const user = await User.findById(doctorId).select(
      "availability fullName email"
    );
    if (!user) return res.status(404).json({ error: "Doctor not found" });
    res.json(user.availability || {});
  } catch (err) {
    next(err);
  }
};

exports.updateDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { status, hours } = req.body;
    const update = {};
    if (status !== undefined) update["availability.status"] = status;
    if (hours !== undefined) update["availability.hours"] = hours;
    const user = await User.findByIdAndUpdate(
      doctorId,
      { $set: update },
      { new: true }
    ).select("availability");
    if (!user) return res.status(404).json({ error: "Doctor not found" });
    res.json(user.availability || {});
  } catch (err) {
    next(err);
  }
};

// ================= Operations (Admin) =================
exports.getAllOperations = async (req, res, next) => {
  try {
    const ops = await Operation.find()
      .populate("doctor", "fullName email doctorProfile")
      .populate("patient", "fullName email phone age")
      .populate("hospital", "name address")
      .sort({ date: -1 });
    res.json(ops);
  } catch (err) {
    next(err);
  }
};

exports.createOperation = async (req, res, next) => {
  try {
    const {
      doctor,
      patient,
      hospital,
      date,
      time,
      type,
      outcome,
      notes,
      priority,
      duration,
      status,
    } = req.body;

    console.log("Creating operation with data:", {
      doctor,
      patient,
      hospital,
      date,
      time,
      type,
      priority,
      status,
    });

    if (!doctor || !patient || !date || !type) {
      return res
        .status(400)
        .json({ error: "doctor, patient, date, and type are required" });
    }

    const op = await Operation.create({
      doctor,
      patient,
      hospital,
      date,
      time,
      type,
      outcome,
      notes,
      priority: priority || "medium",
      duration,
      status: status || "scheduled",
    });

    console.log("Created operation:", op);

    const populated = await Operation.findById(op._id)
      .populate("doctor", "fullName email")
      .populate("patient", "fullName email")
      .populate("hospital", "name");

    console.log("Populated operation:", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create operation error:", err);
    next(err);
  }
};

exports.updateOperationAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      doctor,
      patient,
      hospital,
      date,
      time,
      type,
      outcome,
      notes,
      priority,
      duration,
      status,
    } = req.body;

    const op = await Operation.findByIdAndUpdate(
      id,
      {
        doctor,
        patient,
        hospital,
        date,
        time,
        type,
        outcome,
        notes,
        priority,
        duration,
        status,
      },
      { new: true }
    )
      .populate("doctor", "fullName email")
      .populate("patient", "fullName email")
      .populate("hospital", "name address");

    if (!op) return res.status(404).json({ error: "Operation not found" });
    res.json(op);
  } catch (err) {
    next(err);
  }
};

exports.deleteOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const del = await Operation.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ error: "Operation not found" });
    res.json({ message: "Operation deleted" });
  } catch (err) {
    next(err);
  }
};

// ================= Notifications (Admin) =================
exports.getAllNotifications = async (req, res, next) => {
  try {
    const list = await Notification.find()
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { message, user, roleTarget } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });
    const note = await Notification.create({
      message,
      user: user || null,
      roleTarget: roleTarget || "all",
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const del = await Notification.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
};

// ================= Video Consultation (Admin) =================
// Enable/disable video feature for a specific doctor
exports.setDoctorVideoEnabled = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { enabled } = req.body; // boolean
    const user = await User.findByIdAndUpdate(
      doctorId,
      { videoEnabledByAdmin: !!enabled },
      { new: true }
    ).select("fullName email videoEnabledByAdmin");
    if (!user) return res.status(404).json({ error: "Doctor not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Video usage stats (simple): count of video bookings overall and per doctor
exports.getVideoUsageStats = async (req, res, next) => {
  try {
    const totalVideo = await Booking.countDocuments({
      consultationType: "video",
    });
    const perDoctor = await Booking.aggregate([
      { $match: { consultationType: "video" } },
      { $group: { _id: "$doctor", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          doctorId: "$_id",
          count: 1,
          doctorName: "$doctor.fullName",
          doctorEmail: "$doctor.email",
        },
      },
    ]);
    res.json({ totalVideo, perDoctor });
  } catch (err) {
    next(err);
  }
};
