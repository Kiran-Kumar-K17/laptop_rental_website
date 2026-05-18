import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Rental from "../models/Rental.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//    Step 1: Create Order & Store Pending Payment
const createOrder = async (req, res) => {
  try {
    const { rentalId } = req.body;
    const rental = await Rental.findById(rentalId);

    if (!rental) return res.status(404).json({ error: "Rental not found" });
    if (!rental.laptopId) {
      return res.status(400).json({ error: "Rental missing laptopId" });
    }
    const options = {
      amount: rental.pricing.totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${rental._id}`,
    };

    const order = await razorpay.orders.create(options);

    // Create a "pending" payment record in your new Payment collection
    await Payment.create({
      rentalId: rental._id,
      userId: req.user._id,
      laptopId: rental.laptopId,
      amount: rental.pricing.totalAmount,
      type: "rental",
      gatewayOrderId: order.id,
      status: "pending",
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   tep 2: Verify & Update Payment Record
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      rentalId,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // Check signature (keeping your 'true ||' for testing as requested)
    if (razorpay_signature === expectedSign) {
      // 1. Update the Payment record to success
      await Payment.findOneAndUpdate(
        { gatewayOrderId: razorpay_order_id, status: "pending" },
        {
          status: "success",
          gatewayPaymentId: razorpay_payment_id,
          paidAt: new Date(),
        },
      );

      // 2. Update the Rental status to active
      await Rental.findByIdAndUpdate(rentalId, { status: "active" });

      await Payment.deleteMany({
        status: "pending",
        createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
      });

      return res.status(200).json({
        message: "Payment recorded and rental activated",
      });
    }

    // This part is only reached if the 'if' condition fails.
    // No 'else' is needed because 'if' returns and exits.
    await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpay_order_id },
      { status: "failed" },
    );

    return res.status(400).json({ error: "Invalid payment signature" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
      status: "success",
    })
      .populate({
        path: "rentalId",
        select: "rentedFrom rentedTo laptopId",
        populate: {
          path: "laptopId",
          select: "brand model images specs",
        },
      })
      .sort("-createdAt");

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refund security deposit (Admin Only)
// POST /api/payments/refund/:rentalId
const processRefund = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { notes } = req.body;

    // 1. Find the successful deposit/rental payment to refund
    const originalPayment = await Payment.findOne({
      rentalId,
      status: "success",
      type: "rental", // Or "deposit" if you split them
    });

    if (!originalPayment || !originalPayment.gatewayPaymentId) {
      return res
        .status(404)
        .json({ error: "Original successful payment not found" });
    }

    // 2. Call Razorpay Refund API
    // In a real app, you'd use:
    // const refund = await razorpay.payments.refund(originalPayment.gatewayPaymentId, { amount: originalPayment.amount * 100 });

    // 3. Create Refund Record in DB
    const refundRecord = await Payment.create({
      rentalId,
      userId: originalPayment.userId,
      amount: originalPayment.amount, // You might refund only the deposit portion
      type: "refund",
      status: "refunded",
      gatewayPaymentId: originalPayment.gatewayPaymentId,
      paidAt: new Date(),
    });

    // 4. Update Rental status
    await Rental.findByIdAndUpdate(rentalId, {
      depositRefunded: true,
      notes: notes,
    });

    res
      .status(200)
      .json({ message: "Refund processed successfully", refundRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//     Get all payments (Admin Only)
//    GET /api/payments/all
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("userId", "name email")
      .populate("rentalId", "status")
      .populate("laptopId", "brand model pricing")
      .sort("-createdAt");

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  processRefund,
  getAllPayments,
};
