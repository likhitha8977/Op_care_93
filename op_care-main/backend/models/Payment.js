const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  paymentCode: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Card', 'Cash'],
    default: 'UPI'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  purpose: {
    type: String,
    default: 'OP Registration'
  },
  upiTransactionId: String,
  qrCodeData: String,
  paymentProof: String, // URL to uploaded payment screenshot
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
