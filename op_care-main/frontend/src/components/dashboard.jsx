import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [activeCard, setActiveCard] = useState(null);

  // State for dynamic data
  const [appointments, setAppointments] = useState([]);
  const [opSlips, setOpSlips] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]); // ✅ new state for previous records

  // Fetch data when component loads
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('opcare_user'));
    const token = storedUser?.token;
    if (!token) {
      console.warn("No token found");
      return;
    }
    const fetchData = async () => {
      try {
        const [
          appointmentsRes,
          opSlipsRes,
          prescriptionsRes,
          notificationsRes,
          profileRes,
          recordsRes,
        ] = await Promise.all([
          fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
          fetch('/api/opslips', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
          fetch('/api/prescriptions', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
          fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
          fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
          fetch('/api/records', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
        ]);
        setAppointments(appointmentsRes || []);
        setOpSlips(opSlipsRes || []);
        setPrescriptions(prescriptionsRes || []);
        setNotifications(notificationsRes || []);
        setProfile(profileRes || null);
        setRecords(recordsRes || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  const handleCardClick = (cardName) => {
    setActiveCard(activeCard === cardName ? null : cardName);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Your Dashboard</h1>
        <p>
          Welcome,{" "}
          {profile?.fullName || localStorage.getItem("fullName") || "User"}
        </p>
      </header>

      {/* Cards */}
      <div className="dashboard-grid">
        {/* Appointments */}
        <div
          className={`dashboard-card ${
            activeCard === "appointments" ? "active" : ""
          }`}
          onClick={() => handleCardClick("appointments")}
        >
          <div className="card-icon">
            <img src="appointment.webp" alt="Appointments" />
          </div>
          <h2>Appointments</h2>
          <p>View or manage your appointments</p>
          {activeCard === "appointments" && (
            <div className="card-details">
              <ul>
                {appointments.length > 0 ? (
                  appointments.map((appt, idx) => (
                    <li key={idx}>
                      {appt.date} – {appt.doctorName}
                    </li>
                  ))
                ) : (
                  <li>No upcoming appointments</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* OP Slips */}
        <div
          className={`dashboard-card ${
            activeCard === "opslips" ? "active" : ""
          }`}
          onClick={() => handleCardClick("opslips")}
        >
          <div className="card-icon">
            <img src="op.jpg" alt="OP Slips" />
          </div>
          <h2>OP Slips</h2>
          <p>Generate or view your OP slips</p>
          {activeCard === "opslips" && (
            <div className="card-details">
              <ul>
                {opSlips.length > 0 ? (
                  opSlips.map((slip, idx) => (
                    <li key={idx}>
                      Slip #{slip.slipId} – {slip.date}
                    </li>
                  ))
                ) : (
                  <li>No OP slips available</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Prescriptions */}
        <div
          className={`dashboard-card ${
            activeCard === "prescriptions" ? "active" : ""
          }`}
          onClick={() => handleCardClick("prescriptions")}
        >
          <div className="card-icon">
            <img src="prescription.jpg" alt="Prescriptions" />
          </div>
          <h2>Prescriptions</h2>
          <p>View prescriptions given by doctors</p>
          {activeCard === "prescriptions" && (
            <div className="card-details">
              <ul>
                {prescriptions.length > 0 ? (
                  prescriptions.map((rx, idx) => (
                    <li key={idx}>
                      {rx.date} – {rx.medicine}
                    </li>
                  ))
                ) : (
                  <li>No prescriptions available</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div
          className={`dashboard-card ${
            activeCard === "notifications" ? "active" : ""
          }`}
          onClick={() => handleCardClick("notifications")}
        >
          <div className="card-icon">
            <img src="notify.jpeg" alt="Notifications" />
          </div>
          <h2>Notifications</h2>
          <p>Check latest hospital alerts</p>
          {activeCard === "notifications" && (
            <div className="card-details">
              <ul>
                {notifications.length > 0 ? (
                  notifications.map((note, idx) => (
                    <li key={idx}>{note.message}</li>
                  ))
                ) : (
                  <li>No notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Edit Profile */}
        <div
          className={`dashboard-card ${
            activeCard === "profile" ? "active" : ""
          }`}
          onClick={() => handleCardClick("profile")}
        >
          <div className="card-icon">
            <img src="edit.webp" alt="Edit Profile" />
          </div>
          <h2>Edit Profile</h2>
          <p>Update your account details</p>
          {activeCard === "profile" && (
            <div className="card-details">
              {profile ? (
                <div>
                  <p>
                    <strong>Name:</strong> {profile.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profile.phone}
                  </p>
                </div>
              ) : (
                <p>Loading profile...</p>
              )}
            </div>
          )}
        </div>

        {/* ✅ Previous Records */}
        <div
          className={`dashboard-card ${
            activeCard === "records" ? "active" : ""
          }`}
          onClick={() => handleCardClick("records")}
        >
          <div className="card-icon">
            <img src="hospital.webp" alt="Previous Records" />
          </div>
          <h2>Previous Records</h2>
          <p>Check your past medical history</p>
          {activeCard === "records" && (
            <div className="card-details">
              <ul>
                {records.length > 0 ? (
                  records.map((rec, idx) => (
                    <li key={idx}>
                      {rec.date} – {rec.details}
                    </li>
                  ))
                ) : (
                  <li>No previous records available</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
