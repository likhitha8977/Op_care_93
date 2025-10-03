const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Change if your frontend runs on a different port
    credentials: true,
  })
);
app.use(express.json());
// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Session middleware (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "opcaresecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth strategy
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
        // Find or create user
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            password: "", // Not used for Google users
            role: "patient", // Default role
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

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

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);

// Error handler
app.use((err, req, res, next) => {
  // Log detailed error to server console for debugging
  console.error('Error:', err && err.message);
  if (err && err.stack) console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
