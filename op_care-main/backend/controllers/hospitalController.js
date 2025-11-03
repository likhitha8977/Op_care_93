const Hospital = require("../models/Hospital");

// Create a new hospital
exports.createHospital = async (req, res) => {
  try {
    const { name, type, city, details, facilities, services } = req.body;
    if (!name || !city)
      return res.status(400).json({ message: "Name and city are required" });

    const hospital = new Hospital({
      name,
      type: type || "General",
      city,
      details: details || "",
      facilities: Array.isArray(facilities) ? facilities : [],
      services: Array.isArray(services) ? services : [],
    });

    await hospital.save();
    res.status(201).json({ message: "Hospital created", hospital });
  } catch (error) {
    console.error("Create hospital error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// List hospitals with pagination and search
exports.listHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 10, q } = req.query;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const filter = {};
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { city: regex }, { type: regex }];
    }

    const [total, hospitals] = await Promise.all([
      Hospital.countDocuments(filter),
      Hospital.find(filter)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort({ name: 1 }),
    ]);

    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      hospitals,
    });
  } catch (error) {
    console.error("List hospitals error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update hospital
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const hospital = await Hospital.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });
    res.json({ message: "Hospital updated", hospital });
  } catch (error) {
    console.error("Update hospital error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete hospital
exports.deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await Hospital.findByIdAndDelete(id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found" });
    res.json({ message: "Hospital deleted" });
  } catch (error) {
    console.error("Delete hospital error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Seed a sample hospital (for quick testing)
exports.seedSampleHospital = async (req, res) => {
  try {
    const sample = new Hospital({
      name: "Sunrise Care Hospital",
      type: "Multi-speciality",
      city: "Metrocity",
      details: "A modern multi-speciality hospital with emergency services",
      facilities: ["Emergency", "ICU", "Pharmacy"],
      services: ["Cardiology", "Orthopedics", "General Surgery"],
    });
    await sample.save();
    res
      .status(201)
      .json({ message: "Sample hospital created", hospital: sample });
  } catch (error) {
    console.error("Seed hospital error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get doctors by hospital
exports.getDoctorsByHospital = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the hospital first to verify it exists
    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Find all doctors (users with role 'doctor')
    const User = require("../models/User");
    const doctors = await User.find({
      role: "doctor",
      // You can add hospital-specific filtering here if you have a hospital field in User model
    }).select("fullName email phone doctorProfile");

    res.json({
      hospital: hospital.name,
      doctors,
    });
  } catch (error) {
    console.error("Get doctors by hospital error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
