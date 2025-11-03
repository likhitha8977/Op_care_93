const Booking = require("../models/Booking");
const User = require("../models/User");
const Hospital = require("../models/Hospital");

// Get patient appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, doctor, status, page = 1, limit = 20 } = req.query;

    const filter = { user: id };
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start.toISOString(), $lt: end.toISOString() };
    }
    if (doctor) filter.doctor = doctor;
    if (status) filter.status = status;

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const [total, appointments] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate("doctor", "fullName specialization")
        .populate("hospital", "name city")
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
    ]);

    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      appointments,
    });
  } catch (err) {
    console.error("Get patient appointments error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create new appointment for patient
exports.createPatientAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      hospitalId,
      date,
      time,
      type,
      notes,
      user,
      doctor,
      hospital,
      service,
      consultationType = "in_person",
    } = req.body;

    // Support both frontend field names and legacy field names
    const finalPatientId = patientId || user;
    const finalDoctorId = doctorId || doctor;
    const finalHospitalId = hospitalId || hospital;
    const finalDate = date;
    const finalType = type || service || "General consultation";

    if (!finalPatientId || !finalHospitalId || !finalDate) {
      return res
        .status(400)
        .json({ error: "Patient, hospital, and date are required" });
    }

    // Create date-time combination if time is provided
    let appointmentDate = new Date(finalDate);
    if (time) {
      const [hours, minutes] = time.split(":");
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }

    const appointment = new Booking({
      user: finalPatientId,
      doctor: finalDoctorId || null,
      hospital: finalHospitalId,
      service: finalType,
      date: appointmentDate,
      time: time || null,
      type: type || "consultation",
      notes: notes || "",
      status: "pending", // Start with pending status
      consultationType,
      videoStatus: consultationType === "video" ? "pending" : undefined,
    });

    await appointment.save();

    const populated = await Booking.findById(appointment._id)
      .populate("doctor", "fullName specialization email")
      .populate("hospital", "name city location")
      .populate("user", "fullName email phone");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (date) updates.date = date;

    const appointment = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .populate("doctor", "fullName specialization")
      .populate("hospital", "name city");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error("Update appointment status error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Cancel/Delete appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Booking.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("Cancel appointment error:", err);
    res.status(500).json({ error: err.message });
  }
};

// List appointments with optional filters: doctor, hospital, date, status, pagination
exports.listAppointments = async (req, res) => {
  try {
    const { doctor, hospital, date, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (doctor) filter.doctor = doctor;
    if (hospital) filter.hospital = hospital;
    if (status) filter.status = status;
    if (date) {
      // match date-only (ISO date or partial)
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start.toISOString(), $lt: end.toISOString() };
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const [total, items] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate("user doctor hospital")
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
    ]);

    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      items,
    });
  } catch (err) {
    console.error("List appointments error", err);
    res.status(500).json({ error: err.message });
  }
};

// Update appointment status (and optionally other fields)
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const booking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("user doctor hospital");
    if (!booking)
      return res.status(404).json({ error: "Appointment not found" });

    // Notify user stub (replace with real email/SMS integration)
    try {
      const user = booking.user;
      if (user) {
        console.log(
          `Notify ${user.email || user.phone}: Appointment ${
            booking._id
          } status updated to ${booking.status}`
        );
      }
    } catch (notifyErr) {
      console.error("Notify failed", notifyErr);
    }

    res.json(booking);
  } catch (err) {
    console.error("Update appointment error", err);
    res.status(500).json({ error: err.message });
  }
};

// Simple helper to find tomorrow's appointments and 'notify' users (logs)
exports.remindTomorrowAppointments = async () => {
  try {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const tomorrow = new Date(t);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = tomorrow.toISOString();
    const endDate = new Date(tomorrow);
    endDate.setDate(endDate.getDate() + 1);
    const end = endDate.toISOString();

    const list = await Booking.find({
      date: { $gte: start, $lt: end },
    }).populate("user doctor hospital");
    list.forEach((b) => {
      const u = b.user;
      if (u) {
        console.log(
          `Reminder: send email/SMS to ${u.email || u.phone} for appointment ${
            b._id
          } on ${b.date}`
        );
      }
    });
    return list.length;
  } catch (err) {
    console.error("Reminder job failed", err);
    return 0;
  }
};
