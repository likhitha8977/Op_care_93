import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import Sidenav from "../components/Sidenav"; // Import the Sidenav
import Payment from "../components/payment";
import PatientAppointments from "./patient/PatientAppointments"; // Import the new PatientAppointments component
import "../styles/profile.css";

const Profile = () => {
  const { user, logout } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState("profile"); // Sidebar active tab
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [opSlips, setOpSlips] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (user) {
      const token = user?.token;

      // If there's no token (e.g., Google login without JWT), immediately use context user for display
      if (!token) {
        setProfile(user);
        setForm({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          height: user.height || "",
          weight: user.weight || "",
        });
        return; // Skip API calls that require JWT
      }

      const fetchData = async () => {
        try {
          const [
            profileRes,
            appointmentsRes,
            opSlipsRes,
            prescriptionsRes,
            notificationsRes,
            recordsRes,
          ] = await Promise.all([
            fetch("/api/profile", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch("/api/bookings", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch("/api/opslips", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch("/api/prescriptions", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch("/api/notifications", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch("/api/records", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
          ]);

          const nextProfile = profileRes?.error ? user : profileRes;
          setProfile(nextProfile);
          setForm({
            fullName:
              (nextProfile && nextProfile.fullName) || user.fullName || "",
            email: (nextProfile && nextProfile.email) || user.email || "",
            phone: (nextProfile && nextProfile.phone) || user.phone || "",
            height: (nextProfile && nextProfile.height) || user.height || "",
            weight: (nextProfile && nextProfile.weight) || user.weight || "",
          });

          setAppointments(appointmentsRes || []);
          setOpSlips(opSlipsRes || []);
          setPrescriptions(prescriptionsRes || []);
          setNotifications(notificationsRes || []);
          setRecords(recordsRes || []);
        } catch (err) {
          console.error("Error fetching data:", err);
          // Fallback to user context on any failure
          setProfile(user);
          setForm({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            height: user.height || "",
            weight: user.weight || "",
          });
        }
      };

      fetchData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="profile-container">
        <h2>My Profile</h2>
        <p>No user logged in. Please sign in or sign up.</p>
      </div>
    );
  }

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = user?.token;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditMode(false);
        alert("Profile updated!");
      } else {
        alert(data.error || "Update failed");
      }
    } catch (err) {
      alert("Update error: " + err.message);
    }
  };

  // BMI Calculation
  const calculateBMI = () => {
    const heightM = parseFloat(form.height) / 100;
    const weightKg = parseFloat(form.weight);
    if (!heightM || !weightKg) return null;
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return "";
    const value = parseFloat(bmi);
    if (value < 18.5) return "Underweight";
    if (value >= 18.5 && value < 24.9) return "Normal weight";
    if (value >= 25 && value < 29.9) return "Overweight";
    return "Obese";
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="profile-layout">
      {!(user && user.role === "admin") && (
        <Sidenav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <main className="profile-main">
        {activeTab === "profile" && (
          <div className="profile-details">
            {editMode ? (
              <form className="profile-form" onSubmit={handleSave}>
                <label>
                  Name:
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Email:
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Phone:
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Height (cm):
                  <input
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Weight (kg):
                  <input
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                  />
                </label>
                <div className="buttons">
                  <button type="submit" className="book-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {(() => {
                  const display = profile || user;
                  return (
                    <>
                      <p>
                        <strong>Name:</strong> {display?.fullName}
                      </p>
                      <p>
                        <strong>Email:</strong> {display?.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {display?.phone}
                      </p>
                      <p>
                        <strong>Role:</strong> {display?.role}
                      </p>
                      <p>
                        <strong>Height:</strong> {display?.height || "N/A"} cm
                      </p>
                      <p>
                        <strong>Weight:</strong> {display?.weight || "N/A"} kg
                      </p>
                    </>
                  );
                })()}

                <h3 className="bmi-heading">Want to know your BMI?</h3>
                {bmi ? (
                  <p
                    className={`bmi-result ${bmiCategory
                      .replace(" ", "-")
                      .toLowerCase()}`}
                  >
                    Your BMI: <strong>{bmi}</strong> ({bmiCategory})
                  </p>
                ) : (
                  <p>Provide height and weight to calculate BMI.</p>
                )}

                <div className="buttons">
                  <button className="book-btn" onClick={handleEdit}>
                    Edit
                  </button>
                  <button className="cancel-btn" onClick={logout}>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <PatientAppointments />
          </div>
        )}

        {activeTab === "opslips" && (
          <div>
            <h2>OP Slips</h2>
            <ul>
              {opSlips.length ? (
                opSlips.map((slip, idx) => (
                  <li key={idx}>
                    Slip #{slip.slipId} - {slip.date}
                  </li>
                ))
              ) : (
                <li>No OP Slips available</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === "prescriptions" && (
          <div>
            <h2>Prescriptions</h2>
            <ul>
              {prescriptions.length ? (
                prescriptions.map((rx, idx) => (
                  <li key={idx}>
                    {rx.date} - {rx.medicine}
                  </li>
                ))
              ) : (
                <li>No prescriptions available</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2>Notifications</h2>
            <ul>
              {notifications.length ? (
                notifications.map((note, idx) => (
                  <li key={idx}>{note.message}</li>
                ))
              ) : (
                <li>No notifications</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === "records" && (
          <div>
            <h2>Previous Records</h2>
            <ul>
              {records.length ? (
                records.map((rec, idx) => (
                  <li key={idx}>
                    {rec.date} - {rec.description}
                  </li>
                ))
              ) : (
                <li>No previous records</li>
              )}
            </ul>
          </div>
        )}

        {activeTab === "payments" && <Payment />}
      </main>
    </div>
  );
};

export default Profile;
