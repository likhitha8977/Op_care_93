import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import '../styles/payment.css';

const Payment = () => {
  const { user } = useContext(UserContext);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('OP Registration');
  const [qrValue, setQrValue] = useState('');
  const [currentPayment, setCurrentPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: 'opcare@hospital', // Replace with actual UPI ID
    name: 'OP Care Hospital',
    accountNumber: '1234567890',
    ifsc: 'EXAMPLE12345',
    bankName: 'Example Bank',
    branch: 'Main Branch'
  });
  const qrRef = useRef();
  const navigate = useNavigate();

  // Load payment history on component mount
  useEffect(() => {
    if (user?.token) {
      loadPaymentHistory();
    }
  }, [user]);

  const loadPaymentHistory = async () => {
    try {
      const response = await axios.get('/api/payments', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const generateQRCode = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      // Create payment record on backend
      const response = await axios.post('/api/payments', {
        amount: parseFloat(amount),
        purpose,
        paymentMethod: 'UPI'
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.data.success) {
        setCurrentPayment(response.data.payment);
        setQrValue(response.data.qrCodeData);
        toast.success('QR Code generated! Scan to pay.');
      }
    } catch (error) {
      console.error('Payment generation error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!upiTransactionId || upiTransactionId.trim() === '') {
      toast.error('Please enter your UPI Transaction ID');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmPaymentSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.put(
        `/api/payments/${currentPayment._id}/confirm`,
        { upiTransactionId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (response.data.success) {
        toast.success('Payment confirmed! Awaiting verification.');
        setShowConfirmModal(false);
        // Reset form
        setAmount('');
        setPurpose('OP Registration');
        setQrValue('');
        setUpiTransactionId('');
        setCurrentPayment(null);
        // Reload payment history
        loadPaymentHistory();
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error(error.response?.data?.error || 'Payment confirmation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: '#f39c12',
      completed: '#27ae60',
      failed: '#e74c3c',
      refunded: '#95a5a6'
    };
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: statusColors[status] || '#95a5a6' }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="payment-container">
      <h2>💳 Payments</h2>
      <p className="payment-subtitle">Pay for your OP registration and services securely</p>
      
      {/* New Payment Section */}
      <div className="payment-methods">
        <div className="payment-method">
          <h3>🔐 Make New Payment</h3>
          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="purpose">Payment Purpose</label>
              <select
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="amount-input"
              >
                <option value="OP Registration">OP Registration</option>
                <option value="Consultation Fee">Consultation Fee</option>
                <option value="Lab Tests">Lab Tests</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount">Enter Amount (₹)</label>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="amount-input"
              />
            </div>
            
            <button 
              type="button" 
              onClick={generateQRCode}
              className="btn-generate"
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            >
              {isLoading ? '⏳ Generating...' : '📱 Generate QR Code'}
            </button>
            
            {qrValue && currentPayment && (
              <div className="qr-section">
                <div className="qr-code">
                  <QRCodeSVG value={qrValue} size={220} level="H" />
                  <p className="scan-text">📸 Scan QR to pay with any UPI app</p>
                  <p className="transaction-id">Transaction ID: {currentPayment.transactionId}</p>
                </div>
                
                <div className="payment-details">
                  <h4>💰 Payment Information</h4>
                  <div className="info-box">
                    <div className="detail-item">
                      <span>Amount:</span>
                      <strong>₹{amount}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Purpose:</span>
                      <strong>{purpose}</strong>
                    </div>
                  </div>

                  <h4>📲 Or pay directly to:</h4>
                  <div className="detail-item">
                    <span>UPI ID:</span>
                    <div className="detail-value">
                      {paymentDetails.upiId}
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(paymentDetails.upiId)}
                        title="Copy UPI ID"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="bank-details">
                    <h4>🏦 Bank Transfer Details</h4>
                    <div className="detail-item">
                      <span>Account Name:</span>
                      <span>{paymentDetails.name}</span>
                    </div>
                    <div className="detail-item">
                      <span>Account Number:</span>
                      <div className="detail-value">
                        {paymentDetails.accountNumber}
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(paymentDetails.accountNumber)}
                          title="Copy Account Number"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span>IFSC Code:</span>
                      <div className="detail-value">
                        {paymentDetails.ifsc}
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(paymentDetails.ifsc)}
                          title="Copy IFSC Code"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span>Bank Name:</span>
                      <span>{paymentDetails.bankName}</span>
                    </div>
                    <div className="detail-item">
                      <span>Branch:</span>
                      <span>{paymentDetails.branch}</span>
                    </div>
                  </div>

                  <div className="confirm-payment-section">
                    <h4>✅ Confirm Payment</h4>
                    <p className="instruction-text">After making the payment, enter your UPI Transaction ID below:</p>
                    <div className="form-group">
                      <input
                        type="text"
                        value={upiTransactionId}
                        onChange={(e) => setUpiTransactionId(e.target.value)}
                        placeholder="Enter UPI Transaction ID"
                        className="amount-input"
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={handleConfirmPayment}
                  className="btn-pay-now"
                  disabled={isLoading || !upiTransactionId}
                >
                  {isLoading ? '⏳ Processing...' : '✅ Confirm Payment'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment History Section */}
        <div className="payment-history">
          <h3>📊 Payment History</h3>
          {paymentHistory.length > 0 ? (
            <div className="history-list">
              {paymentHistory.map((payment) => (
                <div key={payment._id} className="history-item">
                  <div className="history-header">
                    <span className="payment-purpose">{payment.purpose}</span>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="history-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <strong>₹{payment.amount}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Transaction ID:</span>
                      <span className="txn-id">{payment.transactionId}</span>
                    </div>
                    {payment.upiTransactionId && (
                      <div className="detail-row">
                        <span>UPI Txn ID:</span>
                        <span className="txn-id">{payment.upiTransactionId}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span>Date:</span>
                      <span>{new Date(payment.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-history">No payment history available</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Confirm Payment</h3>
            <p>Please confirm that you have made the payment:</p>
            <div className="modal-details">
              <p><strong>Amount:</strong> ₹{amount}</p>
              <p><strong>Purpose:</strong> {purpose}</p>
              <p><strong>UPI Transaction ID:</strong> {upiTransactionId}</p>
            </div>
            <p className="modal-warning">Make sure you've completed the payment before confirming.</p>
            <div className="modal-buttons">
              <button 
                onClick={confirmPaymentSubmit}
                className="btn-confirm"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Confirming...' : '✅ Yes, I Paid'}
              </button>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="btn-cancel"
                disabled={isLoading}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
