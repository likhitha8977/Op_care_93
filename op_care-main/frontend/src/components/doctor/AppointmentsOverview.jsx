import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";

export default function AppointmentsOverview() {
  const { user } = useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    doctor: "",
    hospital: "",
    date: "",
    status: "",
    page: 1,
    limit: 20,
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Add doctor filter to only show appointments for current doctor
      if (user?.id) {
        params.append("doctor", user.id);
      }

      const token = user?.token || localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/appointments?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setAppointments(data.items || []);
        setTotal(data.total || 0);
      } else {
        console.error("Failed to fetch appointments:", data.error);
      }
    } catch (err) {
      console.error("Fetch appointments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [filters, user]);

  const updateAppointmentStatus = async (
    appointmentId,
    newStatus,
    scheduledDate = null,
    scheduledTime = null
  ) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      const updateData = { status: newStatus };

      // If scheduling, include date and time
      if (newStatus === "scheduled" && scheduledDate && scheduledTime) {
        updateData.date = scheduledDate;
        updateData.time = scheduledTime;
      }

      const res = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === appointmentId ? updated : apt))
        );

        // Send notification to patient based on status
        await sendNotificationToPatient(appointmentId, newStatus, updated);

        // Show success message
        const statusMessages = {
          confirmed: "Appointment confirmed successfully!",
          scheduled:
            "Appointment scheduled successfully! Patient will be notified.",
          rejected: "Appointment rejected.",
          cancelled: "Appointment cancelled.",
          completed: "Appointment marked as completed.",
        };

        alert(statusMessages[newStatus] || "Appointment updated successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to update appointment: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Update appointment error:", err);
      alert("Error updating appointment. Please try again.");
    }
  };

  const sendNotificationToPatient = async (
    appointmentId,
    status,
    appointmentData
  ) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      let message = "";

      switch (status) {
        case "confirmed":
          message = `Your appointment with Dr. ${user?.fullName} has been confirmed.`;
          break;
        case "scheduled":
          message = `Your appointment with Dr. ${
            user?.fullName
          } has been scheduled for ${new Date(
            appointmentData.date
          ).toLocaleDateString()} at ${appointmentData.time}.`;
          break;
        case "rejected":
          message = `Your appointment request with Dr. ${user?.fullName} has been declined. Please book another appointment.`;
          break;
        case "cancelled":
          message = `Your appointment with Dr. ${user?.fullName} has been cancelled.`;
          break;
        case "completed":
          message = `Your appointment with Dr. ${user?.fullName} has been completed. Thank you for visiting.`;
          break;
      }

      await fetch("http://localhost:5000/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: appointmentData.user._id || appointmentData.user,
          title: `Appointment ${
            status.charAt(0).toUpperCase() + status.slice(1)
          }`,
          message,
          type: "appointment",
          appointmentId,
        }),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleScheduleAppointment = async (appointmentId) => {
    const scheduledDate = prompt("Enter scheduled date (YYYY-MM-DD):");
    const scheduledTime = prompt("Enter scheduled time (HH:MM):");

    if (scheduledDate && scheduledTime) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const timeRegex = /^\d{2}:\d{2}$/;

      if (!dateRegex.test(scheduledDate)) {
        alert("Please enter date in YYYY-MM-DD format");
        return;
      }

      if (!timeRegex.test(scheduledTime)) {
        alert("Please enter time in HH:MM format");
        return;
      }

      await updateAppointmentStatus(
        appointmentId,
        "scheduled",
        scheduledDate,
        scheduledTime
      );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "rejected":
      case "cancelled":
        return "#dc3545";
      case "confirmed":
        return "#28a745";
      case "scheduled":
        return "#007bff";
      case "pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Appointments Overview</h2>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          padding: 16,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          backgroundColor: "#f9f9f9",
        }}
      >
        <input
          type="text"
          placeholder="Doctor name or ID"
          value={filters.doctor}
          onChange={(e) =>
            setFilters({ ...filters, doctor: e.target.value, page: 1 })
          }
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
        <input
          type="text"
          placeholder="Hospital name or ID"
          value={filters.hospital}
          onChange={(e) =>
            setFilters({ ...filters, hospital: e.target.value, page: 1 })
          }
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters({ ...filters, date: e.target.value, page: 1 })
          }
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() =>
            setFilters({
              doctor: "",
              hospital: "",
              date: "",
              status: "",
              page: 1,
              limit: 20,
            })
          }
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Results Summary */}
      <div style={{ marginBottom: 16, color: "#666" }}>
        {loading ? "Loading..." : `Total: ${total} appointments`}
      </div>

      {/* Appointments Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Patient
              </th>
              <th
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Doctor
              </th>
              <th
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Hospital
              </th>
              <th
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Date/Time
              </th>
              <th
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Service
              </th>
              <th
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: 12,
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <tr key={apt._id}>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    {apt.user?.fullName || "Unknown Patient"}
                    {apt.user?.email && (
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        {apt.user.email}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    {apt.doctor?.fullName || "Not assigned"}
                  </td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    {apt.hospital?.name || "Unknown Hospital"}
                  </td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    {formatDate(apt.date)}
                    {apt.consultationType === "video" && (
                      <div style={{ fontSize: "0.8em", color: "#007bff" }}>
                        📹 Video consultation
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    {apt.service || "General consultation"}
                  </td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        backgroundColor: getStatusColor(apt.status),
                        color: "white",
                        fontSize: "0.9em",
                      }}
                    >
                      {apt.status?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </td>
                  <td style={{ padding: 12, border: "1px solid #ddd" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {apt.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(apt._id, "confirmed")
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => handleScheduleAppointment(apt._id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            📅 Schedule
                          </button>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(apt._id, "rejected")
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      {apt.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => handleScheduleAppointment(apt._id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            📅 Schedule
                          </button>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(apt._id, "completed")
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            ✅ Complete
                          </button>
                        </>
                      )}

                      {apt.status === "scheduled" && (
                        <>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(apt._id, "completed")
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            ✅ Complete
                          </button>
                          <button
                            onClick={() => handleScheduleAppointment(apt._id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#ffc107",
                              color: "black",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.8em",
                              cursor: "pointer",
                            }}
                          >
                            🔄 Reschedule
                          </button>
                        </>
                      )}

                      {["pending", "confirmed", "scheduled"].includes(
                        apt.status
                      ) && (
                        <button
                          onClick={() =>
                            updateAppointmentStatus(apt._id, "cancelled")
                          }
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            fontSize: "0.8em",
                            cursor: "pointer",
                          }}
                        >
                          🚫 Cancel
                        </button>
                      )}

                      {apt.status === "completed" && (
                        <span
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#e9ecef",
                            color: "#6c757d",
                            borderRadius: 4,
                            fontSize: "0.8em",
                          }}
                        >
                          ✅ Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{ padding: 20, textAlign: "center", color: "#666" }}
                >
                  {loading
                    ? "Loading appointments..."
                    : "No appointments found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <div style={{ color: "#666" }}>
          Page {filters.page} of {Math.ceil(total / filters.limit) || 1}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() =>
              setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
            }
            disabled={filters.page <= 1}
            style={{
              padding: "8px 16px",
              backgroundColor: filters.page <= 1 ? "#e9ecef" : "#007bff",
              color: filters.page <= 1 ? "#6c757d" : "white",
              border: "none",
              borderRadius: 4,
              cursor: filters.page <= 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= Math.ceil(total / filters.limit)}
            style={{
              padding: "8px 16px",
              backgroundColor:
                filters.page >= Math.ceil(total / filters.limit)
                  ? "#e9ecef"
                  : "#007bff",
              color:
                filters.page >= Math.ceil(total / filters.limit)
                  ? "#6c757d"
                  : "white",
              border: "none",
              borderRadius: 4,
              cursor:
                filters.page >= Math.ceil(total / filters.limit)
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
