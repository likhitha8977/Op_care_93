const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      default: "General",
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    details: {
      type: String,
      default: "",
    },
    facilities: {
      type: [String],
      default: [],
    },
    services: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    // Additional fields for better hospital management
    website: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    established: {
      type: Date,
    },
    bedCount: {
      type: Number,
      min: 0,
    },
    // Location coordinates for future map integration
    location: {
      latitude: Number,
      longitude: Number,
    },
    // Operating hours
    operatingHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },
    // Ratings and reviews
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for better performance
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ status: 1 });

// Virtual for full address (if needed)
hospitalSchema.virtual("fullAddress").get(function () {
  return this.city ? `${this.address}, ${this.city}` : this.address;
});

// Method to check if hospital is currently open (basic implementation)
hospitalSchema.methods.isCurrentlyOpen = function () {
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "lowercase" });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const todayHours = this.operatingHours[currentDay];
  if (!todayHours || todayHours.toLowerCase() === "closed") {
    return false;
  }

  // Basic check - can be enhanced with proper time parsing
  return true; // Simplified for now
};

// Static method to find hospitals by city
hospitalSchema.statics.findByCity = function (city) {
  return this.find({ city: new RegExp(city, "i"), status: "active" });
};

// Static method to find hospitals with specific services
hospitalSchema.statics.findByService = function (service) {
  return this.find({
    services: { $in: [new RegExp(service, "i")] },
    status: "active",
  });
};

module.exports = mongoose.model("Hospital", hospitalSchema);
