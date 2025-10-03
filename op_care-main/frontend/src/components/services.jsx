import React from "react";
import "../styles/services.css";


const services = [
  {
    title: "Smart Booking & Queue Management",
    description: [
      "Real-time queue status",
      "Priority booking for emergencies/seniors",
      "Auto-rescheduling if doctor unavailable",
    ],
  },
  {
    title: "Hospital & Doctor Finder",
    description: [
      "AI-powered hospital recommendations",
      "Filter by facilities & specialties",
      "Compare hospitals (fees, ratings, services)",
    ],
  },
  {
    title: "Telemedicine & Virtual OP",
    description: [
      "Online video consultations",
      "Digital prescriptions",
      "Chat follow-ups with doctors",
    ],
  },
  {
    title: "Patient Health Dashboard",
    description: [
      "Store prescriptions & lab results",
      "View health insights & graphs",
      "Medication & checkup reminders",
    ],
  },
  {
    title: "Pharmacy Integration",
    description: [
      "Order medicines online",
      "Home delivery options",
      "Refill reminders",
    ],
  },
  {
    title: "Lab Tests & Reports",
    description: [
      "Book diagnostic tests online",
      "Track lab reports",
      "Share reports with doctors",
    ],
  },
  {
    title: "Smart Emergency Response",
    description: [
      "One-tap SOS alerts",
      "Live location sharing",
      "Blood bank availability",
    ],
  },
  {
    title: "Insurance & Billing",
    description: [
      "Cashless OPD with insurance",
      "Track claims & approvals",
      "Transparent billing",
    ],
  },
  {
    title: "Notifications & Reminders",
    description: [
      "Booking confirmations",
      "Medicine reminders",
      "Wellness & health tips",
    ],
  },
  {
    title: "Community & Support",
    description: [
      "Patient support helpline",
      "Health blogs & awareness",
      "Doctor & hospital ratings",
    ],
  },
];

const Services = () => {
  return (
    <div className="services-section">
      <div className="container">
        <header className="services-header">
          <h1>Our Healthcare Services</h1>
          <p>
            Explore the wide range of smart healthcare services offered by
            OpCare to improve patient convenience and well-being.
          </p>
        </header>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <h2>{service.title}</h2>
              <ul>
                {service.description.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <button className="learn-more">Learn More</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
