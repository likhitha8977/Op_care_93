import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/patient-appointments.css";

function PatientAppointments() {
  const { user } = useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    doctor: "",
    status: "",
  });

  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    hospitalId: "",
    date: "",
    time: "",
    type: "consultation",
    notes: "",
  });

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append("date", filters.date);
      if (filters.doctor) queryParams.append("doctor", filters.doctor);
      if (filters.status) queryParams.append("status", filters.status);

      const response = await fetch(
        `http://localhost:5000/api/appointments/patient/${user.id}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || data);
      } else {
        console.error("Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Fetch doctors and hospitals
  const fetchDoctorsAndHospitals = async () => {
    try {
      const [doctorsRes, hospitalsRes] = await Promise.all([
        fetch("http://localhost:5000/api/doctors"),
        fetch("http://localhost:5000/api/hospitals", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
      }

      if (hospitalsRes.ok) {
        const hospitalsData = await hospitalsRes.json();
        setHospitals(hospitalsData);
      }
    } catch (error) {
      console.error("Error fetching doctors/hospitals:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        setLoading(true);
        await fetchAppointments();
        await fetchDoctorsAndHospitals();
        setLoading(false);
      };
      loadData();
    }
  }, [user, filters]);

  // Create new appointment
  const handleCreateAppointment = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...newAppointment,
          patientId: user.id,
        }),
      });

      if (response.ok) {
        const appointment = await response.json();
        setAppointments([...appointments, appointment]);
        setShowCreateForm(false);
        setNewAppointment({
          doctorId: "",
          hospitalId: "",
          date: "",
          time: "",
          type: "consultation",
          notes: "",
        });
        alert("Appointment created successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error creating appointment");
    }
  };

  // Update appointment status
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            status: newStatus,
            updatedBy: user.id,
          }),
        }
      );

      if (response.ok) {
        fetchAppointments(); // Refresh the list
        alert("Appointment status updated successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error updating appointment");
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/${appointmentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
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
          alert(error.message || "Failed to cancel appointment");
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Error cancelling appointment");
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed";
      case "pending":
        return "status-pending";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      case "rescheduled":
        return "status-rescheduled";
      default:
        return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return "🟢";
      case "pending":
        return "🟡";
      case "completed":
        return "✅";
      case "cancelled":
        return "🔴";
      case "rescheduled":
        return "🔄";
      default:
        return "⚪";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not specified";
    return timeString;
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="patient-appointments">
      <div className="appointments-header">
        <h2>My Appointments</h2>
        <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
          Book New Appointment
        </button>
      </div>

      <div className="filters-section">
        <div className="filters">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            placeholder="Filter by date"
          />

          <select
            value={filters.doctor}
            onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
          >
            <option value="">All Doctors</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.fullName}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>

          <button
            className="btn-secondary"
            onClick={() => setFilters({ date: "", doctor: "", status: "" })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Book New Appointment</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateAppointment}
              className="appointment-form"
            >
              <div className="form-group">
                <label>Doctor:</label>
                <select
                  value={newAppointment.doctorId}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      doctorId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.fullName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Hospital:</label>
                <select
                  value={newAppointment.hospitalId}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      hospitalId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name} - {hospital.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        date: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        time: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Type:</label>
                <select
                  value={newAppointment.type}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine Check-up</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Any additional notes or symptoms..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <div className="no-appointments-icon">📅</div>
            <h3>No appointments available</h3>
            <p>You haven't booked any appointments yet.</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          appointments.map((appointment) => {
            return (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-header">
                  <div className="appointment-info">
                    <div className="doctor-info">
                      <h4>
                        👨‍⚕️ Dr.{" "}
                        {appointment.doctor?.fullName || "Unknown Doctor"}
                      </h4>
                      <p className="specialization">
                        {appointment.doctor?.specialization ||
                          "General Medicine"}
                      </p>
                    </div>
                    <div className="hospital-info">
                      <p className="hospital">
                        🏥 {appointment.hospital?.name || "Hospital TBD"}
                      </p>
                      {appointment.hospital?.city && (
                        <p className="location">
                          📍 {appointment.hospital.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`status-badge ${getStatusBadgeClass(
                      appointment.status
                    )}`}
                  >
                    <span className="status-icon">
                      {getStatusIcon(appointment.status)}
                    </span>
                    <span className="status-text">
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div className="detail-content">
                        <strong>Date:</strong>
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <div className="detail-content">
                        <strong>Time:</strong>
                        <span>{formatTime(appointment.time)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">🩺</span>
                      <div className="detail-content">
                        <strong>Type:</strong>
                        <span>
                          {appointment.type ||
                            appointment.service ||
                            "Consultation"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="detail-row">
                      <div className="detail-item full-width">
                        <span className="detail-icon">📝</span>
                        <div className="detail-content">
                          <strong>Notes:</strong>
                          <span>{appointment.notes}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  {appointment.status === "pending" && (
                    <>
                      <button
                        className="btn-success"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "confirmed")
                        }
                        title="Confirm Appointment"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        className="btn-warning"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "rescheduled")
                        }
                        title="Reschedule Appointment"
                      >
                        🔄 Reschedule
                      </button>
                    </>
                  )}

                  {appointment.status === "confirmed" && (
                    <>
                      <button
                        className="btn-primary"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "completed")
                        }
                        title="Mark as Completed"
                      >
                        ✅ Complete
                      </button>
                      <button
                        className="btn-warning"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "rescheduled")
                        }
                        title="Reschedule Appointment"
                      >
                        🔄 Reschedule
                      </button>
                    </>
                  )}

                  <button
                    className="btn-danger"
                    onClick={() => handleCancelAppointment(appointment._id)}
                    title="Cancel Appointment"
                  >
                    🗑️ Cancel
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PatientAppointments;
