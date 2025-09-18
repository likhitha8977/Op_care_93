import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/signin.css";
import SignUp from "./components/signup.jsx";
import SignIn from "./components/signin.jsx";
import Home from "./components/home.jsx";
import Dashboard from "./components/dashboard.jsx";
import Profile from "./components/profile.jsx";
import Payment from "./components/payment.jsx";
import NotFound from "./components/notfound.jsx";
import Services from "./components/services.jsx";
import Bookings from "./components/bookings.jsx";
import MyAppointments from "./components/myappointments.jsx";
import Notification from "./components/notification.jsx";
import Navbar from "./components/navbar.jsx";

export default function App() {
  const [notification, setNotification] = useState("");

  return (
    <div className="app">
      <Navbar />
      <Notification
        message={notification}
        onClose={() => setNotification("")}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/bookings" element={<Bookings setNotification={setNotification} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/myappointments" element={<MyAppointments />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
