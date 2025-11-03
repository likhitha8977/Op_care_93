import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import "../styles/bookings.css";

const MyAppointments = () => {
  const { user } = useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const token = user?.token || localStorage.getItem("token");
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/appointments/patient/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      } else {
        const err = await response.json();
        setError(err.error || "Failed to fetch appointments");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const token = user?.token || localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setAppointments(
          appointments.filter((apt) => apt._id !== appointmentId)
        );
        alert("Appointment cancelled successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Error cancelling appointment");
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditData(appointments[idx]);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = user?.token || localStorage.getItem("token");
      const apptId = appointments[editIdx]._id;

      const response = await fetch(
        `http://localhost:5000/api/appointments/${apptId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );

      if (response.ok) {
        const updatedAppt = await response.json();
        const updated = appointments.map((appt, i) =>
          i === editIdx ? updatedAppt : appt
        );
        setAppointments(updated);
        setEditIdx(null);
        alert("Appointment updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error updating appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#ffc107";
      case "confirmed":
        return "#28a745";
      case "scheduled":
        return "#007bff";
      case "completed":
        return "#6c757d";
      case "cancelled":
        return "#dc3545";
      case "rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="bookings-container">
        <p>Please log in to view your appointments.</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <h2>My Appointments</h2>
      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h3>No appointments found</h3>
          <p>You haven't booked any appointments yet.</p>
        </div>
      ) : (
        <ul className="bookings-list">
          {appointments.map((appt, idx) => (
            <li className="booking-item" key={appt._id || idx}>
              {editIdx === idx ? (
                <form
                  onSubmit={handleEditSubmit}
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <input
                    name="service"
                    value={editData.service || editData.type || ""}
                    onChange={handleEditChange}
                    required
                    placeholder="Service"
                  />
                  <input
                    name="date"
                    value={editData.date ? editData.date.split("T")[0] : ""}
                    onChange={handleEditChange}
                    required
                    type="date"
                  />
                  <input
                    name="time"
                    value={editData.time || ""}
                    onChange={handleEditChange}
                    type="time"
                    placeholder="Time"
                  />
                  <button type="submit" className="book-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditIdx(null)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <span>
                      <strong>
                        {appt.service || appt.type || "Consultation"}
                      </strong>
                      {` @ ${appt?.hospital?.name || "Hospital TBD"}`}
                      {` on ${formatDate(appt.date)}`}
                      {appt.time && ` at ${appt.time}`}
                    </span>
                    <span>
                      <strong>Doctor:</strong>{" "}
                      {appt.doctor?.fullName || "Doctor TBD"}
                      {appt.doctor?.doctorProfile?.specialization &&
                        ` (${appt.doctor.doctorProfile.specialization})`}
                    </span>
                    <span>
                      <strong>Status:</strong>
                      <span
                        style={{
                          color: getStatusColor(appt.status),
                          fontWeight: "bold",
                          marginLeft: "0.5rem",
                        }}
                      >
                        {appt.status?.toUpperCase() || "PENDING"}
                      </span>
                      {` | Mode: ${appt.consultationType || "in_person"}`}
                      {appt.consultationType === "video" && appt.videoLink && (
                        <>
                          {` | `}
                          <a
                            href={appt.videoLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Join Video
                          </a>
                        </>
                      )}
                    </span>
                    {appt.notes && (
                      <span>
                        <strong>Notes:</strong> {appt.notes}
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    {["pending", "confirmed"].includes(appt.status) && (
                      <button
                        className="view-btn"
                        onClick={() => handleEdit(idx)}
                      >
                        Reschedule
                      </button>
                    )}
                    {["pending", "confirmed", "scheduled"].includes(
                      appt.status
                    ) && (
                      <button
                        className="cancel-btn"
                        onClick={() => handleCancel(appt._id)}
                      >
                        Cancel
                      </button>
                    )}
                    {appt.status === "scheduled" &&
                      appt.consultationType === "video" &&
                      appt.videoLink && (
                        <a
                          href={appt.videoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="book-btn"
                          style={{
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          Join Video Call
                        </a>
                      )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyAppointments;
