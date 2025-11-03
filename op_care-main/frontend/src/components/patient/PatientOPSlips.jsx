import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/patient-components.css";

function PatientOPSlips() {
  const { user } = useContext(UserContext);
  const [opSlips, setOPSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: "",
    hospital: "",
    status: "",
  });

  // Fetch OP Slips from API
  const fetchOPSlips = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append("date", filters.date);
      if (filters.hospital) queryParams.append("hospital", filters.hospital);
      if (filters.status) queryParams.append("status", filters.status);

      const response = await fetch(
        `http://localhost:5000/api/opslips/patient/${user.id}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOPSlips(data.opSlips || []);
      } else {
        console.error("Failed to fetch OP slips");
        setOPSlips([]);
      }
    } catch (error) {
      console.error("Error fetching OP slips:", error);
      setOPSlips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOPSlips();
  }, [user, filters]);
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading OP slips...</div>;
  }

  return (
    <div className="patient-component">
      <div className="component-header">
        <h2>🏥 OP Slips</h2>
        <p>View your outpatient consultation slips and records</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            placeholder="Filter by date"
          />
          <select
            value={filters.hospital}
            onChange={(e) =>
              setFilters({ ...filters, hospital: e.target.value })
            }
          >
            <option value="">All Hospitals</option>
            <option value="city-general">City General Hospital</option>
            <option value="metro-care">Metro Care Center</option>
            <option value="sunshine">Sunshine Medical</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* OP Slips List */}
      <div className="items-list">
        {opSlips.length === 0 ? (
          <div className="no-items">
            <div className="no-items-icon">🏥</div>
            <h3>No OP slips available</h3>
            <p>
              OP slips are generated automatically after successful payment for
              appointments. Complete your payment to get your OP slip.
            </p>
          </div>
        ) : (
          opSlips.map((slip) => (
            <div key={slip._id || slip.id} className="item-card">
              <div className="item-header">
                <div className="item-info">
                  <h4>📋 OP Slip #{slip.slipNumber}</h4>
                  <p className="hospital-name">🏥 {slip.hospital?.name}</p>
                  <p className="doctor-name">
                    👨‍⚕️ {slip.doctor?.fullName || "Doctor to be assigned"}
                  </p>
                </div>
                <div
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(slip.status) }}
                >
                  {slip.status || "completed"}
                </div>
              </div>

              <div className="item-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <strong>Visit Date:</strong>
                      <span>{formatDate(slip.visitDate || slip.date)}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🕐</span>
                    <div className="detail-content">
                      <strong>Time:</strong>
                      <span>{slip.visitTime || slip.time}</span>
                    </div>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">🩺</span>
                    <div className="detail-content">
                      <strong>Department:</strong>
                      <span>{slip.department}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💰</span>
                    <div className="detail-content">
                      <strong>Consultation Fee:</strong>
                      <span>₹{slip.consultationFee}</span>
                    </div>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">🏥</span>
                    <div className="detail-content">
                      <strong>Hospital:</strong>
                      <span>{slip.hospital?.name}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👨‍⚕️</span>
                    <div className="detail-content">
                      <strong>Doctor:</strong>
                      <span>{slip.doctor?.fullName || "To be assigned"}</span>
                    </div>
                  </div>
                </div>
                {slip.chiefComplaint && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-icon">🔍</span>
                      <div className="detail-content">
                        <strong>Chief Complaint:</strong>
                        <span>{slip.chiefComplaint}</span>
                      </div>
                    </div>
                  </div>
                )}
                {slip.symptoms && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-icon">📋</span>
                      <div className="detail-content">
                        <strong>Symptoms:</strong>
                        <span>{slip.symptoms}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="item-actions">
                <button className="btn-primary" title="Download Slip">
                  📥 Download
                </button>
                <button className="btn-secondary" title="View Details">
                  👁️ View
                </button>
                {slip.status === "completed" && (
                  <button className="btn-success" title="Get Prescription">
                    📝 Prescription
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Information Note */}
      <div className="demo-note">
        <p>
          � <strong>How OP Slips Work:</strong> OP (Outpatient) slips are
          automatically generated when you complete payment for an appointment.
          The slip contains your visit details and serves as proof of
          registration for your hospital visit.
        </p>
      </div>
    </div>
  );
}

export default PatientOPSlips;
