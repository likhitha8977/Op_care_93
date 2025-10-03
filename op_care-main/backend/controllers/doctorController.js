const User = require('../models/User');
const Booking = require('../models/Booking');
const Operation = require('../models/Operation');
const Prescription = require('../models/Prescription');

// Utility: normalize date-only comparison
function isToday(dateStr) {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

exports.getDoctorProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateDoctorProfile = async (req, res, next) => {
  try {
    const { phone, doctorProfile } = req.body;
    const update = {};
    if (phone !== undefined) update.phone = phone;
    if (doctorProfile) {
      for (const k of ['specialization','experience','qualifications','fees','profilePicture']) {
        if (doctorProfile[k] !== undefined) {
          update[`doctorProfile.${k}`] = doctorProfile[k];
        }
      }
    }
    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('availability');
    res.json(user.availability || {});
  } catch (err) { next(err); }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { status, hours } = req.body;
    const update = {};
    if (status !== undefined) update['availability.status'] = status;
    if (hours !== undefined) update['availability.hours'] = hours;
    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true }).select('availability');
    res.json(user.availability || {});
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const bookings = await Booking.find({ doctor: doctorId });
    const operations = await Operation.find({ doctor: doctorId });

    const patientsToday = bookings.filter(b => isToday(b.date)).length;
    const upcomingAppointments = bookings.filter(b => {
      const d = new Date(b.date);
      return d > new Date() && !['rejected','completed'].includes(b.status);
    }).length;

    // casesTotal: total completed bookings (consultations) for this doctor
    const casesTotal = bookings.filter(b => b.status === 'completed').length;

    res.json({
      patientsToday,
      casesTotal,
      operationsTotal: operations.length,
      upcomingAppointments,
    });
  } catch (err) { next(err); }
};

exports.getAppointments = async (req, res, next) => {
  try {
    const { scope } = req.query; // today | upcoming | all
    const doctorId = req.userId;
    let query = { doctor: doctorId };
    const list = await Booking.find(query).populate('user hospital');
    let filtered = list;
    if (scope === 'today') {
      filtered = list.filter(b => isToday(b.date));
    } else if (scope === 'upcoming') {
      filtered = list.filter(b => {
        const d = new Date(b.date);
        return d > new Date() && !['rejected','completed'].includes(b.status);
      });
    }
    res.json(filtered);
  } catch (err) { next(err); }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    // allow updating status or date (reschedule)
    const { status, date } = req.body;
    const update = {};
    if (status) update.status = status;
    if (date) update.date = date;
    const booking = await Booking.findOneAndUpdate({ _id: id, doctor: req.userId }, update, { new: true });
    if (!booking) return res.status(404).json({ error: 'Appointment not found' });
    res.json(booking);
  } catch (err) { next(err); }
};

exports.getPatients = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { q } = req.query; // optional search query
    // If a query is provided, do a global search on patients by name/email
    if (q && q.trim()) {
      const re = new RegExp(q.trim(), 'i');
      const users = await User.find({ role: 'patient', $or: [ { fullName: re }, { email: re } ] })
        .select('fullName email');
      return res.json(users);
    }

    // Otherwise, return patients assigned to this doctor (via bookings)
    const bookings = await Booking.find({ doctor: doctorId }).populate('user');
    const map = new Map();
    bookings.forEach(b => { if (b.user) map.set(String(b.user._id), b.user); });
    const list = Array.from(map.values());
    res.json(list);
  } catch (err) { next(err); }
};

exports.getOperations = async (req, res, next) => {
  try {
    const ops = await Operation.find({ doctor: req.userId }).populate('patient');
    res.json(ops);
  } catch (err) { next(err); }
};

exports.createOperation = async (req, res, next) => {
  try {
    const { patient, date, type, outcome, notes } = req.body;
    const op = await Operation.create({ doctor: req.userId, patient, date, type, outcome, notes });
    res.status(201).json(op);
  } catch (err) { next(err); }
};

exports.updateOperation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, type, outcome, notes } = req.body;
    const op = await Operation.findOneAndUpdate({ _id: id, doctor: req.userId }, { date, type, outcome, notes }, { new: true });
    if (!op) return res.status(404).json({ error: 'Operation not found' });
    res.json(op);
  } catch (err) { next(err); }
};

// Prescriptions
exports.getPrescriptions = async (req, res, next) => {
  try {
    const { patient } = req.query; // optional filter by patient id
    const q = { doctor: req.userId };
    if (patient) q.patient = patient;
    const list = await Prescription.find(q).populate('patient', 'fullName email');
    res.json(list);
  } catch (err) { next(err); }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const { patient, medicines, notes } = req.body;
    if (!patient) return res.status(400).json({ error: 'patient is required' });
    const rx = await Prescription.create({ doctor: req.userId, patient, medicines: medicines || [], notes: notes || '' });
    const populated = await Prescription.findById(rx._id).populate('patient', 'fullName email');
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

exports.updatePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medicines, notes } = req.body;
    const update = {};
    if (medicines !== undefined) update.medicines = medicines;
    if (notes !== undefined) update.notes = notes;
    const rx = await Prescription.findOneAndUpdate({ _id: id, doctor: req.userId }, update, { new: true });
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) { next(err); }
};

exports.uploadPrescriptionAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url } = req.body; // For now accept a URL or file identifier
    if (!url) return res.status(400).json({ error: 'url is required' });
    const rx = await Prescription.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      { $push: { attachments: url } },
      { new: true }
    );
    if (!rx) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rx);
  } catch (err) { next(err); }
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
    const patientsPerDay = days.map(d => {
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      const count = bookings.filter(b => {
        const bd = new Date(b.date);
        return bd.getFullYear() === y && bd.getMonth() === m && bd.getDate() === day && b.status === 'completed';
      }).length;
      return { date: d.toISOString().slice(0,10), count };
    });

    const operationsDone = operations.length;

    // Revenue: sum of fees for completed bookings
    const doctor = await User.findById(doctorId).select('doctorProfile.fees');
    const feeNum = parseFloat(doctor?.doctorProfile?.fees || '0') || 0;
    const completedCount = bookings.filter(b => b.status === 'completed').length;
    const revenue = completedCount * feeNum;

    res.json({ patientsPerDay, operationsDone, revenue });
  } catch (err) { next(err); }
};

// ================= Video Consultation (Doctor) =================
// Set doctor's video availability and hours
exports.setVideoAvailability = async (req, res, next) => {
  try {
    const { available, hours } = req.body;
    const update = {};
    if (available !== undefined) update.videoAvailable = !!available;
    if (hours !== undefined) update.videoHours = hours;
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('videoAvailable videoHours videoEnabledByAdmin');
    res.json(user);
  } catch (err) { next(err); }
};

// Helper to create a simple unique room/link (placeholder)
function makeVideoRoomLink(bookingId) {
  const token = Math.random().toString(36).slice(2);
  return { roomId: `room_${bookingId}_${token}`, link: `https://meet.opcare.local/${bookingId}/${token}` };
}

// Confirm a video appointment: generate link and mark as ready
exports.confirmVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, doctor: req.userId });
    if (!booking) return res.status(404).json({ error: 'Appointment not found' });
    if (booking.consultationType !== 'video') return res.status(400).json({ error: 'Not a video consultation' });
    const { roomId, link } = makeVideoRoomLink(id);
    booking.videoRoomId = roomId;
    booking.videoLink = link;
    booking.videoStatus = 'ready';
    await booking.save();
    res.json(booking);
  } catch (err) { next(err); }
};

// Start a video appointment session
exports.startVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      { videoStatus: 'started', videoStartedAt: new Date() },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Appointment not found' });
    if (booking.consultationType !== 'video') return res.status(400).json({ error: 'Not a video consultation' });
    res.json(booking);
  } catch (err) { next(err); }
};

// End a video appointment session
exports.endVideoAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOneAndUpdate(
      { _id: id, doctor: req.userId },
      { videoStatus: 'ended', videoEndedAt: new Date(), status: 'completed' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Appointment not found' });
    if (booking.consultationType !== 'video') return res.status(400).json({ error: 'Not a video consultation' });
    res.json(booking);
  } catch (err) { next(err); }
};
