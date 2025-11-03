import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import "../../styles/patient-components.css";

function PatientPayments() {
  const { user } = useContext(UserContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: "",
    status: "",
    type: "",
  });

  // Fetch Payments
  const fetchPayments = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append("date", filters.date);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.type) queryParams.append("type", filters.type);

      const response = await fetch(
        `http://localhost:5000/api/payments/patient/${user.id}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        console.error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
    }
  }, [user, filters]);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      case "refunded":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case "consultation":
        return "🩺";
      case "lab_test":
        return "🧪";
      case "surgery":
        return "⚕️";
      case "medication":
        return "💊";
      case "admission":
        return "🏥";
      default:
        return "💰";
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const downloadReceipt = (paymentId) => {
    // In a real implementation, this would download the receipt
    alert(`Downloading receipt for payment ${paymentId}`);
  };

  if (loading) {
    return <div className="loading">Loading payment history...</div>;
  }

  return (
    <div className="patient-component">
      <div className="component-header">
        <h2>💰 Payments</h2>
        <p>View your payment history and manage billing</p>
      </div>

      {/* Payment Summary */}
      <div className="payment-summary">
        <div className="summary-card">
          <div className="summary-icon">💳</div>
          <div className="summary-info">
            <h3>Total Paid</h3>
            <p className="summary-amount">₹15,750</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⏳</div>
          <div className="summary-info">
            <h3>Pending</h3>
            <p className="summary-amount">₹2,500</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <h3>This Month</h3>
            <p className="summary-amount">₹3,200</p>
          </div>
        </div>
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
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="consultation">Consultation</option>
            <option value="lab_test">Lab Test</option>
            <option value="surgery">Surgery</option>
            <option value="medication">Medication</option>
            <option value="admission">Admission</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="items-list">
        {payments.length === 0 ? (
          <div className="no-items">
            <div className="no-items-icon">💰</div>
            <h3>No payment records available</h3>
            <p>Your payment history will appear here</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment._id || payment.id}
              className="item-card payment-card"
            >
              <div className="item-header">
                <div className="item-info">
                  <div className="payment-type">
                    {getPaymentTypeIcon(payment.type || "consultation")}
                    <h4>{payment.description || "Medical Payment"}</h4>
                  </div>
                  <p className="payment-id">
                    ID: #{payment.paymentId || "PAY001"}
                  </p>
                  <p className="hospital-name">
                    🏥 {payment.hospital || "General Hospital"}
                  </p>
                </div>
                <div className="payment-amount-status">
                  <div className="payment-amount">
                    {formatCurrency(payment.amount || 500)}
                  </div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(payment.status) }}
                  >
                    {payment.status || "paid"}
                  </div>
                </div>
              </div>

              <div className="item-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <strong>Payment Date:</strong>
                      <span>{formatDate(payment.date || new Date())}</span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💳</span>
                    <div className="detail-content">
                      <strong>Payment Method:</strong>
                      <span>{payment.method || "Credit Card"}</span>
                    </div>
                  </div>
                </div>

                {payment.doctor && (
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">👨‍⚕️</span>
                      <div className="detail-content">
                        <strong>Doctor:</strong>
                        <span>Dr. {payment.doctor}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🏥</span>
                      <div className="detail-content">
                        <strong>Department:</strong>
                        <span>{payment.department || "General Medicine"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {payment.transactionId && (
                  <div className="detail-row">
                    <div className="detail-item full-width">
                      <span className="detail-icon">🔗</span>
                      <div className="detail-content">
                        <strong>Transaction ID:</strong>
                        <span>{payment.transactionId}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="item-actions">
                <button
                  className="btn-primary"
                  onClick={() => downloadReceipt(payment._id)}
                  title="Download Receipt"
                >
                  📥 Receipt
                </button>
                <button className="btn-secondary" title="View Details">
                  👁️ Details
                </button>
                {payment.status === "failed" && (
                  <button className="btn-warning" title="Retry Payment">
                    🔄 Retry
                  </button>
                )}
                {payment.status === "paid" && (
                  <button className="btn-info" title="Request Refund">
                    💫 Refund
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mock Payments for Demo */}
      {payments.length === 0 && (
        <div className="demo-payments">
          <h3>Sample Payment Records:</h3>
          <div className="demo-payments-list">
            {[
              {
                id: "demo1",
                type: "consultation",
                description: "General Consultation - Dr. Smith",
                amount: 500,
                status: "paid",
                date: new Date("2024-10-25"),
                method: "Credit Card",
                paymentId: "PAY001",
                hospital: "City General Hospital",
                doctor: "Smith",
              },
              {
                id: "demo2",
                type: "lab_test",
                description: "Blood Test Package",
                amount: 1500,
                status: "paid",
                date: new Date("2024-10-20"),
                method: "UPI",
                paymentId: "PAY002",
                hospital: "Metro Care Center",
                doctor: "Patel",
              },
              {
                id: "demo3",
                type: "medication",
                description: "Prescribed Medications",
                amount: 750,
                status: "pending",
                date: new Date("2024-10-30"),
                method: "Cash",
                paymentId: "PAY003",
                hospital: "Sunshine Medical",
                doctor: "Johnson",
              },
            ].map((demo) => (
              <div key={demo.id} className="item-card payment-card demo">
                <div className="item-header">
                  <div className="item-info">
                    <div className="payment-type">
                      {getPaymentTypeIcon(demo.type)}
                      <h4>{demo.description}</h4>
                    </div>
                    <p className="payment-id">ID: #{demo.paymentId}</p>
                    <p className="hospital-name">🏥 {demo.hospital}</p>
                  </div>
                  <div className="payment-amount-status">
                    <div className="payment-amount">
                      {formatCurrency(demo.amount)}
                    </div>
                    <div
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(demo.status) }}
                    >
                      {demo.status}
                    </div>
                  </div>
                </div>
                <div className="item-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div className="detail-content">
                        <strong>Payment Date:</strong>
                        <span>{formatDate(demo.date)}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">💳</span>
                      <div className="detail-content">
                        <strong>Payment Method:</strong>
                        <span>{demo.method}</span>
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

export default PatientPayments;
