import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/patient-components.css";

function PatientNotifications() {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false for immediate demo
  const [filters, setFilters] = useState({
    type: "",
    status: "",
  });

  // Demo data for immediate display
  const demoNotifications = [
    {
      id: "N001",
      type: "appointment",
      title: "Appointment Reminder",
      message:
        "Your appointment with Dr. Smith is scheduled for tomorrow at 10:00 AM",
      time: "2024-11-01T08:00:00Z",
      read: false,
      demo: true,
    },
    {
      id: "N002",
      type: "prescription",
      title: "Prescription Ready",
      message:
        "Your prescription for Aspirin is ready for pickup at City General Pharmacy",
      time: "2024-10-31T14:30:00Z",
      read: false,
      demo: true,
    },
    {
      id: "N003",
      type: "payment",
      title: "Payment Confirmation",
      message:
        "Payment of $150 for consultation on Oct 28 has been processed successfully",
      time: "2024-10-30T12:15:00Z",
      read: true,
      demo: true,
    },
    {
      id: "N004",
      type: "test",
      title: "Lab Results Available",
      message:
        "Your blood test results from Oct 25 are now available in your records",
      time: "2024-10-29T16:45:00Z",
      read: true,
      demo: true,
    },
  ];

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.status) queryParams.append("status", filters.status);

      const response = await fetch(
        `http://localhost:5000/api/notifications/patient/${user.id}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        console.error("Failed to fetch notifications");
        // Use demo data if API fails
        setNotifications(demoNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Use demo data if API fails
      setNotifications(demoNotifications);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((notif) =>
            notif._id === notificationId ? { ...notif, status: "read" } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.filter((notif) => notif._id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    // Always show demo data first
    setNotifications(demoNotifications);

    if (user?.id) {
      fetchNotifications();
    }
  }, [user, filters]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return "📅";
      case "prescription":
        return "💊";
      case "payment":
        return "💰";
      case "reminder":
        return "⏰";
      case "system":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "appointment":
        return "#3b82f6";
      case "prescription":
        return "#10b981";
      case "payment":
        return "#f59e0b";
      case "reminder":
        return "#8b5cf6";
      case "system":
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="patient-component">
      <div className="component-header">
        <h2>🔔 Notifications</h2>
        <p>Stay updated with your healthcare notifications</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="appointment">Appointment</option>
            <option value="prescription">Prescription</option>
            <option value="payment">Payment</option>
            <option value="reminder">Reminder</option>
            <option value="system">System</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="items-list">
        {notifications.length === 0 ? (
          <div className="no-items">
            <div className="no-items-icon">🔔</div>
            <h3>No notifications available</h3>
            <p>You're all caught up! New notifications will appear here</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id || notification.id}
              className={`notification-card ${
                notification.status === "unread" ? "unread" : "read"
              }`}
            >
              <div className="notification-header">
                <div
                  className="notification-icon"
                  style={{ color: getTypeColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type || "system")}
                </div>
                <div className="notification-info">
                  <h4>{notification.title || "Notification"}</h4>
                  <p className="notification-time">
                    {formatDate(notification.createdAt || new Date())}
                  </p>
                </div>
                <div className="notification-actions">
                  {notification.status === "unread" && (
                    <button
                      className="btn-mark-read"
                      onClick={() => markAsRead(notification._id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => deleteNotification(notification._id)}
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="notification-content">
                <p>{notification.message || notification.content}</p>

                {notification.actionUrl && (
                  <div className="notification-action">
                    <button
                      className="btn-primary"
                      onClick={() =>
                        (window.location.href = notification.actionUrl)
                      }
                    >
                      {notification.actionText || "View Details"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mock Notifications for Demo */}
      {notifications.length === 0 && (
        <div className="demo-notifications">
          <h3>Sample Notifications:</h3>
          <div className="demo-notification-list">
            {[
              {
                id: "demo1",
                type: "appointment",
                title: "Appointment Reminder",
                message:
                  "Your appointment with Dr. Smith is tomorrow at 10:00 AM",
                time: "2 hours ago",
                status: "unread",
              },
              {
                id: "demo2",
                type: "prescription",
                title: "Prescription Ready",
                message:
                  "Your prescription for Paracetamol is ready for pickup",
                time: "1 day ago",
                status: "read",
              },
              {
                id: "demo3",
                type: "payment",
                title: "Payment Successful",
                message: "Payment of ₹500 for consultation has been processed",
                time: "3 days ago",
                status: "read",
              },
            ].map((demo) => (
              <div
                key={demo.id}
                className={`notification-card demo ${demo.status}`}
              >
                <div className="notification-header">
                  <div
                    className="notification-icon"
                    style={{ color: getTypeColor(demo.type) }}
                  >
                    {getNotificationIcon(demo.type)}
                  </div>
                  <div className="notification-info">
                    <h4>{demo.title}</h4>
                    <p className="notification-time">{demo.time}</p>
                  </div>
                </div>
                <div className="notification-content">
                  <p>{demo.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientNotifications;
