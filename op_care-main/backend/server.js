const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // Add this for path handling
dotenv.config();

const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5173",
    ], // Allow frontend ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow methods
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "opcaresecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth strategy (only if credentials are provided)
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret"
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            user = await User.create({
              fullName: profile.displayName,
              email: profile.emails[0].value,
              password: "",
              role: "patient",
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.log("Google OAuth not configured - skipping Google strategy");
}

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Import routes
const authRoutes = require("./routes/auth");
const hospitalRoutes = require("./routes/hospitals");
const bookingRoutes = require("./routes/bookings");
const profileRoutes = require("./routes/profile");
const recordRoutes = require("./routes/records");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const doctorRoutes = require("./routes/doctor");
const paymentRoutes = require("./routes/payments");
const appointmentRoutes = require("./routes/appointments");
const appointmentController = require("./controllers/appointmentController");
const analyticsRoutes = require("./routes/analytics");
const opSlipRoutes = require("./routes/opslips");
const prescriptionRoutes = require("./routes/prescriptions");

// Route middleware
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/opslips", opSlipRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// Public route for getting doctors (for appointment booking)
app.get("/api/doctors", async (req, res) => {
  try {
    const User = require("./models/User");
    const doctors = await User.find({ role: "doctor" })
      .select("fullName email phone doctorProfile")
      .lean();

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
});

app.use("/api/doctor", doctorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
});

// Database connection and server start
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/opcare";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    if (process.env.NODE_ENV !== "production") {
      console.warn("Proceeding without DB connection (dev mode)");
    } else {
      process.exit(1);
    }
  })
  .finally(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Dev reminder runner: run reminder job every hour (replace with cron in production)
      // Temporarily disabled to debug server crash
      /*
      try {
        setInterval(async () => {
          const count =
            await appointmentController.remindTomorrowAppointments();
          if (count)
            console.log(
              `Reminder job: ${count} appointments reminded for tomorrow`
            );
        }, 1000 * 60 * 60); // every hour
      } catch (e) {
        console.error("Failed to start reminder interval", e);
      }
      */
    });
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Don't exit the process in production
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});
