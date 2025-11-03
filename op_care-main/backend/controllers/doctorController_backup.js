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
    res.json(user.availability || {});
  } catch (err) {
    next(err);
  }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { status, hours } = req.body;
    const update = {};
    if (status !== undefined) update["availability.status"] = status;
    if (hours !== undefined) update["availability.hours"] = hours;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true }
    ).select("availability");
    res.json(user.availability || {});
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const bookings = await Booking.find({ doctor: doctorId });
    const operations = await Operation.find({ doctor: doctorId });

    const patientsToday = bookings.filter((b) => isToday(b.date)).length;
    const upcomingAppointments = bookings.filter((b) => {
      const d = new Date(b.date);
      return d > new Date() && !["rejected", "completed"].includes(b.status);
    }).length;

    // casesTotal: total completed bookings (consultations) for this doctor
    const casesTotal = bookings.filter((b) => b.status === "completed").length;

    res.json({
      patientsToday,
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
        return d > new Date() && !["rejected", "completed"].includes(b.status);
      });
    }
    res.json(filtered);
  } catch (err) {
    next(err);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    // allow updating status or date (reschedule)
    const { status, date } = req.body;
    const update = {};
    if (status) update.status = status;
    if (date) update.date = date;
    const booking = await Booking.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      update,
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ error: "Appointment not found" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.getPatients = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { q } = req.query; // optional search query
    // If a query is provided, do a global search on patients by name/email
    if (q && q.trim()) {
      const re = new RegExp(q.trim(), "i");
      const users = await User.find({
        role: "patient",
        $or: [{ fullName: re }, { email: re }],
      }).select("fullName email");
      return res.json(users);
    }

    // Otherwise, return patients assigned to this doctor (via bookings)
    const bookings = await Booking.find({ doctor: doctorId }).populate("user");
    const map = new Map();
    bookings.forEach((b) => {
      if (b.user) map.set(String(b.user._id), b.user);
    });
    const list = Array.from(map.values());
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.getOperations = async (req, res, next) => {
  try {
    const ops = await Operation.find({ doctor: req.userId }).populate(
      "patient"
    );
    res.json(ops);
  } catch (err) {
    next(err);
  }
};

exports.createOperation = async (req, res, next) => {
  try {
    const { patient, date, type, outcome, notes } = req.body;
    const op = await Operation.create({
      doctor: req.userId,
      patient,
      date,
      type,
      outcome,
      notes,
    });
    res.status(201).json(op);
  } catch (err) {
    next(err);
  }
};

exports.updateOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, type, outcome, notes } = req.body;
    const op = await Operation.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      { date, type, outcome, notes },
      { new: true }
    );
    if (!op) return res.status(404).json({ error: "Operation not found" });
    res.json(op);
  } catch (err) {
    next(err);
  }
};

// Prescriptions
exports.getPrescriptions = async (req, res, next) => {
  try {
    const { patient } = req.query; // optional filter by patient id
    const q = { doctor: req.userId };
    if (patient) q.patient = patient;
    const list = await Prescription.find(q).populate(
      "patient",
      "fullName email"
    );
    res.json(list);
  } catch (err) {
    next(err);
  }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const { patient, medicines, notes } = req.body;
    if (!patient) return res.status(400).json({ error: "patient is required" });
    const rx = await Prescription.create({
      doctor: req.userId,
      patient,
      medicines: medicines || [],
      notes: notes || "",
    });
    const populated = await Prescription.findById(rx._id).populate(
      "patient",
      "fullName email"
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.updatePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medicines, notes } = req.body;
    const update = {};
    if (medicines !== undefined) update.medicines = medicines;
    if (notes !== undefined) update.notes = notes;
    const rx = await Prescription.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      update,
      { new: true }
    );
    if (!rx) return res.status(404).json({ error: "Prescription not found" });
    res.json(rx);
  } catch (err) {
    next(err);
  }
};

exports.uploadPrescriptionAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url } = req.body; // For now accept a URL or file identifier
    if (!url) return res.status(400).json({ error: "url is required" });
    const rx = await Prescription.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      { $push: { attachments: url } },
      { new: true }
    );
    if (!rx) return res.status(404).json({ error: "Prescription not found" });
    res.json(rx);
  } catch (err) {
    next(err);
  }
};

// Reports
exports.getReports = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const bookings = await Booking.find({ doctor: doctorId });
    const operations = await Operation.find({ doctor: doctorId });

    // Patients per day (last 7 days)
    const today = new Date();
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d;
    });
    const patientsPerDay = days.map((d) => {
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      const count = bookings.filter((b) => {
        const bd = new Date(b.date);
        return (
          bd.getFullYear() === y &&
          bd.getMonth() === m &&
          bd.getDate() === day &&
          b.status === "completed"
        );
      }).length;
      return { date: d.toISOString().slice(0, 10), count };
    });

    const operationsDone = operations.length;

    // Revenue: sum of fees for completed bookings
    const doctor = await User.findById(doctorId).select("doctorProfile.fees");
    const feeNum = parseFloat(doctor?.doctorProfile?.fees || "0") || 0;
    const completedCount = bookings.filter(
      (b) => b.status === "completed"
    ).length;
    const revenue = completedCount * feeNum;

    res.json({ patientsPerDay, operationsDone, revenue });
  } catch (err) {
    next(err);
  }
};

// Dashboard overview for doctor domain (hospital-level summary)
exports.getDashboard = async (req, res, next) => {
  try {
    // Totals
    const hospitalsTotal = await Hospital.countDocuments();
    const doctorsTotal = await Doctor.countDocuments();
    const patientsTotal = await User.countDocuments({ role: "patient" });
    const appointments = await Booking.find();
    const appointmentsTotal = appointments.length;

    // Today's appointments (compare date-only)
    const today = new Date();
    const isSameDay = (d) => {
      if (!d) return false;
      const x = new Date(d);
      return (
        x.getFullYear() === today.getFullYear() &&
        x.getMonth() === today.getMonth() &&
        x.getDate() === today.getDate()
      );
    };
    const todaysAppointments = appointments.filter((b) =>
      isSameDay(b.date)
    ).length;

    // Hospital usage: active = hospitals that have at least one active doctor
    const activeHospitalIds = await Doctor.distinct("hospitalId", {
      isActive: true,
    });
    const activeHospitals = activeHospitalIds ? activeHospitalIds.length : 0;
    const inactiveHospitals = Math.max(0, hospitalsTotal - activeHospitals);

    // Upcoming operations across hospitals (date >= today)
    const ops = await Operation.find().populate("doctor patient");
    const upcomingOps = ops
      .filter((op) => {
        const d = new Date(op.date);
        return d >= new Date(today.toDateString());
      })
      .map((op) => ({
        _id: op._id,
        date: op.date,
        type: op.type,
        doctor: op.doctor ? op.doctor.fullName || "" : "",
        patient: op.patient ? op.patient.fullName || "" : "",
        notes: op.notes || "",
      }));

    res.json({
      hospitalsTotal,
      doctorsTotal,
      patientsTotal,
      appointmentsTotal,
      todaysAppointments,
      hospitalUsage: { active: activeHospitals, inactive: inactiveHospitals },
      upcomingOperations: upcomingOps.slice(0, 10), // return up to 10
    });
  } catch (err) {
    next(err);
  }
};

// ================= Video Consultation (Doctor) =================
// Set doctor's video availability and hours
exports.setVideoAvailability = async (req, res, next) => {
  try {
    const { available, hours } = req.body;
    const update = {};
    if (available !== undefined) update.videoAvailable = !!available;
    if (hours !== undefined) update.videoHours = hours;
    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
    }).select("videoAvailable videoHours videoEnabledByAdmin");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Helper to create a simple unique room/link (placeholder)
function makeVideoRoomLink(bookingId) {
  const token = Math.random().toString(36).slice(2);
  return {
    roomId: `room_${bookingId}_${token}`,
    link: `https://meet.opcare.local/${bookingId}/${token}`,
  };
}

// Confirm a video appointment: generate link and mark as ready
exports.confirmVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, doctor: req.userId });
    if (!booking)
      return res.status(404).json({ error: "Appointment not found" });
    if (booking.consultationType !== "video")
      return res.status(400).json({ error: "Not a video consultation" });
    const { roomId, link } = makeVideoRoomLink(id);
    booking.videoRoomId = roomId;
    booking.videoLink = link;
    booking.videoStatus = "ready";
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// Start a video appointment session
exports.startVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      { videoStatus: "started", videoStartedAt: new Date() },
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ error: "Appointment not found" });
    if (booking.consultationType !== "video")
      return res.status(400).json({ error: "Not a video consultation" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// End a video appointment session
exports.endVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      { videoStatus: "ended", videoEndedAt: new Date(), status: "completed" },
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ error: "Appointment not found" });
    if (booking.consultationType !== "video")
      return res.status(400).json({ error: "Not a video consultation" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

 
 / /   G e t   a l l   d o c t o r s   f o r   a p p o i n t m e n t   b o o k i n g 
 e x p o r t s . g e t D o c t o r s   =   a s y n c   ( r e q ,   r e s )   = >   { 
     t r y   { 
         c o n s t   d o c t o r s   =   a w a i t   U s e r . f i n d ( {   r o l e :   " d o c t o r "   } ) 
             . s e l e c t ( " f u l l N a m e   e m a i l   p h o n e   d o c t o r P r o f i l e " ) 
             . l e a n ( ) ; 
 
         / /   F o r m a t   t h e   r e s p o n s e   t o   i n c l u d e   s p e c i a l i z a t i o n   d i r e c t l y 
         c o n s t   f o r m a t t e d D o c t o r s   =   d o c t o r s . m a p ( d o c t o r   = >   ( { 
             _ i d :   d o c t o r . _ i d , 
             n a m e :   d o c t o r . f u l l N a m e , 
             e m a i l :   d o c t o r . e m a i l , 
             p h o n e :   d o c t o r . p h o n e , 
             s p e c i a l i z a t i o n :   d o c t o r . d o c t o r P r o f i l e ? . s p e c i a l i z a t i o n   | |   " G e n e r a l   M e d i c i n e " , 
             e x p e r i e n c e :   d o c t o r . d o c t o r P r o f i l e ? . e x p e r i e n c e   | |   " N o t   s p e c i f i e d " , 
             q u a l i f i c a t i o n s :   d o c t o r . d o c t o r P r o f i l e ? . q u a l i f i c a t i o n s   | |   " N o t   s p e c i f i e d " , 
             f e e s :   d o c t o r . d o c t o r P r o f i l e ? . f e e s   | |   " N o t   s p e c i f i e d " 
         } ) ) ; 
 
         r e s . j s o n ( f o r m a t t e d D o c t o r s ) ; 
     }   c a t c h   ( e r r )   { 
         c o n s o l e . e r r o r ( " G e t   d o c t o r s   e r r o r : " ,   e r r ) ; 
         r e s . s t a t u s ( 5 0 0 ) . j s o n ( {   e r r o r :   e r r . m e s s a g e   } ) ; 
     } 
 } ;  
 