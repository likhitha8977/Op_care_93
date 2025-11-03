import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/patient-components.css";

function PatientPreviousRecords() {
  const { user } = useContext(UserContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: "",
    doctor: "",
    type: "",
    hospital: "",
  });

  // Fetch Previous Records
  const fetchRecords = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append("date", filters.date);
      if (filters.doctor) queryParams.append("doctor", filters.doctor);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.hospital) queryParams.append("hospital", filters.hospital);

      const response = await fetch(
        `http://localhost:5000/api/records/patient/${user.id}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      } else {
        console.error("Failed to fetch records");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecords();
    }
  }, [user, filters]);

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case "consultation":
        return "🩺";
      case "lab_report":
        return "🧪";
      case "xray":
        return "🩻";
      case "surgery":
        return "⚕️";
      case "vaccination":
        return "💉";
      case "discharge":
        return "📋";
      default:
        return "📄";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "consultation":
        return "#3b82f6";
      case "lab_report":
        return "#10b981";
      case "xray":
        return "#8b5cf6";
      case "surgery":
        return "#ef4444";
      case "vaccination":
        return "#f59e0b";
      case "discharge":
        return "#6b7280";
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
    return <div className="loading">Loading medical records...</div>;
  }

  return (
    <div className="patient-component">
      <div className="component-header">
        <h2>📄 Previous Records</h2>
        <p>Access your complete medical history and records</p>
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
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="lab_report">Lab Report</option>
            <option value="xray">X-Ray</option>
            <option value="surgery">Surgery</option>
            <option value="vaccination">Vaccination</option>
            <option value="discharge">Discharge Summary</option>
          </select>
          <select
            value={filters.doctor}
            onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
          >
            <option value="">All Doctors</option>
            <option value="dr-smith">Dr. Smith</option>
            <option value="dr-patel">Dr. Patel</option>
            <option value="dr-johnson">Dr. Johnson</option>
          </select>
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
        </div>
      </div>

      {/* Records List */}
      <div className="items-list">
        {records.length === 0 ? (
          <div className="no-items">
            <div className="no-items-icon">📄</div>
            <h3>No medical records available</h3>
            <p>Your medical history and records will appear here</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record._id || record.id} className="item-card">
              <div className="item-header">
                <div className="item-info">
                  <div
                    className="record-type"
                    style={{ color: getTypeColor(record.type) }}
                  >
                    {getRecordTypeIcon(record.type || "consultation")}
                    <h4>{record.title || "Medical Record"}</h4>
                  </div>
                  <p className="doctor-name">
                    👨‍⚕️ Dr. {record.doctor || "Smith"}
                  </p>
                  <p className="hospital-name">
                    🏥 {record.hospital || "General Hospital"}
                  </p>
                </div>
                <div className="record-date">
                  <span>{formatDate(record.date || new Date())}</span>
                </div>
              </div>

              <div className="item-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">🔍</span>
                    <div className="detail-content">
                      <strong>Diagnosis:</strong>
                      <span>
                        {record.diagnosis || "General health checkup"}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🩺</span>
                    <div className="detail-content">
                      <strong>Department:</strong>
                      <span>{record.department || "General Medicine"}</span>
                    </div>
                  </div>
                </div>

                {record.symptoms && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-icon">⚠️</span>
                      <div className="detail-content">
                        <strong>Symptoms:</strong>
                        <span>{record.symptoms}</span>
                      </div>
                    </div>
                  </div>
                )}

                {record.treatment && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-icon">💊</span>
                      <div className="detail-content">
                        <strong>Treatment:</strong>
                        <span>{record.treatment}</span>
                      </div>
                    </div>
                  </div>
                )}

                {record.followUp && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-icon">📅</span>
                      <div className="detail-content">
                        <strong>Follow-up:</strong>
                        <span>{record.followUp}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="item-actions">
                <button className="btn-primary" title="Download Record">
                  📥 Download
                </button>
                <button className="btn-secondary" title="View Details">
                  👁️ View Details
                </button>
                {record.type === "lab_report" && (
                  <button className="btn-success" title="View Results">
                    🧪 Lab Results
                  </button>
                )}
                {record.prescription && (
                  <button className="btn-info" title="View Prescription">
                    💊 Prescription
                  </button>
                )}
                <button className="btn-warning" title="Share Record">
                  📤 Share
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mock Records for Demo */}
      {records.length === 0 && (
        <div className="demo-records">
          <h3>Sample Medical Records:</h3>
          <div className="demo-records-list">
            {[
              {
                id: "demo1",
                type: "consultation",
                title: "General Consultation",
                doctor: "Dr. Smith",
                hospital: "City General Hospital",
                date: new Date("2024-10-15"),
                diagnosis: "Mild fever and headache",
                treatment: "Rest and medication prescribed",
              },
              {
                id: "demo2",
                type: "lab_report",
                title: "Blood Test Report",
                doctor: "Dr. Patel",
                hospital: "Metro Care Center",
                date: new Date("2024-10-10"),
                diagnosis: "Complete blood count - Normal",
                treatment: "No action required",
              },
              {
                id: "demo3",
                type: "xray",
                title: "Chest X-Ray",
                doctor: "Dr. Johnson",
                hospital: "Sunshine Medical",
                date: new Date("2024-09-20"),
                diagnosis: "Clear chest, no abnormalities",
                treatment: "Continue current medication",
              },
            ].map((demo) => (
              <div key={demo.id} className="item-card demo">
                <div className="item-header">
                  <div className="item-info">
                    <div
                      className="record-type"
                      style={{ color: getTypeColor(demo.type) }}
                    >
                      {getRecordTypeIcon(demo.type)}
                      <h4>{demo.title}</h4>
                    </div>
                    <p className="doctor-name">👨‍⚕️ {demo.doctor}</p>
                    <p className="hospital-name">🏥 {demo.hospital}</p>
                  </div>
                  <div className="record-date">
                    <span>{formatDate(demo.date)}</span>
                  </div>
                </div>
                <div className="item-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">🔍</span>
                      <div className="detail-content">
                        <strong>Diagnosis:</strong>
                        <span>{demo.diagnosis}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientPreviousRecords;
