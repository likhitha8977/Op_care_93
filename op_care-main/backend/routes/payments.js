const express = require("express");
const router = express.Router();

// Import auth middleware correctly
const { auth } = require("../middleware/auth");

// Import models
const Payment = require("../models/Payment");
const User = require("../models/User");

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN${timestamp}${random}`;
};

// Test route (no auth required)
router.get("/test", (req, res) => {
  res.json({ message: "Payment routes are working" });
});

// Create a new payment (generates QR code)
router.post("/create", auth, async (req, res) => {
  try {
    const { amount, paymentMethod, purpose, upiTransactionId } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const transactionId = generateTransactionId();
    const paymentDetails = {
      upiId: process.env.UPI_ID || "opcare@hospital",
      name: "OP Care Hospital",
    };

    const qrCodeData = `upi://pay?pa=${
      paymentDetails.upiId
    }&pn=${encodeURIComponent(
      paymentDetails.name
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
      purpose || "OP Care Payment"
    )}&tr=${transactionId}`;

    const payment = new Payment({
      user: userId,
      amount,
      transactionId,
      paymentMethod: paymentMethod || "UPI",
      purpose: purpose || "OP Registration",
      qrCodeData,
      upiTransactionId,
      status: "pending",
    });

    await payment.save();

    res.status(201).json({
      success: true,
      payment,
      qrCodeData,
      message: "Payment initiated successfully",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all payments for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("verifiedBy", "fullName");

    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific payment
router.get("/:paymentId", auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate("user", "fullName email")
      .populate("verifiedBy", "fullName");

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if user owns this payment
    if (payment.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment (user marks as paid)
router.put("/:paymentId/confirm", auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { upiTransactionId, notes } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    payment.status = "completed";
    payment.upiTransactionId = upiTransactionId;
    payment.notes = notes;
    await payment.save();

    res.json({
      success: true,
      payment,
      message: "Payment confirmed successfully. Awaiting verification.",
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
