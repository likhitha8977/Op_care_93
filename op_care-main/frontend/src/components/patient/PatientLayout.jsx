import React, { useState } from "react";
import Profile from "../profile";
import PatientAppointments from "./PatientAppointments";
import PatientOPSlips from "./PatientOPSlips";
import PatientPrescriptions from "./PatientPrescriptions";
import PatientNotifications from "./PatientNotifications";
import PatientPreviousRecords from "./PatientPreviousRecords";
import PatientPayments from "./PatientPayments";
import "../../styles/patient-components.css";

const PatientLayout = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "appointments":
        return <PatientAppointments />;
      case "opslips":
        return <PatientOPSlips />;
      case "prescriptions":
        return <PatientPrescriptions />;
      case "notifications":
        return <PatientNotifications />;
      case "records":
        return <PatientPreviousRecords />;
      case "payments":
        return <PatientPayments />;
      default:
        return <PatientAppointments />;
    }
  };

  return (
    <div className="patient-layout">
      <div className="patient-sidebar">
        <div className="sidebar-header">
          <h3>Menu</h3>
        </div>
        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`menu-item ${
              activeTab === "appointments" ? "active" : ""
            }`}
            onClick={() => setActiveTab("appointments")}
          >
            Appointments
          </button>
          <button
            className={`menu-item ${activeTab === "opslips" ? "active" : ""}`}
            onClick={() => setActiveTab("opslips")}
          >
            OP Slips
          </button>
          <button
            className={`menu-item ${
              activeTab === "prescriptions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("prescriptions")}
          >
            Prescriptions
          </button>
          <button
            className={`menu-item ${
              activeTab === "notifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            className={`menu-item ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            Previous Records
          </button>
          <button
            className={`menu-item ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </button>
        </div>
      </div>

      <div className="patient-main">
        <div className="patient-header">
          <h1>Patient Dashboard</h1>
          <div className="tab-navigation">
            <button
              className={`tab-btn ${
                activeTab === "appointments" ? "active" : ""
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              📅 My Appointments
            </button>
            <button
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              👤 Profile
            </button>
          </div>
        </div>

        <div className="patient-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PatientLayout;
