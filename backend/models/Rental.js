import mongoose, { Schema } from "mongoose";

const rentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    laptopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laptop",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "returned", "cancelled"],
      default: "pending",
    },
    rentedFrom: { type: Date, required: true },
    rentedTo: { type: Date, required: true },
    actualReturnDate: { type: Date, default: null },
    totalDays: { type: Number, required: true },
    pricing: {
      baseAmount: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      lateFee: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    securityDeposit: { type: Number, required: true },
    depositRefunded: { type: Boolean, default: false },
    deliveryType: {
      type: String,
      enum: ["pickup", "delivery"],
      default: "pickup",
    },
    deliveryAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

const Rental = mongoose.model("Rental", rentSchema);

export default Rental;
