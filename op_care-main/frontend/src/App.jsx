import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./styles/signin.css";
import SignUp from "./components/signup.jsx";
import SignIn from "./components/signin.jsx";
import Home from "./components/home.jsx";
import AdminDashboard from "./components/adminDashboard.jsx";
import Profile from "./components/profile.jsx";
import DoctorLayout from "./components/doctor/DoctorLayout.jsx";
import Payment from "./components/payment.jsx";
import NotFound from "./components/notfound.jsx";
import Services from "./components/services.jsx";
import Bookings from "./components/bookings.jsx";
import MyAppointments from "./components/myappointments.jsx";
import Notification from "./components/notification.jsx";
import Navbar from "./components/navbar.jsx";
import { UserContext } from "./context/UserContext.jsx";

export default function App() {
  const [notification, setNotification] = useState("");
  const { user } = React.useContext(UserContext);
  const location = useLocation();
  // Hide navbar entirely for doctors; for admins, hide only on /home
  const hideNavbar = (user && user.role === 'doctor') || (user && user.role === 'admin' && location.pathname === '/home');

  // Role-based route protection
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!user) {
      return <Navigate to="/signin" replace />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/home" replace />;
    }
    
    return children;
  };

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
      {!hideNavbar && (
        <Notification
          message={notification}
          onClose={() => setNotification("")}
        />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctor/*" 
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/services" element={<Services />} />
        <Route path="/bookings" element={<Bookings setNotification={setNotification} />} />
        <Route path="/profile" element={user && user.role === 'doctor' ? <Navigate to="/doctor" replace /> : <Profile />} />
        <Route path="/myappointments" element={<MyAppointments />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
