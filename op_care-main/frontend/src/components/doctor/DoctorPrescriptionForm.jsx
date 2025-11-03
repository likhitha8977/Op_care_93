import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";

function DoctorPrescriptionForm() {
  const { user } = useContext(UserContext);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [prescriptionData, setPrescriptionData] = useState({
    patientId: "",
    appointmentId: "",
    hospitalId: "",
    diagnosis: "",
    symptoms: [""],
    medications: [
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        beforeFood: false,
        afterFood: true,
      },
    ],
    labTests: [],
    followUpDate: "",
    followUpInstructions: "",
    generalInstructions: "",
  });

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchPatients(); // Load initial patient list
      fetchHospitals();
    }

    // Add click outside handler to close dropdown
    const handleClickOutside = (event) => {
      if (!event.target.closest(".form-group")) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  const fetchPatients = async (searchTerm = "") => {
    try {
      const token = user?.token || localStorage.getItem("token");
      if (!token) {
        console.error("No token available for fetching patients");
        return;
      }

      const queryParams = searchTerm
        ? `?search=${encodeURIComponent(searchTerm)}`
        : "";
      const url = `http://localhost:5000/api/doctor/search-patients${queryParams}`;
      console.log("Fetching patients from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Patients data received:", data);
        const patientList = data.patients || [];
        setPatients(patientList);
        setFilteredPatients(patientList);
      } else {
        console.error("Search patients failed, trying fallback endpoint");
        // Fallback: try to get patients from admin users endpoint
        const fallbackResponse = await fetch(
          "http://localhost:5000/api/admin/users?role=patient",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log("Fetched patients from admin endpoint:", fallbackData);
          const patientList = fallbackData.users || fallbackData || [];
          setPatients(patientList);

          // Apply search filter if provided
          if (searchTerm) {
            const filtered = patientList.filter(
              (patient) =>
                patient.fullName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                patient.email
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                (patient.phone && patient.phone.includes(searchTerm))
            );
            setFilteredPatients(filtered);
          } else {
            setFilteredPatients(patientList);
          }
        } else {
          const errorData = await response.text();
          console.error("Error response:", errorData);
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      alert("Error fetching patients. Please try again or contact support.");
    }
  };

  // Handle patient search
  const handlePatientSearch = async (searchValue) => {
    console.log("Patient search called with:", searchValue);
    setPatientSearch(searchValue);
    setShowPatientDropdown(true);

    if (searchValue.trim() === "") {
      console.log("Empty search, showing all patients:", patients.length);
      setFilteredPatients(patients);
      return;
    }

    // Filter locally first for immediate response
    const filtered = patients.filter(
      (patient) =>
        patient.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchValue))
    );
    console.log(
      "Local filter results:",
      filtered.length,
      "from",
      patients.length,
      "patients"
    );
    setFilteredPatients(filtered);

    // Also fetch from server for more comprehensive search
    if (searchValue.length >= 2) {
      console.log("Triggering server search for:", searchValue);
      setSearchLoading(true);
      try {
        await fetchPatients(searchValue);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  // Select a patient
  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.fullName);
    setShowPatientDropdown(false);
    setPrescriptionData((prev) => ({ ...prev, patientId: patient._id }));
    fetchAppointments(patient._id);
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

  const fetchAppointments = async (patientId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAppointments(
          data.filter(
            (apt) => apt.status === "completed" || apt.status === "confirmed"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const addMedication = () => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
          beforeFood: false,
          afterFood: true,
        },
      ],
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...prescriptionData,
          symptoms: prescriptionData.symptoms.filter((s) => s.trim() !== ""),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Prescription created successfully!");
        // Reset form
        setPrescriptionData({
          patientId: "",
          appointmentId: "",
          hospitalId: "",
          diagnosis: "",
          symptoms: [""],
          medications: [
            {
              name: "",
              dosage: "",
              frequency: "",
              duration: "",
              instructions: "",
              beforeFood: false,
              afterFood: true,
            },
          ],
          labTests: [],
          followUpDate: "",
          followUpInstructions: "",
          generalInstructions: "",
        });
      } else {
        const error = await response.json();
        alert("Error creating prescription: " + error.message);
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert("Error creating prescription");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "doctor") {
    return <div>Access denied. Only doctors can create prescriptions.</div>;
  }

  return (
    <div
      className="prescription-form-container"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <h2>📝 Create Prescription</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* Patient Selection with Search */}
        <div
          className="form-group"
          style={{ marginBottom: "20px", position: "relative" }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Patient *
          </label>
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => handlePatientSearch(e.target.value)}
            placeholder="Search by name, email, or phone... (type at least 2 characters)"
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />

          <div style={{ fontSize: "0.8em", color: "#666", marginTop: "4px" }}>
            💡 Start typing to search for patients. Type at least 2 characters
            for server search.
            <button
              type="button"
              onClick={() => {
                console.log("Manual patient fetch triggered");
                fetchPatients();
              }}
              style={{
                marginLeft: "10px",
                padding: "2px 6px",
                fontSize: "0.7em",
                background: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              🔄 Load All Patients
            </button>
          </div>

          {showPatientDropdown &&
            (filteredPatients.length > 0 || searchLoading) && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 1000,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  marginTop: "2px",
                }}
              >
                {searchLoading && (
                  <div
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      color: "#666",
                      fontStyle: "italic",
                    }}
                  >
                    🔍 Searching patients...
                  </div>
                )}

                {!searchLoading &&
                  filteredPatients.length === 0 &&
                  patientSearch.length >= 2 && (
                    <div
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      No patients found. Try a different search term.
                    </div>
                  )}

                {!searchLoading &&
                  filteredPatients.map((patient) => (
                    <div
                      key={patient._id}
                      onClick={() => selectPatient(patient)}
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f5f5f5")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "white")
                      }
                    >
                      <div style={{ fontWeight: "bold", color: "#333" }}>
                        {patient.fullName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9em",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        📧 {patient.email} | 📱 {patient.phone || "N/A"}
                      </div>
                    </div>
                  ))}
              </div>
            )}

          {selectedPatient && (
            <div
              style={{
                backgroundColor: "#f0f8ff",
                padding: "12px",
                borderRadius: "6px",
                marginTop: "10px",
                border: "1px solid #4CAF50",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: "0", color: "#2e7d32" }}>
                  ✅ Selected Patient
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch("");
                    setPrescriptionData((prev) => ({ ...prev, patientId: "" }));
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                <p style={{ margin: "2px 0" }}>
                  <strong>Name:</strong> {selectedPatient.fullName}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Email:</strong> {selectedPatient.email}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Phone:</strong> {selectedPatient.phone || "N/A"}
                </p>
                <p style={{ margin: "2px 0" }}>
                  <strong>Age:</strong> {selectedPatient.age || "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Debug Information */}
          {process.env.NODE_ENV === "development" && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px",
                background: "#f8f9fa",
                border: "1px solid #e9ecef",
                borderRadius: "4px",
                fontSize: "0.8em",
                color: "#6c757d",
              }}
            >
              <strong>Debug Info:</strong>
              Total Patients: {patients.length} | Filtered:{" "}
              {filteredPatients.length} | Search: "{patientSearch}" | Loading:{" "}
              {searchLoading ? "Yes" : "No"}
            </div>
          )}
        </div>

        {/* Hospital Selection */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Hospital
          </label>
          <select
            value={prescriptionData.hospitalId}
            onChange={(e) =>
              setPrescriptionData((prev) => ({
                ...prev,
                hospitalId: e.target.value,
              }))
            }
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
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

        {/* Appointment Selection */}
        {appointments.length > 0 && (
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Related Appointment
            </label>
            <select
              value={prescriptionData.appointmentId}
              onChange={(e) =>
                setPrescriptionData((prev) => ({
                  ...prev,
                  appointmentId: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">Select Appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment._id} value={appointment._id}>
                  {new Date(appointment.date).toLocaleDateString()} -{" "}
                  {appointment.time} ({appointment.type})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Diagnosis */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Diagnosis *
          </label>
          <input
            type="text"
            value={prescriptionData.diagnosis}
            onChange={(e) =>
              setPrescriptionData((prev) => ({
                ...prev,
                diagnosis: e.target.value,
              }))
            }
            required
            placeholder="Enter diagnosis"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* Symptoms */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Symptoms
          </label>
          {prescriptionData.symptoms.map((symptom, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
            >
              <input
                type="text"
                value={symptom}
                onChange={(e) => {
                  const newSymptoms = [...prescriptionData.symptoms];
                  newSymptoms[index] = e.target.value;
                  setPrescriptionData((prev) => ({
                    ...prev,
                    symptoms: newSymptoms,
                  }));
                }}
                placeholder="Enter symptom"
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
              {prescriptionData.symptoms.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newSymptoms = prescriptionData.symptoms.filter(
                      (_, i) => i !== index
                    );
                    setPrescriptionData((prev) => ({
                      ...prev,
                      symptoms: newSymptoms,
                    }));
                  }}
                  style={{
                    padding: "10px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setPrescriptionData((prev) => ({
                ...prev,
                symptoms: [...prev.symptoms, ""],
              }))
            }
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Add Symptom
          </button>
        </div>

        {/* Medications */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Medications *
          </label>
          {prescriptionData.medications.map((medication, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) =>
                    updateMedication(index, "name", e.target.value)
                  }
                  placeholder="Medicine name"
                  required
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                />
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) =>
                    updateMedication(index, "dosage", e.target.value)
                  }
                  placeholder="Dosage (e.g., 500mg)"
                  required
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <input
                  type="text"
                  value={medication.frequency}
                  onChange={(e) =>
                    updateMedication(index, "frequency", e.target.value)
                  }
                  placeholder="Frequency (e.g., Twice daily)"
                  required
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                />
                <input
                  type="text"
                  value={medication.duration}
                  onChange={(e) =>
                    updateMedication(index, "duration", e.target.value)
                  }
                  placeholder="Duration (e.g., 7 days)"
                  required
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", gap: "15px", marginBottom: "10px" }}
              >
                <label
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <input
                    type="checkbox"
                    checked={medication.beforeFood}
                    onChange={(e) =>
                      updateMedication(index, "beforeFood", e.target.checked)
                    }
                  />
                  Before Food
                </label>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <input
                    type="checkbox"
                    checked={medication.afterFood}
                    onChange={(e) =>
                      updateMedication(index, "afterFood", e.target.checked)
                    }
                  />
                  After Food
                </label>
              </div>
              <input
                type="text"
                value={medication.instructions}
                onChange={(e) =>
                  updateMedication(index, "instructions", e.target.value)
                }
                placeholder="Special instructions"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              />
              {prescriptionData.medications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  style={{
                    padding: "8px 16px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                  }}
                >
                  Remove Medication
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMedication}
            style={{
              padding: "10px 20px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Add Medication
          </button>
        </div>

        {/* General Instructions */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            General Instructions
          </label>
          <textarea
            value={prescriptionData.generalInstructions}
            onChange={(e) =>
              setPrescriptionData((prev) => ({
                ...prev,
                generalInstructions: e.target.value,
              }))
            }
            placeholder="General instructions for the patient"
            rows="3"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* Follow-up Date */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Follow-up Date
          </label>
          <input
            type="date"
            value={prescriptionData.followUpDate}
            onChange={(e) =>
              setPrescriptionData((prev) => ({
                ...prev,
                followUpDate: e.target.value,
              }))
            }
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* Follow-up Instructions */}
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Follow-up Instructions
          </label>
          <textarea
            value={prescriptionData.followUpInstructions}
            onChange={(e) =>
              setPrescriptionData((prev) => ({
                ...prev,
                followUpInstructions: e.target.value,
              }))
            }
            placeholder="Instructions for follow-up visit"
            rows="2"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating Prescription..." : "Create Prescription"}
        </button>
      </form>
    </div>
  );
}

export default DoctorPrescriptionForm;
