import Rental from "../models/Rental.js";
import Laptop from "../models/Laptop.js";
import User from "../models/User.js";

const createRental = async (req, res) => {
  try {
    const {
      laptopId,
      rentedFrom,
      rentedTo,
      totalDays,
      baseAmount,
      totalAmount,
      deliveryType,
      deliveryAddress,
    } = req.body;

    // 1. Verify User KYC Status
    const user = await User.findById(req.user._id);
    if (!user.kycVerified) {
      return res
        .status(403)
        .json({ error: "KYC verification required before renting." });
    }

    // 2. Check Laptop Availability
    const laptop = await Laptop.findById(laptopId);
    if (
      !laptop ||
      laptop.availableUnits <= 0 ||
      laptop.status !== "available"
    ) {
      return res
        .status(400)
        .json({ error: "Laptop is currently unavailable." });
    }

    // 3. Create Rental Record
    const rental = await Rental.create({
      userId: req.user._id,
      laptopId,
      rentedFrom,
      rentedTo,
      totalDays,
      deliveryType,
      deliveryAddress:
        deliveryType === "delivery" ? deliveryAddress : undefined,
      pricing: {
        baseAmount,
        totalAmount,
      },
      securityDeposit: laptop.securityDeposit,
    });

    // 4. Update Laptop Inventory
    laptop.availableUnits -= 1;
    if (laptop.availableUnits === 0) laptop.status = "rented";
    await laptop.save();

    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ userId: req.user._id })
      .populate("laptopId", "brand model pricing")
      .sort("-createdAt");
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const returnLaptop = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental || rental.status !== "active") {
      return res
        .status(400)
        .json({ error: "Rental not active or already returned." });
    }

    const now = new Date();
    let lateFee = 0;

    // Simple Late Fee Logic: If return date > rentedTo date
    if (now > rental.rentedTo) {
      const diffTime = Math.abs(now - rental.rentedTo);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Assuming a flat late fee of ₹500/day for example
      lateFee = diffDays * 500;
    }

    rental.status = "returned";
    rental.actualReturnDate = now;
    rental.pricing.lateFee = lateFee;
    rental.pricing.totalAmount += lateFee;
    await rental.save();

    // Restore Laptop Inventory
    const laptop = await Laptop.findById(rental.laptopId);
    laptop.availableUnits += 1;
    laptop.status = "available";
    await laptop.save();

    res.status(200).json({ message: "Laptop returned", rental });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!rental || rental.status !== "pending") {
      return res.status(400).json({ error: "Cannot cancel this rental." });
    }

    rental.status = "cancelled";
    await rental.save();

    // Re-add unit back to inventory
    const laptop = await Laptop.findById(rental.laptopId);
    laptop.availableUnits += 1;
    laptop.status = "available";
    await laptop.save();

    res.status(200).json({ message: "Rental cancelled successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export { createRental, getUserRentals, returnLaptop, cancelRental };
