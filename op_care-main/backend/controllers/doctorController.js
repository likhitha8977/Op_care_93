const User = require("../models/User");
const Booking = require("../models/Booking");
const Operation = require("../models/Operation");
const Prescription = require("../models/Prescription");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");

// Utility: normalize date-only comparison
function isToday(dateStr) {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

exports.getDoctorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateDoctorProfile = async (req, res, next) => {
  try {
    const { phone, doctorProfile } = req.body;
    const update = {};
    if (phone !== undefined) update.phone = phone;
    if (doctorProfile) {
      for (const k of [
        "specialization",
        "experience",
        "qualifications",
        "fees",
        "profilePicture",
      ]) {
        if (doctorProfile[k] !== undefined) {
          update[`doctorProfile.${k}`] = doctorProfile[k];
        }
      }
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("availability");
    res.json(user.availability || []);
  } catch (err) {
    next(err);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { availability },
      { new: true }
    ).select("availability");
    res.json(user.availability);
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const appoQuery = { doctor: doctorId };
    const operations = await Operation.find(appoQuery);
    const bookings = await Booking.find(appoQuery);
    const casesTotal = bookings.length;
    const upcomingAppointments = bookings.filter((b) => {
      const d = new Date(b.date);
      return d > new Date();
    });
    res.json({
      appointmentsToday: bookings.filter((b) => isToday(b.date)).length,
      casesTotal,
      operationsTotal: operations.length,
      upcomingAppointments,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const { scope } = req.query; // today | upcoming | all
    const doctorId = req.userId;
    let query = { doctor: doctorId };
    const list = await Booking.find(query).populate("user hospital");
    let filtered = list;
    if (scope === "today") {
      filtered = list.filter((b) => isToday(b.date));
    } else if (scope === "upcoming") {
      filtered = list.filter((b) => {
        const d = new Date(b.date);
        return d > new Date();
      });
    }
    res.json(filtered);
  } catch (err) {
    next(err);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const bookings = await Booking.find({ doctor: doctorId })
      .populate("user", "fullName email phone")
      .sort({ date: -1 });
    const uniquePatients = [];
    const seen = new Set();
    for (const b of bookings) {
      if (b.user && !seen.has(b.user._id.toString())) {
        seen.add(b.user._id.toString());
        uniquePatients.push(b.user);
      }
    }
    res.json(uniquePatients);
  } catch (err) {
    next(err);
  }
};

// Search patients for prescription writing
exports.searchPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = { role: "patient" };

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const patients = await User.find(filter)
      .select("fullName email phone createdAt")
      .sort({ fullName: 1 })
      .limit(50); // Limit to 50 results for performance

    res.json({
      success: true,
      patients: patients,
    });
  } catch (err) {
    console.error("Error searching patients:", err);
    res.status(500).json({
      success: false,
      message: "Error searching patients",
      error: err.message,
    });
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const appoQuery = { doctor: doctorId };
    const operations = await Operation.find(appoQuery);
    const bookings = await Booking.find(appoQuery);
    const casesTotal = bookings.length;
    const upcomingAppointments = bookings.filter((b) => {
      const d = new Date(b.date);
      return d > new Date();
    });
    res.json({
      appointmentsToday: bookings.filter((b) => isToday(b.date)).length,
      casesTotal,
      operationsTotal: operations.length,
      upcomingAppointments,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const appointment = await Booking.findByIdAndUpdate(id, update, {
      new: true,
    }).populate("user hospital");
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.uploadDoctorProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { "doctorProfile.profilePicture": profilePictureUrl } },
      { new: true }
    ).select("doctorProfile.profilePicture");
    res.json({ profilePicture: user.doctorProfile.profilePicture });
  } catch (err) {
    console.error("Profile picture upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Video consultation methods
exports.setVideoAvailability = async (req, res, next) => {
  try {
    const { available } = req.body;
    await User.findByIdAndUpdate(req.userId, {
      "doctorProfile.videoAvailable": available,
    });
    res.json({ message: "Video availability updated" });
  } catch (err) {
    next(err);
  }
};

exports.confirmVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { videoLink, videoRoomId } = req.body;
    const appointment = await Booking.findByIdAndUpdate(
      id,
      {
        videoStatus: "ready",
        videoLink: videoLink || "",
        videoRoomId: videoRoomId || `room_${Date.now()}`,
      },
      { new: true }
    ).populate("user hospital");
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.startVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Booking.findByIdAndUpdate(
      id,
      {
        videoStatus: "started",
        videoStartedAt: new Date(),
      },
      { new: true }
    ).populate("user hospital");
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.endVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { videoNotes } = req.body;
    const appointment = await Booking.findByIdAndUpdate(
      id,
      {
        videoStatus: "ended",
        videoEndedAt: new Date(),
        videoNotes: videoNotes || "",
        status: "completed",
      },
      { new: true }
    ).populate("user hospital");
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.getVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("user doctor hospital");
    if (!booking)
      return res.status(404).json({ error: "Appointment not found" });
    if (booking.consultationType !== "video")
      return res.status(400).json({ error: "Not a video consultation" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// Get all doctors for appointment booking
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("fullName email phone doctorProfile")
      .lean();

    // Format the response to include specialization directly
    const formattedDoctors = doctors.map((doctor) => ({
      _id: doctor._id,
      name: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      specialization:
        doctor.doctorProfile?.specialization || "General Medicine",
      experience: doctor.doctorProfile?.experience || "Not specified",
      qualifications: doctor.doctorProfile?.qualifications || "Not specified",
      fees: doctor.doctorProfile?.fees || "Not specified",
    }));

    res.json(formattedDoctors);
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= Operations/Surgeries Management =================

// Get all operations for this doctor
exports.getOperations = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    console.log(`Fetching operations for doctor ID: ${doctorId}`);

    const operations = await Operation.find({ doctor: doctorId })
      .populate("patient", "fullName email phone age")
      .populate("doctor", "fullName email")
      .populate("hospital", "name address city state")
      .sort({ date: -1 });

    console.log(`Found ${operations.length} operations for doctor ${doctorId}`);

    // Let's also check all operations to see what doctors they're assigned to
    const allOperations = await Operation.find({}).populate(
      "doctor",
      "fullName email"
    );
    console.log(
      "All operations in system:",
      allOperations.map((op) => ({
        id: op._id,
        doctor: op.doctor?._id,
        doctorName: op.doctor?.fullName,
        type: op.type,
        date: op.date,
      }))
    );

    res.json(operations);
  } catch (err) {
    console.error("Get operations error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new operation
exports.createOperation = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const {
      patient,
      date,
      time,
      type,
      outcome,
      notes,
      hospital,
      status,
      duration,
      priority,
    } = req.body;

    console.log("Doctor creating operation with data:", {
      doctorId,
      patient,
      date,
      time,
      type,
      hospital,
      status,
      duration,
      priority,
    });

    if (!patient || !date || !type) {
      return res
        .status(400)
        .json({ error: "Patient, date, and type are required" });
    }

    const operation = await Operation.create({
      doctor: doctorId,
      patient,
      date,
      time: time || "",
      type,
      outcome: outcome || "",
      notes: notes || "",
      hospital: hospital || null,
      status: status || "scheduled",
      duration: duration || null,
      priority: priority || "medium",
    });

    console.log("Created operation:", operation);

    const populatedOperation = await Operation.findById(operation._id)
      .populate("patient", "fullName email phone age")
      .populate("doctor", "fullName email")
      .populate("hospital", "name address city state");

    console.log("Populated operation:", populatedOperation);

    res.status(201).json(populatedOperation);
  } catch (err) {
    console.error("Create operation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update an operation
exports.updateOperation = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { id } = req.params;
    const {
      patient,
      date,
      time,
      type,
      outcome,
      notes,
      hospital,
      status,
      duration,
      priority,
    } = req.body;

    console.log("Doctor updating operation with data:", {
      id,
      doctorId,
      patient,
      date,
      time,
      type,
      hospital,
      status,
      duration,
      priority,
    });

    // Ensure the operation belongs to this doctor
    const existingOperation = await Operation.findOne({
      _id: id,
      doctor: doctorId,
    });
    if (!existingOperation) {
      return res
        .status(404)
        .json({ error: "Operation not found or access denied" });
    }

    const updateData = {
      patient,
      date,
      time: time || "",
      type,
      outcome: outcome || "",
      notes: notes || "",
      hospital: hospital || null,
      status: status || "scheduled",
      duration: duration || null,
      priority: priority || "medium",
    };

    const updatedOperation = await Operation.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("patient", "fullName email phone age")
      .populate("doctor", "fullName email")
      .populate("hospital", "name address city state");

    console.log("Updated operation:", updatedOperation);

    res.json(updatedOperation);
  } catch (err) {
    console.error("Update operation error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete an operation
exports.deleteOperation = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { id } = req.params;

    // Ensure the operation belongs to this doctor
    const operation = await Operation.findOne({ _id: id, doctor: doctorId });
    if (!operation) {
      return res
        .status(404)
        .json({ error: "Operation not found or access denied" });
    }

    await Operation.findByIdAndDelete(id);
    res.json({ message: "Operation deleted successfully" });
  } catch (err) {
    console.error("Delete operation error:", err);
    res.status(500).json({ error: err.message });
  }
};
