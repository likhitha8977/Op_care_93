const Booking = require("../models/Booking");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

// Get appointment trends data (appointments per week/month)
exports.getAppointmentTrends = async (req, res) => {
  try {
    const { period = "week", hospital, doctor, limit = 12 } = req.query;

    // Build filter
    const filter = {};
    if (hospital) filter.hospital = hospital;
    if (doctor) filter.doctor = doctor;

    // Get appointments
    const appointments = await Booking.find(filter).sort({ date: 1 });

    // Group by period (week/month)
    const trends = {};
    appointments.forEach((apt) => {
      if (!apt.date) return;

      const date = new Date(apt.date);
      let key;

      if (period === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      } else {
        // Week - get the Monday of that week
        const monday = new Date(date);
        monday.setDate(date.getDate() - date.getDay() + 1);
        key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(monday.getDate()).padStart(2, "0")}`;
      }

      trends[key] = (trends[key] || 0) + 1;
    });

    // Convert to array and sort
    const result = Object.entries(trends)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-limit);

    res.json({ trends: result, period, total: appointments.length });
  } catch (err) {
    console.error("Appointment trends error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get hospital usage data (patient load per hospital)
exports.getHospitalUsage = async (req, res) => {
  try {
    // Get all hospitals with their appointment counts
    const hospitals = await Hospital.find({});
    const hospitalUsage = [];

    for (const hospital of hospitals) {
      const appointmentCount = await Booking.countDocuments({
        hospital: hospital._id,
      });

      const completedCount = await Booking.countDocuments({
        hospital: hospital._id,
        status: "completed",
      });

      // Simple capacity assumption - in real app this would be a hospital field
      const capacity = 100; // Default capacity per hospital
      const utilization = Math.min(100, (appointmentCount / capacity) * 100);

      hospitalUsage.push({
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        city: hospital.city,
        totalAppointments: appointmentCount,
        completedAppointments: completedCount,
        capacity,
        utilizationPercent: Math.round(utilization * 100) / 100,
      });
    }

    // Sort by total appointments descending
    hospitalUsage.sort((a, b) => b.totalAppointments - a.totalAppointments);

    res.json({ hospitalUsage });
  } catch (err) {
    console.error("Hospital usage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get doctor performance data
exports.getDoctorPerformance = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get all doctors (from User model with role 'doctor')
    const doctors = await User.find({ role: "doctor" });
    const performance = [];

    for (const doctor of doctors) {
      const totalAppointments = await Booking.countDocuments({
        doctor: doctor._id,
      });

      const completedAppointments = await Booking.countDocuments({
        doctor: doctor._id,
        status: "completed",
      });

      const successRate =
        totalAppointments > 0
          ? (completedAppointments / totalAppointments) * 100
          : 0;

      if (totalAppointments > 0) {
        performance.push({
          doctorId: doctor._id,
          doctorName: doctor.fullName,
          specialization: doctor.doctorProfile?.specialization || "General",
          totalAppointments,
          completedAppointments,
          successRate: Math.round(successRate * 100) / 100,
          experience: doctor.doctorProfile?.experience || "N/A",
        });
      }
    }

    // Sort by success rate, then by total appointments
    performance.sort((a, b) => {
      if (b.successRate !== a.successRate) {
        return b.successRate - a.successRate;
      }
      return b.totalAppointments - a.totalAppointments;
    });

    res.json({
      doctorPerformance: performance.slice(0, limit),
      total: performance.length,
    });
  } catch (err) {
    console.error("Doctor performance error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Combined analytics dashboard data
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const [trendsRes, usageRes, performanceRes] = await Promise.all([
      exports.getAppointmentTrends(
        { query: { period: "week", limit: 8 } },
        { json: (data) => data }
      ),
      exports.getHospitalUsage({ query: {} }, { json: (data) => data }),
      exports.getDoctorPerformance(
        { query: { limit: 10 } },
        { json: (data) => data }
      ),
    ]);

    res.json({
      appointmentTrends: trendsRes.trends,
      hospitalUsage: usageRes.hospitalUsage,
      topDoctors: performanceRes.doctorPerformance,
    });
  } catch (err) {
    console.error("Analytics dashboard error:", err);
    res.status(500).json({ error: err.message });
  }
};
