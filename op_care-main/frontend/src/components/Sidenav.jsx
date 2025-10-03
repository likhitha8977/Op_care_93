import React from "react";
import "../styles/Sidenav.css";

const Sidenav = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidenav">
      <h2>Menu</h2>
      <ul>
        <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
          Profile
        </li>
        <li className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>
          Appointments
        </li>
        <li className={activeTab === "opslips" ? "active" : ""} onClick={() => setActiveTab("opslips")}>
          OP Slips
        </li>
        <li className={activeTab === "prescriptions" ? "active" : ""} onClick={() => setActiveTab("prescriptions")}>
          Prescriptions
        </li>
        <li className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
          Notifications
        </li>
        <li className={activeTab === "records" ? "active" : ""} onClick={() => setActiveTab("records")}>
          Previous Records
        </li>
      </ul>
    </aside>
  );
};

export default Sidenav;
