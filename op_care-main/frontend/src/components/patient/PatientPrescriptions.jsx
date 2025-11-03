import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/patient-components.css";

function PatientPrescriptions() {
  const { user } = useContext(UserContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: "",
    doctor: "",
    status: "",
  });

  // Fetch Prescriptions from API
  const fetchPrescriptions = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append("date", filters.date);
      if (filters.doctor) queryParams.append("doctor", filters.doctor);
      if (filters.status) queryParams.append("status", filters.status);

      const response = await fetch(
        `http://localhost:5000/api/prescriptions/patient/${user.id}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.prescriptions || []);
      } else {
        console.error("Failed to fetch prescriptions");
        setPrescriptions([]);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user, filters]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "completed":
        return "#3b82f6";
      case "expired":
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
    return <div className="loading">Loading prescriptions...</div>;
  }

  return (
    <div className="patient-component">
      <div className="component-header">
        <h2>💊 Prescriptions</h2>
        <p>View and manage your medical prescriptions</p>
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
            value={filters.doctor}
            onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
          >
            <option value="">All Doctors</option>
            <option value="dr-smith">Dr. Smith</option>
            <option value="dr-patel">Dr. Patel</option>
            <option value="dr-johnson">Dr. Johnson</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="items-list">
        {prescriptions.length === 0 ? (
          <div className="no-items">
            <div className="no-items-icon">💊</div>
            <h3>No prescriptions available</h3>
            <p>
              Prescriptions will appear here when doctors write them for you
              during consultations.
            </p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription._id} className="item-card">
              <div className="item-header">
                <div className="item-info">
                  <h4>💊 Prescription #{prescription.prescriptionNumber}</h4>
                  <p className="doctor-name">
                    👨‍⚕️ Dr. {prescription.doctor?.fullName}
                  </p>
                  <p className="hospital-name">
                    🏥 {prescription.hospital?.name || "Hospital Name"}
                  </p>
                </div>
                <div
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(prescription.status),
                  }}
                >
                  {prescription.status || "active"}
                </div>
              </div>

              <div className="item-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <strong>Prescribed Date:</strong>
                      <span>{formatDate(prescription.date || new Date())}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">⏰</span>
                    <div className="detail-content">
                      <strong>Duration:</strong>
                      <span>{prescription.duration || "7 days"}</span>
                    </div>
                  </div>
                </div>

                {/* Medications List */}
                <div className="medications-section">
                  <strong>💊 Medications:</strong>
                  <div className="medications-list">
                    {(
                      prescription.medications || [
                        {
                          name: "Paracetamol",
                          dosage: "500mg",
                          frequency: "Twice daily",
                        },
                        {
                          name: "Amoxicillin",
                          dosage: "250mg",
                          frequency: "Three times daily",
                        },
                      ]
                    ).map((med, index) => (
                      <div key={index} className="medication-item">
                        <span className="med-name">{med.name}</span>
                        <span className="med-dosage">{med.dosage}</span>
                        <span className="med-frequency">{med.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {prescription.instructions && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-icon">📝</span>
                      <div className="detail-content">
                        <strong>Instructions:</strong>
                        <span>{prescription.instructions}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="item-actions">
                <button className="btn-primary" title="Download Prescription">
                  📥 Download
                </button>
                <button className="btn-secondary" title="View Details">
                  👁️ View Details
                </button>
                {prescription.status === "active" && (
                  <button className="btn-success" title="Order Medicine">
                    🛒 Order Medicine
                  </button>
                )}
                <button className="btn-info" title="Set Reminder">
                  ⏰ Set Reminder
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Information Note */}
      <div className="demo-note">
        <p>
          �‍⚕️ <strong>How Prescriptions Work:</strong> Prescriptions are
          written by doctors during consultations. They will automatically
          appear here when a doctor prescribes medications for you during your
          appointments.
        </p>
      </div>
    </div>
  );
}

export default PatientPrescriptions;
