import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    totalHospitals: 0,
    pendingApprovals: 0,
  });
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [operations, setOperations] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  // Admin calendar view state
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorAvailability, setDoctorAvailability] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [userPage, setUserPage] = useState(1);
  const [apptPage, setApptPage] = useState(1);
  const pageSize = 10;
  const [newOperation, setNewOperation] = useState({
    doctor: "",
    patient: "",
    hospital: "",
    date: "",
    time: "",
    type: "",
    outcome: "",
    notes: "",
    priority: "medium",
    duration: "",
    status: "scheduled",
  });
  const [newNotification, setNewNotification] = useState({
    message: "",
    roleTarget: "all",
    user: "",
  });
  const [notificationMode, setNotificationMode] = useState("broadcast"); // 'broadcast' or 'targeted'
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sendingNotification, setSendingNotification] = useState(false);

  const authHeaders = () => {
    const stored = JSON.parse(localStorage.getItem("opcare_user") || "{}");
    const token = stored?.token;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      console.log("Loading admin data...");

      const [statsRes, hospRes, usersRes, apptRes, opsRes, notesRes] =
        await Promise.allSettled([
          fetch("/api/admin/stats", { headers: authHeaders() }).then((r) => {
            if (!r.ok) throw new Error(`Stats API failed: ${r.status}`);
            return r.json();
          }),
          fetch("/api/admin/hospitals", { headers: authHeaders() }).then(
            (r) => {
              if (!r.ok) throw new Error(`Hospitals API failed: ${r.status}`);
              return r.json();
            }
          ),
          fetch("/api/admin/users", { headers: authHeaders() }).then((r) => {
            if (!r.ok) throw new Error(`Users API failed: ${r.status}`);
            return r.json();
          }),
          fetch("/api/admin/appointments", { headers: authHeaders() }).then(
            (r) => {
              if (!r.ok)
                throw new Error(`Appointments API failed: ${r.status}`);
              return r.json();
            }
          ),
          fetch("/api/admin/operations", { headers: authHeaders() })
            .then((r) => {
              if (!r.ok) throw new Error(`Operations API failed: ${r.status}`);
              return r.json();
            })
            .catch(() => []),
          fetch("/api/admin/notifications", { headers: authHeaders() })
            .then((r) => {
              if (!r.ok)
                throw new Error(`Notifications API failed: ${r.status}`);
              return r.json();
            })
            .catch(() => []),
        ]);

      // Handle stats
      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value || {});
      } else {
        console.error("Failed to load stats:", statsRes.reason);
        setStats({});
      }

      // Handle hospitals
      if (hospRes.status === "fulfilled") {
        const hospitalData = Array.isArray(hospRes.value) ? hospRes.value : [];
        setHospitals(hospitalData);
        console.log("Hospitals loaded:", hospitalData.length);
      } else {
        console.error("Failed to load hospitals:", hospRes.reason);
        setHospitals([]);
      }

      // Handle users
      if (usersRes.status === "fulfilled") {
        const userData = Array.isArray(usersRes.value) ? usersRes.value : [];
        setUsers(userData);
        console.log("Users loaded:", userData.length);
      } else {
        console.error("Failed to load users:", usersRes.reason);
        setUsers([]);
      }

      // Handle appointments
      if (apptRes.status === "fulfilled") {
        const appointmentData = Array.isArray(apptRes.value)
          ? apptRes.value
          : [];
        setAppointments(appointmentData);
        console.log("Appointments loaded:", appointmentData.length);
      } else {
        console.error("Failed to load appointments:", apptRes.reason);
        setAppointments([]);
      }

      // Handle operations
      if (opsRes.status === "fulfilled") {
        const operationData = Array.isArray(opsRes.value) ? opsRes.value : [];
        setOperations(operationData);
        console.log("Operations loaded:", operationData.length);
      } else {
        console.error("Failed to load operations:", opsRes.reason);
        setOperations([]);
      }

      // Handle notifications
      if (notesRes.status === "fulfilled") {
        const notificationData = Array.isArray(notesRes.value)
          ? notesRes.value
          : [];
        setNotificationsList(notificationData);
        console.log("Notifications loaded:", notificationData.length);
      } else {
        console.error("Failed to load notifications:", notesRes.reason);
        setNotificationsList([]);
      }

      console.log("Admin data loading completed");
    } catch (e) {
      console.error("Admin data load failed", e);
      // Set empty arrays to prevent UI errors
      setStats({});
      setHospitals([]);
      setUsers([]);
      setAppointments([]);
      setOperations([]);
      setNotificationsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Filtering helpers
  const norm = (s) => (s || "").toString().toLowerCase();
  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = norm(searchQuery);
    return (
      norm(u.fullName).includes(q) ||
      norm(u.email).includes(q) ||
      norm(u.role).includes(q)
    );
  });
  const usersPageCount = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );
  const usersPageItems = filteredUsers.slice(
    (userPage - 1) * pageSize,
    userPage * pageSize
  );

  const filteredAppointments = appointments.filter((a) => {
    if (!searchQuery) return true;
    const q = norm(searchQuery);
    return (
      norm(a?.user?.fullName).includes(q) ||
      norm(a?.doctor?.fullName).includes(q) ||
      norm(a?.hospital?.name).includes(q) ||
      norm(a.status).includes(q)
    );
  });
  const apptPageCount = Math.max(
    1,
    Math.ceil(filteredAppointments.length / pageSize)
  );
  const apptPageItems = filteredAppointments.slice(
    (apptPage - 1) * pageSize,
    apptPage * pageSize
  );

  // Actions
  const updateUserRole = async (userId, role) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ role }),
      });
      await loadAll();
    } catch (e) {
      console.error("Failed to update role", e);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await loadAll();
    } catch (e) {
      console.error("Failed to delete user", e);
    }
  };

  const saveHospital = async (h) => {
    try {
      if (!h.name.trim()) {
        alert("Hospital name is required");
        return;
      }
      if (!h.address.trim()) {
        alert("Hospital address is required");
        return;
      }

      const payload = {
        name: h.name.trim(),
        address: h.address.trim(),
        phone: h.phone.trim(),
        email: h.email.trim(),
      };

      const response = await fetch(`/api/admin/hospitals/${h._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to update hospital"
        );
      }

      const result = await response.json();
      console.log("Hospital updated successfully:", result);

      await loadAll();
      alert(`Hospital "${h.name}" updated successfully!`);
    } catch (e) {
      console.error("Failed to update hospital", e);
      alert("Failed to update hospital: " + e.message);
    }
  };

  const removeHospital = async (id) => {
    try {
      const response = await fetch(`/api/admin/hospitals/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to delete hospital"
        );
      }

      const result = await response.json();
      console.log("Hospital deleted successfully:", result);

      await loadAll();
      alert("Hospital deleted successfully!");
    } catch (e) {
      console.error("Failed to delete hospital", e);
      alert("Failed to delete hospital: " + e.message);
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/appointments/${id}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      await loadAll();
    } catch (e) {
      console.error("Failed to update appointment", e);
    }
  };

  const rescheduleAppointment = async (id, newDate) => {
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ date: newDate, status: "rescheduled" }),
      });
      await loadAll();
    } catch (e) {
      console.error("Failed to reschedule appointment", e);
    }
  };

  // Operations actions
  const createOperationAdmin = async () => {
    try {
      await fetch("/api/admin/operations", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newOperation),
      });
      setNewOperation({
        doctor: "",
        patient: "",
        hospital: "",
        date: "",
        time: "",
        type: "",
        outcome: "",
        notes: "",
        priority: "medium",
        duration: "",
        status: "scheduled",
      });
      await loadAll();
      alert("Operation assigned to doctor successfully!");
    } catch (e) {
      console.error("Failed to create operation", e);
      alert("Failed to assign operation. Please try again.");
    }
  };

  const updateOperationAdmin = async (op) => {
    try {
      await fetch(`/api/admin/operations/${op._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(op),
      });
      await loadAll();
    } catch (e) {
      console.error("Failed to update operation", e);
    }
  };

  const deleteOperationAdmin = async (id) => {
    try {
      await fetch(`/api/admin/operations/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await loadAll();
    } catch (e) {
      console.error("Failed to delete operation", e);
    }
  };

  // User search for notifications
  const searchUsers = (query, role = null) => {
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }

    let filteredUsers = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );

    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === role);
    }

    setUserSearchResults(filteredUsers.slice(0, 10)); // Limit to 10 results
  };

  // Notifications actions
  const createNotificationAdmin = async () => {
    if (sendingNotification) return; // Prevent double submission

    try {
      setSendingNotification(true);

      // Validate form data
      if (!newNotification.message.trim()) {
        alert("Please enter a message");
        return;
      }

      if (notificationMode === "targeted" && !selectedUser) {
        alert("Please select a user to send the message to");
        return;
      }

      // Prepare notification data
      const notificationData = {
        message: newNotification.message.trim(),
      };

      if (notificationMode === "broadcast") {
        notificationData.roleTarget = newNotification.roleTarget;
      } else {
        // For targeted messages, set the specific user
        notificationData.user = selectedUser._id;
        // Don't set roleTarget for targeted messages
      }

      console.log("Sending notification:", notificationData);

      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send notification");
      }

      const result = await response.json();
      console.log("Notification sent successfully:", result);

      // Show success message
      if (notificationMode === "targeted") {
        alert(`Message sent successfully to ${selectedUser.fullName}!`);
      } else {
        alert(
          `Broadcast message sent successfully to ${
            newNotification.roleTarget === "all"
              ? "all users"
              : "all " + newNotification.roleTarget + "s"
          }!`
        );
      }

      // Reset form
      setNewNotification({ message: "", roleTarget: "all", user: "" });
      setSelectedUser(null);
      setUserSearchQuery("");
      setUserSearchResults([]);
      setNotificationMode("broadcast");

      await loadAll();
    } catch (e) {
      console.error("Failed to create notification", e);
      alert("Failed to send notification: " + e.message);
    } finally {
      setSendingNotification(false);
    }
  };

  const deleteNotificationAdmin = async (id) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await loadAll();
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "hospitals", label: "Manage Hospitals", icon: "🏥" },
    { id: "doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
    { id: "calendar", label: "Doctor Calendar", icon: "📅" },
    { id: "appointments", label: "Appointments Overview", icon: "📋" },
    { id: "operations", label: "Operations / Surgeries", icon: "🧑‍⚕️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "reports", label: "Reports/Analytics", icon: "📈" },
  ];

  const renderDashboardOverview = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-number">{stats.totalHospitals}</div>
          <div className="stat-label">Total Hospitals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-number">
            {users.filter((u) => u.role === "doctor").length}
          </div>
          <div className="stat-label">Total Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{stats.totalAppointments}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
      </div>
    </div>
  );

  const createHospital = async () => {
    try {
      // Validate input fields
      if (!newHospital.name.trim()) {
        alert("Hospital name is required");
        return;
      }
      if (!newHospital.address.trim()) {
        alert("Hospital address is required");
        return;
      }

      const response = await fetch("/api/admin/hospitals", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newHospital),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to create hospital"
        );
      }

      const result = await response.json();
      console.log("Hospital created successfully:", result);

      // Clear the form
      setNewHospital({ name: "", address: "", phone: "", email: "" });

      // Reload all data to show the new hospital
      await loadAll();

      // Show success message
      alert(
        `Hospital "${result.name || newHospital.name}" created successfully!`
      );
    } catch (e) {
      console.error("Failed to create hospital", e);
      alert("Failed to create hospital: " + e.message);
    }
  };

  const renderManageHospitals = () => (
    <div className="manage-hospitals">
      <div className="section-header">
        <h2>Manage Hospitals ({hospitals.length})</h2>
        <div
          className="profile-form"
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <input
            placeholder="Hospital Name *"
            value={newHospital.name}
            onChange={(e) =>
              setNewHospital({ ...newHospital, name: e.target.value })
            }
            required
          />
          <input
            placeholder="Address *"
            value={newHospital.address}
            onChange={(e) =>
              setNewHospital({ ...newHospital, address: e.target.value })
            }
            required
          />
          <input
            placeholder="Phone"
            value={newHospital.phone}
            onChange={(e) =>
              setNewHospital({ ...newHospital, phone: e.target.value })
            }
          />
          <input
            placeholder="Email"
            value={newHospital.email}
            onChange={(e) =>
              setNewHospital({ ...newHospital, email: e.target.value })
            }
          />
          <button
            className="add-btn"
            onClick={createHospital}
            disabled={!newHospital.name.trim() || !newHospital.address.trim()}
            style={{
              opacity:
                !newHospital.name.trim() || !newHospital.address.trim()
                  ? 0.6
                  : 1,
              cursor:
                !newHospital.name.trim() || !newHospital.address.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            + Add Hospital
          </button>
        </div>
      </div>

      {hospitals.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            margin: "20px 0",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏥</div>
          <h3>No hospitals found</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Add your first hospital using the form above to get started.
          </p>
        </div>
      ) : (
        <div className="hospitals-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital) => (
                <tr key={hospital._id}>
                  <td>
                    <input
                      defaultValue={hospital.name}
                      onBlur={(e) => {
                        hospital.name = e.target.value;
                      }}
                      style={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        padding: "5px",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>
                    <input
                      defaultValue={hospital.address}
                      onBlur={(e) => {
                        hospital.address = e.target.value;
                      }}
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>
                    <input
                      defaultValue={hospital.phone}
                      onBlur={(e) => {
                        hospital.phone = e.target.value;
                      }}
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>
                    <input
                      defaultValue={hospital.email}
                      onBlur={(e) => {
                        hospital.email = e.target.value;
                      }}
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => saveHospital(hospital)}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        marginRight: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${hospital.name}"?`
                          )
                        ) {
                          removeHospital(hospital._id);
                        }
                      }}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderManageDoctors = () => {
    const doctors = users.filter((u) => u.role === "doctor");
    const filteredDoctors = usersPageItems.filter((u) => u.role === "doctor");
    return (
      <div className="manage-doctors">
        <div className="section-header">
          <h2>Manage Doctors</h2>
          <button className="add-btn">+ Add Doctor</button>
        </div>
        <div className="doctors-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.fullName}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.phone || "-"}</td>
                  <td>
                    <select
                      defaultValue={doctor.role}
                      onChange={(e) =>
                        updateUserRole(doctor._id, e.target.value)
                      }
                    >
                      <option value="patient">patient</option>
                      <option value="doctor">doctor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteUser(doctor._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.75rem",
            }}
          >
            <span>
              Showing {filteredDoctors.length} of{" "}
              {filteredUsers.filter((u) => u.role === "doctor").length} doctors
            </span>
            <div>
              <button
                className="action-btn"
                disabled={userPage <= 1}
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span style={{ margin: "0 0.5rem" }}>
                {userPage} / {usersPageCount}
              </span>
              <button
                className="action-btn"
                disabled={userPage >= usersPageCount}
                onClick={() =>
                  setUserPage((p) => Math.min(usersPageCount, p + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Load a doctor's availability for calendar view
  const loadDoctorAvailability = async () => {
    try {
      if (!selectedDoctorId) {
        alert("Please select a doctor");
        return;
      }
      setCalendarLoading(true);
      const data = await fetch(
        `/api/admin/doctors/${selectedDoctorId}/availability`,
        { headers: authHeaders() }
      ).then((r) => r.json());
      setDoctorAvailability(data || {});
    } catch (e) {
      console.error("Failed to load doctor availability", e);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Search doctors by name
  const searchDoctors = (query) => {
    const doctors = users.filter((u) => u.role === "doctor");
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = doctors.filter((doctor) =>
      doctor.fullName.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  // Load availability for a specific doctor
  const loadDoctorAvailabilityById = async (doctorId) => {
    try {
      setCalendarLoading(true);
      const data = await fetch(`/api/admin/doctors/${doctorId}/availability`, {
        headers: authHeaders(),
      }).then((r) => r.json());
      return data || {};
    } catch (e) {
      console.error("Failed to load doctor availability", e);
      return {};
    } finally {
      setCalendarLoading(false);
    }
  };

  // Doctor Card Component for search results
  const DoctorCard = ({ doctor, onSelect, loadAvailability }) => {
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const data = await loadAvailability(doctor._id);
        setAvailability(data);
      } catch (e) {
        console.error("Failed to load availability for doctor", doctor._id, e);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchAvailability();
    }, [doctor._id]);

    const formatDate = (dateString) => {
      if (!dateString) return "Not set";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    const formatDateShort = (dateString) => {
      if (!dateString) return "Not set";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      } catch {
        return dateString;
      }
    };

    const getCurrentDate = () => {
      const today = new Date();
      return today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getWeekDays = () => {
      const today = new Date();
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        week.push({
          date: date,
          dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
          dayNumber: date.getDate(),
          isToday: i === 0,
        });
      }
      return week;
    };

    const getAvailabilityStatus = () => {
      if (loading) return "Loading...";
      if (!availability) return "No data available";
      return availability.status || "Available";
    };

    const getVisitingHours = () => {
      if (loading) return "Loading...";
      if (!availability || !availability.hours) return "Not set";
      return availability.hours;
    };

    return (
      <div className="doctor-card">
        <div className="doctor-card-header">
          <h4>{doctor.fullName}</h4>
          <span
            className={`availability-status ${getAvailabilityStatus()
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {getAvailabilityStatus()}
          </span>
        </div>

        <div className="doctor-card-body">
          <div className="doctor-info">
            <p>
              <strong>Email:</strong> {doctor.email}
            </p>
            <p>
              <strong>Phone:</strong> {doctor.phone || "Not provided"}
            </p>
            <p>
              <strong>Visiting Hours:</strong> {getVisitingHours()}
            </p>
          </div>

          {/* Current Date and Day */}
          <div className="current-date-section">
            <h5>📅 Today's Schedule</h5>
            <p className="current-date">
              <strong>{getCurrentDate()}</strong>
            </p>
            <p className="today-status">
              <strong>Status:</strong> {getAvailabilityStatus()}
            </p>
          </div>

          {/* Weekly Schedule */}
          <div className="weekly-schedule">
            <h5>📋 This Week</h5>
            <div className="week-days">
              {getWeekDays().map((day, index) => (
                <div
                  key={index}
                  className={`day-item ${day.isToday ? "today" : ""}`}
                >
                  <span className="day-name">{day.dayName}</span>
                  <span className="day-number">{day.dayNumber}</span>
                  <span className="day-status">
                    {day.isToday ? "🟢" : "⚪"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="additional-info">
            <p>
              <strong>Last Updated:</strong>{" "}
              {formatDateShort(availability?.updatedAt)}
            </p>
            {availability?.nextAvailableDate && (
              <p>
                <strong>Next Available:</strong>{" "}
                {formatDate(availability.nextAvailableDate)}
              </p>
            )}
          </div>

          <div className="doctor-card-actions">
            <button className="select-doctor-btn" onClick={onSelect}>
              Select Doctor
            </button>
            <button
              className="refresh-btn"
              onClick={fetchAvailability}
              disabled={loading}
            >
              {loading ? "⏳" : "🔄"} Refresh
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDoctorCalendar = () => {
    const doctors = users.filter((u) => u.role === "doctor");
    return (
      <div className="doctor-calendar">
        <h2>Doctor Calendar Management</h2>

        {/* Search Section */}
        <div className="doctor-search-section">
          <div className="search-container">
            <input
              type="text"
              className="doctor-search-input"
              placeholder="Search doctor by name..."
              value={doctorSearchQuery}
              onChange={(e) => {
                setDoctorSearchQuery(e.target.value);
                searchDoctors(e.target.value);
              }}
            />
            <button className="search-btn">🔍</button>
          </div>

          {/* Search Results */}
          {showSearchResults && (
            <div className="search-results">
              <h3>Search Results ({searchResults.length} doctors found)</h3>
              {searchResults.length === 0 ? (
                <p className="no-results">
                  No doctors found matching your search.
                </p>
              ) : (
                <div className="doctor-results-grid">
                  {searchResults.map((doctor) => (
                    <DoctorCard
                      key={doctor._id}
                      doctor={doctor}
                      onSelect={() => {
                        setSelectedDoctorId(doctor._id);
                        setDoctorSearchQuery(doctor.fullName);
                        setShowSearchResults(false);
                        loadDoctorAvailability();
                      }}
                      loadAvailability={loadDoctorAvailabilityById}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="calendar-controls">
          <select
            className="doctor-select"
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              setDoctorAvailability(null);
            }}
          >
            <option value="">Select Doctor</option>
            {users
              .filter((u) => u.role === "doctor")
              .map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.fullName}
                </option>
              ))}
          </select>
          <button className="view-slots-btn" onClick={loadDoctorAvailability}>
            View Slots
          </button>
        </div>
        <div className="calendar-view">
          {!selectedDoctorId && (
            <p>Select a doctor to view and manage their available slots.</p>
          )}
          {selectedDoctorId && calendarLoading && (
            <p>Loading availability...</p>
          )}
          {selectedDoctorId && !calendarLoading && doctorAvailability && (
            <div
              className="availability-summary"
              style={{ marginTop: "0.75rem" }}
            >
              <p>
                <strong>Status:</strong>{" "}
                {doctorAvailability.status || "Available"}
              </p>
              <p>
                <strong>Visiting Hours:</strong>{" "}
                {doctorAvailability.hours || "-"}
              </p>
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.9rem",
                  color: "#555",
                }}
              >
                <em>
                  Slots are based on the doctor's visiting hours. For structured
                  slotting, store hours in a structured format (e.g., per-day
                  ranges).
                </em>
              </div>
            </div>
          )}
          {selectedDoctorId && !calendarLoading && !doctorAvailability && (
            <p>No availability set for this doctor.</p>
          )}
          <div className="slot-legend">
            <span className="legend-item">🟢 Available</span>
            <span className="legend-item">🔴 Emergency</span>
            <span className="legend-item">🔵 Booked</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAppointmentsOverview = () => (
    <div className="appointments-overview">
      <div className="section-header">
        <h2>Appointments Overview</h2>
        <div className="filters">
          <select>
            <option>All Hospitals</option>
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.name}
              </option>
            ))}
          </select>
          <input type="date" />
        </div>
      </div>
      <div className="appointments-list">
        {apptPageItems.map((appointment) => (
          <div key={appointment._id} className="appointment-card">
            <div className="appointment-header">
              <h3>{appointment?.user?.fullName || "Patient"}</h3>
              <span className={`status ${appointment.status}`}>
                {appointment.status}
              </span>
            </div>
            <div className="appointment-details">
              <p>
                <strong>Doctor:</strong> {appointment?.doctor?.fullName || "-"}
              </p>
              <p>
                <strong>Hospital:</strong> {appointment?.hospital?.name || "-"}
              </p>
              <p>
                <strong>Date:</strong> {appointment.date}
              </p>
              <div style={{ marginTop: "0.5rem" }}>
                <label>Update Status: </label>
                <select
                  defaultValue={appointment.status}
                  onChange={(e) =>
                    updateAppointmentStatus(appointment._id, e.target.value)
                  }
                >
                  <option value="booked">booked</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                  <option value="rescheduled">rescheduled</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <label>Reschedule: </label>
                <input
                  type="datetime-local"
                  onChange={(e) => (appointment._newDate = e.target.value)}
                />
                <button
                  className="action-btn"
                  onClick={() =>
                    appointment._newDate &&
                    rescheduleAppointment(appointment._id, appointment._newDate)
                  }
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.75rem",
        }}
      >
        <span>
          Showing {apptPageItems.length} of {filteredAppointments.length}{" "}
          appointments
        </span>
        <div>
          <button
            className="action-btn"
            disabled={apptPage <= 1}
            onClick={() => setApptPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span style={{ margin: "0 0.5rem" }}>
            {apptPage} / {apptPageCount}
          </span>
          <button
            className="action-btn"
            disabled={apptPage >= apptPageCount}
            onClick={() => setApptPage((p) => Math.min(apptPageCount, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderOperations = () => (
    <div className="operations-admin">
      <div className="section-header">
        <h2>Operations / Surgeries Assignment</h2>
        <p>
          Assign operations to doctors and monitor surgical schedules across the
          system.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h3>Assign New Operation</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
          }}
        >
          {/* Doctor Selection */}
          <div>
            <label>Assign to Doctor *</label>
            <select
              value={newOperation.doctor}
              onChange={(e) =>
                setNewOperation({ ...newOperation, doctor: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="">Select Doctor</option>
              {users
                .filter((u) => u.role === "doctor")
                .map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.fullName} -{" "}
                    {doctor.doctorProfile?.specialization || "General"}
                  </option>
                ))}
            </select>
          </div>

          {/* Patient Selection */}
          <div>
            <label>Patient *</label>
            <select
              value={newOperation.patient}
              onChange={(e) =>
                setNewOperation({ ...newOperation, patient: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="">Select Patient</option>
              {users
                .filter((u) => u.role === "patient")
                .map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.fullName} - {patient.email}
                  </option>
                ))}
            </select>
          </div>

          {/* Hospital Selection */}
          <div>
            <label>Hospital</label>
            <select
              value={newOperation.hospital}
              onChange={(e) =>
                setNewOperation({ ...newOperation, hospital: e.target.value })
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
            <label>Operation Date *</label>
            <input
              type="date"
              value={newOperation.date}
              onChange={(e) =>
                setNewOperation({ ...newOperation, date: e.target.value })
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
            <label>Operation Time</label>
            <input
              type="time"
              value={newOperation.time || ""}
              onChange={(e) =>
                setNewOperation({ ...newOperation, time: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
          </div>

          {/* Priority */}
          <div>
            <label>Priority</label>
            <select
              value={newOperation.priority || "medium"}
              onChange={(e) =>
                setNewOperation({ ...newOperation, priority: e.target.value })
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

        {/* Operation Type and Notes */}
        <div
          style={{
            marginTop: "15px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          <div>
            <label>Operation Type *</label>
            <input
              type="text"
              placeholder="e.g., Appendectomy, Heart Surgery, Knee Replacement..."
              value={newOperation.type}
              onChange={(e) =>
                setNewOperation({ ...newOperation, type: e.target.value })
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

          <div>
            <label>Duration (minutes)</label>
            <input
              type="number"
              placeholder="60"
              value={newOperation.duration || ""}
              onChange={(e) =>
                setNewOperation({ ...newOperation, duration: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          <label>Initial Notes</label>
          <textarea
            placeholder="Special instructions, patient history, pre-operative notes..."
            value={newOperation.notes}
            onChange={(e) =>
              setNewOperation({ ...newOperation, notes: e.target.value })
            }
            rows="3"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <button
          className="add-btn"
          onClick={createOperationAdmin}
          style={{
            marginTop: "15px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🏥 Assign Operation to Doctor
        </button>
      </div>

      <div
        className="hospitals-table"
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
          <h3>All Operations Overview ({operations.length})</h3>
        </div>

        {operations.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Date & Time
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Operation Type
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Doctor</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Patient
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Hospital
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Priority
                  </th>
                  <th style={{ padding: "12px", textAlign: "left" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr
                    key={op._id}
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td style={{ padding: "12px" }}>
                      <div>{new Date(op.date).toLocaleDateString()}</div>
                      {op.time && (
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {op.time}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "bold" }}>{op.type}</div>
                      {op.duration && (
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {op.duration} min
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "bold" }}>
                        Dr. {op?.doctor?.fullName || "Unassigned"}
                      </div>
                      {op?.doctor?.email && (
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {op.doctor.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "bold" }}>
                        {op?.patient?.fullName || "Unknown"}
                      </div>
                      {op?.patient?.email && (
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {op.patient.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {op?.hospital?.name || "Not specified"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          backgroundColor:
                            op.status === "completed"
                              ? "#28A745"
                              : op.status === "in-progress"
                              ? "#007BFF"
                              : op.status === "cancelled"
                              ? "#DC3545"
                              : "#FFA500",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.8em",
                          textTransform: "capitalize",
                        }}
                      >
                        {op.status || "scheduled"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          backgroundColor:
                            op.priority === "critical"
                              ? "#DC3545"
                              : op.priority === "high"
                              ? "#FD7E14"
                              : op.priority === "medium"
                              ? "#FFC107"
                              : "#28A745",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.8em",
                          textTransform: "capitalize",
                        }}
                      >
                        {op.priority || "medium"}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          className="action-btn edit"
                          onClick={() => updateOperationAdmin(op)}
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
                          Reassign
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => deleteOperationAdmin(op._id)}
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
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏥</div>
            <div>No operations assigned yet.</div>
            <div style={{ fontSize: "0.9em" }}>
              Assign operations to doctors to get started.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsAdmin = () => (
    <div className="notifications-admin">
      <div className="section-header">
        <h2>Notifications Management</h2>
      </div>

      {/* Notification Mode Selector */}
      <div className="notification-mode-selector">
        <h3>Select Notification Type</h3>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${
              notificationMode === "broadcast" ? "active" : ""
            }`}
            onClick={() => {
              setNotificationMode("broadcast");
              setSelectedUser(null);
              setUserSearchQuery("");
              setUserSearchResults([]);
            }}
          >
            📢 Broadcast Message
          </button>
          <button
            className={`mode-btn ${
              notificationMode === "targeted" ? "active" : ""
            }`}
            onClick={() => setNotificationMode("targeted")}
          >
            🎯 Send to Specific Person
          </button>
        </div>
      </div>

      {/* Notification Form */}
      <div className="notification-form">
        {notificationMode === "broadcast" ? (
          <div className="broadcast-form">
            <h4>📢 Broadcast Message</h4>
            <div className="form-row">
              <textarea
                placeholder="Enter your message..."
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    message: e.target.value,
                  })
                }
                className="message-textarea"
                rows="3"
              />
            </div>
            <div className="form-row">
              <label>Send to:</label>
              <select
                value={newNotification.roleTarget}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    roleTarget: e.target.value,
                  })
                }
                className="role-select"
              >
                <option value="all">🌐 All Users</option>
                <option value="patient">🏥 All Patients</option>
                <option value="doctor">👨‍⚕️ All Doctors</option>
                <option value="admin">👤 All Admins</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="targeted-form">
            <h4>🎯 Send to Specific Person</h4>

            {/* User Search */}
            <div className="form-row">
              <label>Search for user:</label>
              <div className="user-search-container">
                <input
                  type="text"
                  placeholder="Type name or email to search..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="user-search-input"
                />
                <select
                  onChange={(e) => {
                    setUserSearchQuery("");
                    searchUsers("", e.target.value);
                  }}
                  className="filter-select"
                >
                  <option value="">All Roles</option>
                  <option value="doctor">Doctors Only</option>
                  <option value="patient">Patients Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
            </div>

            {/* Search Results */}
            {userSearchResults.length > 0 && (
              <div className="user-search-results">
                <h5>Select a user:</h5>
                <div className="user-results-list">
                  {userSearchResults.map((user) => (
                    <div
                      key={user._id}
                      className={`user-result-item ${
                        selectedUser?._id === user._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearchQuery(user.fullName);
                        setUserSearchResults([]);
                      }}
                    >
                      <div className="user-info">
                        <span className="user-name">{user.fullName}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <span className={`user-role ${user.role}`}>
                        {user.role === "doctor"
                          ? "👨‍⚕️"
                          : user.role === "patient"
                          ? "🏥"
                          : "👤"}{" "}
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected User Display */}
            {selectedUser && (
              <div className="selected-user">
                <h5>Sending to:</h5>
                <div className="selected-user-card">
                  <div className="user-details">
                    <strong>{selectedUser.fullName}</strong>
                    <span>{selectedUser.email}</span>
                    <span className={`role-badge ${selectedUser.role}`}>
                      {selectedUser.role === "doctor"
                        ? "👨‍⚕️ Doctor"
                        : selectedUser.role === "patient"
                        ? "🏥 Patient"
                        : "👤 Admin"}
                    </span>
                    <small style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      User ID: {selectedUser._id}
                    </small>
                  </div>
                  <button
                    className="remove-user-btn"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserSearchQuery("");
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="form-row">
              <label>Message:</label>
              <textarea
                placeholder="Enter your message..."
                value={newNotification.message}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    message: e.target.value,
                  })
                }
                className="message-textarea"
                rows="3"
              />
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="form-actions">
          <button
            className="send-notification-btn"
            onClick={createNotificationAdmin}
            disabled={
              sendingNotification ||
              !newNotification.message.trim() ||
              (notificationMode === "targeted" && !selectedUser)
            }
          >
            {sendingNotification
              ? "⏳ Sending..."
              : notificationMode === "broadcast"
              ? "📢 Send Broadcast"
              : "🎯 Send Message"}
          </button>
        </div>
      </div>

      {/* Notifications History */}
      <div className="notifications-history">
        <h3>📋 Notifications History</h3>
        <div className="hospitals-table">
          <table>
            <thead>
              <tr>
                <th>Message</th>
                <th>Type</th>
                <th>Target</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notificationsList.map((n) => (
                <tr key={n._id}>
                  <td className="message-cell">
                    <div className="message-preview">
                      {n.message.length > 50
                        ? `${n.message.substring(0, 50)}...`
                        : n.message}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`notification-type ${
                        n.user ? "targeted" : "broadcast"
                      }`}
                    >
                      {n.user ? "🎯 Targeted" : "📢 Broadcast"}
                    </span>
                  </td>
                  <td>
                    {n.user ? (
                      <span className="target-user">
                        👤 {n.user?.fullName || "Specific User"}
                      </span>
                    ) : (
                      <span className={`target-role ${n.roleTarget}`}>
                        {n.roleTarget === "all"
                          ? "🌐 All Users"
                          : n.roleTarget === "doctor"
                          ? "👨‍⚕️ All Doctors"
                          : n.roleTarget === "patient"
                          ? "🏥 All Patients"
                          : n.roleTarget === "admin"
                          ? "👤 All Admins"
                          : n.roleTarget}
                      </span>
                    )}
                  </td>
                  <td>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}
                  </td>
                  <td>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteNotificationAdmin(n._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReportsAnalytics = () => (
    <div className="reports-analytics">
      <h2>Reports & Analytics</h2>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Appointment Trends</h3>
          <div className="chart-placeholder">
            <p>📊 Appointment trends chart will appear here</p>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Hospital Usage</h3>
          <div className="chart-placeholder">
            <p>📈 Hospital usage statistics will appear here</p>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Doctor Performance</h3>
          <div className="chart-placeholder">
            <p>📉 Doctor performance metrics will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardOverview();
      case "hospitals":
        return renderManageHospitals();
      case "doctors":
        return renderManageDoctors();
      case "calendar":
        return renderDoctorCalendar();
      case "appointments":
        return renderAppointmentsOverview();
      case "operations":
        return renderOperations();
      case "notifications":
        return renderNotificationsAdmin();
      case "reports":
        return renderReportsAnalytics();
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Top Navigation */}
      <nav className="admin-top-nav">
        <div className="nav-left">
          <div className="logo">
            <Link to="/home">OP Care</Link>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search doctor/hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        <div className="nav-right">
          <div className="notifications">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              <span className="notification-badge">3</span>
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-item">
                  <p>New appointment request</p>
                  <span>2 min ago</span>
                </div>
                <div className="notification-item">
                  <p>Hospital registration pending</p>
                  <span>1 hour ago</span>
                </div>
                <div className="notification-item">
                  <p>Emergency slot booked</p>
                  <span>3 hours ago</span>
                </div>
              </div>
            )}
          </div>
          <div className="admin-profile">
            <button
              className="profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              👤 Admin
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <Link to="/profile">Profile</Link>
                <Link to="/settings">Settings</Link>
                <button>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="admin-main-content">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`sidebar-item ${
                    activeSection === item.id ? "active" : ""
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="admin-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
