import React from "react";
import "../../styles/Sidenav.css";

const SidenavDoctor = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidenav doctor-sidenav">
      <h2>Doctor Menu</h2>
      <ul>
        <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </li>
        <li className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>
          Appointments
        </li>
        <li className={activeTab === "patients" ? "active" : ""} onClick={() => setActiveTab("patients")}>
          Patients / Cases
        </li>
        <li className={activeTab === "prescriptions" ? "active" : ""} onClick={() => setActiveTab("prescriptions")}>
          Prescriptions
        </li>
        <li className={activeTab === "operations" ? "active" : ""} onClick={() => setActiveTab("operations")}>
          Operations / Surgeries
        </li>
        <li className={activeTab === "availability" ? "active" : ""} onClick={() => setActiveTab("availability")}>
          Availability
        </li>
        <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
          Profile & Credentials
        </li>
        <li className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
          Notifications
        </li>
        <li className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}>
          Reports
        </li>
      </ul>
    </aside>
  );
};

export default SidenavDoctor;
