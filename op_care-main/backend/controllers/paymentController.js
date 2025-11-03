const Payment = require("../models/Payment");
const User = require("../models/User");
const { createOPSlip } = require("./opSlipController");

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `TXN${timestamp}${random}`;
};

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, purpose, upiTransactionId } = req.body;
    const userId = req.user._id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Generate UPI QR code data
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

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      amount,
      transactionId,
      paymentMethod: paymentMethod || "UPI",
      purpose: purpose || "OP Registration",
      qrCodeData,
      upiTransactionId,
      status: "pending",
    });

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
};

// Get all payments for a user
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("verifiedBy", "fullName");

    res.json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate("user", "fullName email")
      .populate("verifiedBy", "fullName");

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if user owns this payment or is admin
    if (
      payment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm payment (user marks as paid)
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { upiTransactionId, notes } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update payment status
    payment.status = "completed"; // In real app, this would be 'pending' until admin verifies
    payment.upiTransactionId = upiTransactionId;
    payment.notes = notes;
    await payment.save();

    // If payment is completed and has a booking, create OP slip
    if (payment.booking) {
      try {
        const opSlip = await createOPSlip(payment._id, payment.booking);
        console.log("OP Slip created:", opSlip.slipNumber);
      } catch (error) {
        console.error("Error creating OP slip:", error);
        // Don't fail the payment confirmation if OP slip creation fails
      }
    }

    res.json({
      success: true,
      payment,
      message: "Payment confirmed successfully. Awaiting verification.",
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Verify payment (admin only)
exports.verifyPayment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { paymentId } = req.params;
    const { status } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.status = status;
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    await payment.save();

    // If payment is completed and has a booking, create OP slip
    if (status === "completed" && payment.booking) {
      try {
        const opSlip = await createOPSlip(payment._id, payment.booking);
        console.log("OP Slip created:", opSlip.slipNumber);
      } catch (error) {
        console.error("Error creating OP slip:", error);
        // Don't fail the payment verification if OP slip creation fails
      }
    }

    res.json({
      success: true,
      payment,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate("user", "fullName email")
      .populate("verifiedBy", "fullName");

    res.json(payments);
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload payment proof
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Save file path
    payment.paymentProof = `/uploads/${req.file.filename}`;
    await payment.save();

    res.json({
      success: true,
      payment,
      message: "Payment proof uploaded successfully",
    });
  } catch (error) {
    console.error("Upload payment proof error:", error);
    res.status(500).json({ error: error.message });
  }
};
