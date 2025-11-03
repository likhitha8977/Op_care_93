import React from "react";
import "../../styles/Sidenav.css";

const SidenavDoctor = ({
  activeTab,
  setActiveTab,
  unreadNotifications = 0,
}) => {
  return (
    <aside className="sidenav doctor-sidenav">
      <h2>Doctor Menu</h2>
      <ul>
        <li
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </li>
        <li
          className={activeTab === "appointments" ? "active" : ""}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </li>
        <li
          className={activeTab === "patients" ? "active" : ""}
          onClick={() => setActiveTab("patients")}
        >
          Patients / Cases
        </li>
        <li
          className={activeTab === "prescriptions" ? "active" : ""}
          onClick={() => setActiveTab("prescriptions")}
        >
          Prescriptions
        </li>
        <li
          className={activeTab === "operations" ? "active" : ""}
          onClick={() => setActiveTab("operations")}
        >
          Operations / Surgeries
        </li>
        <li
          className={activeTab === "availability" ? "active" : ""}
          onClick={() => setActiveTab("availability")}
        >
          Availability
        </li>
        <li
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile & Credentials
        </li>
        <li
          className={activeTab === "notifications" ? "active" : ""}
          onClick={() => setActiveTab("notifications")}
          style={{ position: "relative" }}
        >
          Notifications
          {unreadNotifications > 0 && (
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "#ef4444",
                color: "white",
                borderRadius: "50%",
                fontSize: "0.75rem",
                minWidth: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </li>
        <li
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </li>
      </ul>
    </aside>
  );
};

export default SidenavDoctor;
