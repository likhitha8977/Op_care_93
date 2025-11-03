import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/patient-appointments.css";

const BookAppointment = () => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    hospitalId: "",
    doctorId: "",
    date: "",
    time: "",
    type: "consultation",
    notes: "",
    consultationType: "in_person",
  });

  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Fetch doctors when hospital is selected
  useEffect(() => {
    if (formData.hospitalId) {
      fetchDoctorsByHospital(formData.hospitalId);
    } else {
      setDoctors([]);
      setFormData((prev) => ({ ...prev, doctorId: "" }));
    }
  }, [formData.hospitalId]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (formData.doctorId && formData.date) {
      fetchAvailableSlots(formData.doctorId, formData.date);
    } else {
      setAvailableSlots([]);
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  }, [formData.doctorId, formData.date]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/hospitals");
      const data = await response.json();
      setHospitals(data.hospitals || []);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      showMessage("Error fetching hospitals", "error");
    }
  };

  const fetchDoctorsByHospital = async (hospitalId) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/hospitals/${hospitalId}/doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors || []);
      } else {
        // Fallback to get all doctors and filter by hospital
        const allDoctorsResponse = await fetch(
          "http://localhost:5000/api/admin/users?role=doctor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (allDoctorsResponse.ok) {
          const allDoctorsData = await allDoctorsResponse.json();
          setDoctors(allDoctorsData.users || []);
        }
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      showMessage("Error fetching doctors", "error");
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const token = user?.token || localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/doctor/${doctorId}/availability?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || generateDefaultSlots());
      } else {
        // Generate default slots if API not available
        setAvailableSlots(generateDefaultSlots());
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailableSlots(generateDefaultSlots());
    }
  };

  const generateDefaultSlots = () => {
    const slots = [];
    // Morning slots
    for (let hour = 9; hour <= 12; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 12) slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    // Afternoon slots
    for (let hour = 14; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 17) slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showMessage("Please login to book an appointment", "error");
      return;
    }

    if (!formData.hospitalId || !formData.date) {
      showMessage("Please select hospital and date", "error");
      return;
    }

    setLoading(true);

    try {
      const token = user?.token || localStorage.getItem("token");
      const appointmentData = {
        user: user.id,
        patientId: user.id,
        hospital: formData.hospitalId,
        hospitalId: formData.hospitalId,
        doctor: formData.doctorId || null,
        doctorId: formData.doctorId || null,
        date: formData.date,
        time: formData.time,
        service: formData.type,
        type: formData.type,
        notes: formData.notes,
        consultationType: formData.consultationType,
        status: "pending",
      };

      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const data = await response.json();
        showMessage(
          "Appointment booked successfully! Waiting for doctor confirmation.",
          "success"
        );

        // Reset form
        setFormData({
          hospitalId: "",
          doctorId: "",
          date: "",
          time: "",
          type: "consultation",
          notes: "",
          consultationType: "in_person",
        });
      } else {
        const errorData = await response.json();
        showMessage(
          `Error: ${errorData.error || "Failed to book appointment"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      showMessage("Error booking appointment. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="appointment-booking-container">
      <div className="appointment-booking-card">
        <h2>Book an Appointment</h2>

        {message && <div className={`message ${messageType}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="hospitalId">Select Hospital *</label>
            <select
              id="hospitalId"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              required
            >
              <option value="">Choose a hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital._id} value={hospital._id}>
                  {hospital.name} - {hospital.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="doctorId">Select Doctor (Optional)</label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              disabled={!formData.hospitalId}
            >
              <option value="">Any available doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.fullName}
                  {doctor.doctorProfile?.specialization &&
                    ` - ${doctor.doctorProfile.specialization}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={getTomorrowDate()}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Preferred Time</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={!formData.date}
              >
                <option value="">Any available time</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Appointment Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="consultation">General Consultation</option>
                <option value="checkup">Health Checkup</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="surgery">Surgery Consultation</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="consultationType">Consultation Mode</label>
              <select
                id="consultationType"
                name="consultationType"
                value={formData.consultationType}
                onChange={handleChange}
              >
                <option value="in_person">In-Person</option>
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Describe your symptoms or reason for appointment..."
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="book-appointment-btn"
            disabled={loading}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>

        <div className="booking-info">
          <h3>Important Information:</h3>
          <ul>
            <li>Appointments are subject to doctor availability</li>
            <li>You will receive a notification once the doctor confirms</li>
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring your ID and any relevant medical documents</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
