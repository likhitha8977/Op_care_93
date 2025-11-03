import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";

function OperationsManagement() {
  const { user } = useContext(UserContext);
  const [operations, setOperations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [activeTab, setActiveTab] = useState("scheduled"); // scheduled, operations, appointments

  const [operationData, setOperationData] = useState({
    patient: "",
    hospital: "",
    date: "",
    time: "",
    type: "",
    outcome: "",
    notes: "",
    status: "scheduled",
    duration: "",
    priority: "medium",
  });

  // Search states
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchOperations();
      fetchAppointments();
      fetchPatients();
      fetchHospitals();
    }
  }, [user]);

  const fetchOperations = async () => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        console.error("No token available for fetching operations");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/doctor/operations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched operations data:", data);
        setOperations(data);
      } else {
        console.error(
          "Failed to fetch operations:",
          response.status,
          response.statusText
        );
        const errorData = await response.text();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching operations:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        console.error("No token available for fetching appointments");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/doctor/appointments?scope=upcoming",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched appointments data:", data);
        setAppointments(data);
      } else {
        console.error(
          "Failed to fetch appointments:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        console.error("No token available for fetching patients");
        return;
      }

      // Try to get all patients using search with empty query
      const response = await fetch(
        "http://localhost:5000/api/doctor/search-patients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched patients data:", data);
        const patientsArray = data.patients || data || [];
        setPatients(patientsArray);
        setFilteredPatients(patientsArray);
      } else {
        console.error(
          "Failed to fetch patients:",
          response.status,
          response.statusText
        );
        // Fallback: try to get patients from a different endpoint
        const fallbackResponse = await fetch(
          "http://localhost:5000/api/doctor/patients",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log("Fetched patients from fallback:", fallbackData);
          setPatients(fallbackData || []);
          setFilteredPatients(fallbackData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/hospitals");
      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const handlePatientSearch = (searchValue) => {
    setPatientSearch(searchValue);

    if (searchValue.trim().length < 2) {
      setShowPatientDropdown(false);
      setFilteredPatients([]);
      return;
    }

    setShowPatientDropdown(true);

    const filtered = patients.filter(
      (patient) =>
        patient.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchValue))
    );
    setFilteredPatients(filtered);
  };

  const selectPatient = (patient) => {
    setOperationData((prev) => ({ ...prev, patient: patient._id }));
    setPatientSearch(patient.fullName);
    setShowPatientDropdown(false);
    setFilteredPatients([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!operationData.patient) {
        alert("Please select a patient");
        setLoading(false);
        return;
      }

      if (!operationData.date) {
        alert("Please select a date");
        setLoading(false);
        return;
      }

      if (!operationData.type) {
        alert("Please enter operation type");
        setLoading(false);
        return;
      }

      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const url = editingOperation
        ? `http://localhost:5000/api/doctor/operations/${editingOperation._id}`
        : "http://localhost:5000/api/doctor/operations";

      const method = editingOperation ? "PUT" : "POST";

      console.log("Submitting operation data:", operationData);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(operationData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Operation saved successfully:", result);
        await fetchOperations();
        resetForm();
        alert(
          editingOperation
            ? "Operation updated successfully!"
            : "Operation scheduled successfully!"
        );
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Error: ${errorData.error || "Failed to save operation"}`);
      }
    } catch (error) {
      console.error("Error saving operation:", error);
      alert("Error saving operation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOperationData({
      patient: "",
      hospital: "",
      date: "",
      time: "",
      type: "",
      outcome: "",
      notes: "",
      status: "scheduled",
      duration: "",
      priority: "medium",
    });
    setPatientSearch("");
    setEditingOperation(null);
    setShowForm(false);
  };

  const editOperation = (operation) => {
    setEditingOperation(operation);
    setOperationData({
      patient: operation.patient._id,
      hospital: operation.hospital?._id || "",
      date: operation.date,
      time: operation.time || "",
      type: operation.type,
      outcome: operation.outcome || "",
      notes: operation.notes || "",
      status: operation.status || "scheduled",
      duration: operation.duration || "",
      priority: operation.priority || "medium",
    });
    setPatientSearch(operation.patient.fullName);
    setShowForm(true);
  };

  const deleteOperation = async (id) => {
    if (!confirm("Are you sure you want to delete this operation?")) return;

    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/doctor/operations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await fetchOperations();
        alert("Operation deleted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Delete error:", errorData);
        alert(
          `Error deleting operation: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error deleting operation:", error);
      alert("Error deleting operation. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "#FFA500",
      "in-progress": "#007BFF",
      completed: "#28A745",
      cancelled: "#DC3545",
      booked: "#17A2B8",
      accepted: "#007BFF",
      pending: "#FFC107",
    };
    return colors[status] || "#6C757D";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "#28A745",
      medium: "#FFC107",
      high: "#FD7E14",
      critical: "#DC3545",
    };
    return colors[priority] || "#6C757D";
  };

  // Combine operations and appointments for scheduled view
  const getScheduledItems = () => {
    const scheduledOps = operations
      .filter((op) => op.status === "scheduled")
      .map((op) => ({
        ...op,
        type: "operation",
        title: op.type,
        patientName: op.patient?.fullName,
        patientEmail: op.patient?.email,
        hospitalName: op.hospital?.name,
      }));

    const upcomingAppts = appointments
      .filter((apt) => apt.status !== "cancelled")
      .map((apt) => ({
        ...apt,
        type: "appointment",
        title: `Consultation - ${apt.consultationType || "General"}`,
        patientName: apt.user?.fullName,
        patientEmail: apt.user?.email,
        hospitalName: apt.hospital?.name,
        priority: "medium", // Default priority for appointments
      }));

    const combined = [...scheduledOps, ...upcomingAppts];

    // Sort by date and time
    return combined.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // If same date, sort by time
      const timeA = a.time || "00:00";
      const timeB = b.time || "00:00";
      return timeA.localeCompare(timeB);
    });
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/doctor/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        await fetchAppointments();
        alert(`Appointment ${newStatus} successfully!`);
      } else {
        const errorData = await response.json();
        console.error("Appointment update error:", errorData);
        alert(`Error: ${errorData.error || "Failed to update appointment"}`);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error updating appointment. Please try again.");
    }
  };

  const markOperationAsCompleted = async (operationId) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const confirmed = confirm(
        "Are you sure you want to mark this operation as completed?"
      );
      if (!confirmed) return;

      const response = await fetch(
        `http://localhost:5000/api/doctor/operations/${operationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "completed" }),
        }
      );

      if (response.ok) {
        await fetchOperations();
        alert("Operation marked as completed successfully!");
      } else {
        const errorData = await response.json();
        console.error("Operation update error:", errorData);
        alert(
          `Error: ${errorData.error || "Failed to update operation status"}`
        );
      }
    } catch (error) {
      console.error("Error updating operation status:", error);
      alert("Error updating operation status. Please try again.");
    }
  };

  const markOperationAsInProgress = async (operationId) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      const confirmed = confirm(
        "Are you sure you want to mark this operation as in progress?"
      );
      if (!confirmed) return;

      const response = await fetch(
        `http://localhost:5000/api/doctor/operations/${operationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "in-progress" }),
        }
      );

      if (response.ok) {
        await fetchOperations();
        alert("Operation marked as in progress!");
      } else {
        const errorData = await response.json();
        console.error("Operation update error:", errorData);
        alert(
          `Error: ${errorData.error || "Failed to update operation status"}`
        );
      }
    } catch (error) {
      console.error("Error updating operation status:", error);
      alert("Error updating operation status. Please try again.");
    }
  };

  if (user?.role !== "doctor") {
    return <div>Access denied. Only doctors can manage operations.</div>;
  }

  return (
    <div
      className="operations-management"
      style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* Debug Info */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "4px",
          border: "1px solid #dee2e6",
          fontSize: "0.9em",
        }}
      >
        <strong>Debug Info:</strong> Doctor ID: {user?._id} | Role: {user?.role}{" "}
        | Operations Count: {operations.length} | Appointments Count:{" "}
        {appointments.length} | Patients Count: {patients.length} | Hospitals
        Count: {hospitals.length}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>🏥 Operations & Surgeries Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showForm ? "Close Form" : "+ Schedule Operation"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          borderBottom: "1px solid #dee2e6",
        }}
      >
        {[
          {
            id: "scheduled",
            label: `📅 All Scheduled (${getScheduledItems().length})`,
            icon: "📅",
          },
          {
            id: "operations",
            label: `🏥 Operations (${operations.length})`,
            icon: "🏥",
          },
          {
            id: "appointments",
            label: `👥 Appointments (${appointments.length})`,
            icon: "👥",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 24px",
              border: "none",
              background: activeTab === tab.id ? "#007BFF" : "transparent",
              color: activeTab === tab.id ? "white" : "#666",
              cursor: "pointer",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid #007BFF"
                  : "2px solid transparent",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? "600" : "normal",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            marginBottom: "20px",
          }}
        >
          <h3>
            {editingOperation ? "Edit Operation" : "Schedule New Operation"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "15px",
              }}
            >
              {/* Patient Search */}
              <div style={{ position: "relative" }}>
                <label>Patient *</label>
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  placeholder="Search patient by name, email, or phone..."
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
                {patientSearch.length >= 2 &&
                  showPatientDropdown &&
                  filteredPatients.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        right: "0",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient._id}
                          onClick={() => selectPatient(patient)}
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #eee",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#f5f5f5")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "white")
                          }
                        >
                          <div style={{ fontWeight: "bold" }}>
                            {patient.fullName}
                          </div>
                          <div style={{ fontSize: "0.9em", color: "#666" }}>
                            {patient.email} | {patient.phone || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                {patientSearch.length >= 2 &&
                  showPatientDropdown &&
                  filteredPatients.length === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        right: "0",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        padding: "10px",
                        zIndex: 1000,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        color: "#666",
                      }}
                    >
                      No patients found. Try a different search term.
                    </div>
                  )}
                {operationData.patient && (
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "0.9em",
                      color: "#28a745",
                    }}
                  >
                    ✓ Patient selected: {patientSearch}
                  </div>
                )}
              </div>

              {/* Hospital */}
              <div>
                <label>Hospital</label>
                <select
                  value={operationData.hospital}
                  onChange={(e) =>
                    setOperationData((prev) => ({
                      ...prev,
                      hospital: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="">Select Hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label>Date *</label>
                <input
                  type="date"
                  value={operationData.date}
                  onChange={(e) =>
                    setOperationData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              {/* Time */}
              <div>
                <label>Time</label>
                <input
                  type="time"
                  value={operationData.time}
                  onChange={(e) =>
                    setOperationData((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              {/* Type */}
              <div>
                <label>Operation Type *</label>
                <input
                  type="text"
                  value={operationData.type}
                  onChange={(e) =>
                    setOperationData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  placeholder="e.g., Appendectomy, Heart Surgery..."
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              {/* Duration */}
              <div>
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={operationData.duration}
                  onChange={(e) =>
                    setOperationData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="60"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label>Status</label>
                <select
                  value={operationData.status}
                  onChange={(e) =>
                    setOperationData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label>Priority</label>
                <select
                  value={operationData.priority}
                  onChange={(e) =>
                    setOperationData((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Outcome */}
            <div style={{ marginTop: "15px" }}>
              <label>Outcome</label>
              <textarea
                value={operationData.outcome}
                onChange={(e) =>
                  setOperationData((prev) => ({
                    ...prev,
                    outcome: e.target.value,
                  }))
                }
                placeholder="Post-operation outcome..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginTop: "15px" }}>
              <label>Notes</label>
              <textarea
                value={operationData.notes}
                onChange={(e) =>
                  setOperationData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Doctor's notes..."
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#28A745",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {loading
                  ? "Saving..."
                  : editingOperation
                  ? "Update Operation"
                  : "Schedule Operation"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: "#6C757D",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Scheduled Items View */}
      {activeTab === "scheduled" && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>📅 All Scheduled Items ({getScheduledItems().length})</h3>
                <p style={{ color: "#666", margin: "5px 0 0 0" }}>
                  Combined view of upcoming operations and appointments
                </p>
              </div>
              <button
                onClick={() => {
                  fetchOperations();
                  fetchAppointments();
                }}
                style={{
                  backgroundColor: "#28A745",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9em",
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {getScheduledItems().length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Date & Time
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Type
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Patient
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Details
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Hospital
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getScheduledItems().map((item, index) => (
                    <tr
                      key={`${item.type}-${item._id}-${index}`}
                      style={{ borderBottom: "1px solid #dee2e6" }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div>{new Date(item.date).toLocaleDateString()}</div>
                        {item.time && (
                          <div style={{ fontSize: "0.9em", color: "#666" }}>
                            {item.time}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor:
                              item.type === "operation" ? "#dc3545" : "#28a745",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.type === "operation"
                            ? "🏥 Operation"
                            : "👥 Appointment"}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "bold" }}>
                          {item.patientName}
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {item.patientEmail}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "bold" }}>{item.title}</div>
                        {item.duration && (
                          <div style={{ fontSize: "0.9em", color: "#666" }}>
                            Duration: {item.duration} min
                          </div>
                        )}
                        {item.consultationType &&
                          item.type === "appointment" && (
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                              Type: {item.consultationType}
                            </div>
                          )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {item.hospitalName || "Not specified"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: getStatusColor(item.status),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: getPriorityColor(item.priority),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>📅</div>
              <div>No scheduled items yet.</div>
              <div style={{ fontSize: "0.9em" }}>
                Operations and appointments will appear here when scheduled.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operations List */}
      {activeTab === "operations" && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>Scheduled Operations ({operations.length})</h3>
              <button
                onClick={fetchOperations}
                style={{
                  backgroundColor: "#28A745",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9em",
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {operations.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Date & Time
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Patient
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Operation Type
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Hospital
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Priority
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Duration
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((operation) => (
                    <tr
                      key={operation._id}
                      style={{ borderBottom: "1px solid #dee2e6" }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div>
                          {new Date(operation.date).toLocaleDateString()}
                        </div>
                        {operation.time && (
                          <div style={{ fontSize: "0.9em", color: "#666" }}>
                            {operation.time}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "bold" }}>
                          {operation.patient?.fullName}
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {operation.patient?.email}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>{operation.type}</td>
                      <td style={{ padding: "12px" }}>
                        {operation.hospital?.name || "Not specified"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: getStatusColor(operation.status),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            textTransform: "capitalize",
                          }}
                        >
                          {operation.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: getPriorityColor(
                              operation.priority
                            ),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            textTransform: "capitalize",
                          }}
                        >
                          {operation.priority}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {operation.duration ? `${operation.duration} min` : "-"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            flexWrap: "wrap",
                          }}
                        >
                          {operation.status !== "completed" &&
                            operation.status !== "cancelled" && (
                              <>
                                {operation.status === "scheduled" && (
                                  <button
                                    onClick={() =>
                                      markOperationAsInProgress(operation._id)
                                    }
                                    style={{
                                      backgroundColor: "#FFA500",
                                      color: "white",
                                      border: "none",
                                      padding: "5px 10px",
                                      borderRadius: "3px",
                                      cursor: "pointer",
                                      fontSize: "0.8em",
                                    }}
                                  >
                                    Start
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    markOperationAsCompleted(operation._id)
                                  }
                                  style={{
                                    backgroundColor: "#28A745",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    fontSize: "0.8em",
                                  }}
                                >
                                  Complete
                                </button>
                              </>
                            )}
                          <button
                            onClick={() => editOperation(operation)}
                            style={{
                              backgroundColor: "#007BFF",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "0.8em",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteOperation(operation._id)}
                            style={{
                              backgroundColor: "#DC3545",
                              color: "white",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "0.8em",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏥</div>
              <div>No operations scheduled yet.</div>
              <div style={{ fontSize: "0.9em" }}>
                Click "Schedule Operation" to add your first operation.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointments List */}
      {activeTab === "appointments" && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>👥 Appointments ({appointments.length})</h3>
                <p style={{ color: "#666", margin: "5px 0 0 0" }}>
                  Upcoming patient appointments and consultations
                </p>
              </div>
              <button
                onClick={fetchAppointments}
                style={{
                  backgroundColor: "#28A745",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9em",
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {appointments.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Date & Time
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Patient
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Type
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Hospital
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Consultation Type
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      style={{ borderBottom: "1px solid #dee2e6" }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div>
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {new Date(appointment.date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "bold" }}>
                          {appointment.user?.fullName}
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {appointment.user?.email}
                        </div>
                        {appointment.user?.phone && (
                          <div style={{ fontSize: "0.9em", color: "#666" }}>
                            {appointment.user?.phone}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                          }}
                        >
                          Appointment
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {appointment.hospital?.name || "Not specified"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            backgroundColor: getStatusColor(appointment.status),
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            textTransform: "capitalize",
                          }}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {appointment.consultationType || "General"}
                        {appointment.consultationType === "video" && (
                          <div style={{ fontSize: "0.8em", color: "#007BFF" }}>
                            🎥 Video Call
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            flexDirection: "column",
                          }}
                        >
                          {appointment.status === "booked" && (
                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "accepted"
                                )
                              }
                              style={{
                                backgroundColor: "#28A745",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "0.8em",
                              }}
                            >
                              Accept
                            </button>
                          )}
                          {appointment.status === "accepted" && (
                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "completed"
                                )
                              }
                              style={{
                                backgroundColor: "#007BFF",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "0.8em",
                              }}
                            >
                              Complete
                            </button>
                          )}
                          {(appointment.status === "booked" ||
                            appointment.status === "accepted") && (
                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "cancelled"
                                )
                              }
                              style={{
                                backgroundColor: "#DC3545",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "0.8em",
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>👥</div>
              <div>No appointments scheduled yet.</div>
              <div style={{ fontSize: "0.9em" }}>
                Patients can book appointments with you through the system.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OperationsManagement;
