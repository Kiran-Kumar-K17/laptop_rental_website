import Laptop from "../models/Laptop.js";

const getAllLaptops = async (req, res) => {
  try {
    const { brand, condition, minPrice, maxPrice, tag } = req.query;
    let query = {};

    // Filtering logic
    if (brand) query.brand = new RegExp(brand, "i");
    if (condition) query.condition = condition;
    if (tag) query.tags = { $in: [tag] };

    // Price filtering (based on daily rate)
    if (minPrice || maxPrice) {
      query["pricing.perDay"] = {};
      if (minPrice) query["pricing.perDay"].$gte = Number(minPrice);
      if (maxPrice) query["pricing.perDay"].$lte = Number(maxPrice);
    }

    // Only show laptops that have available units or are not in maintenance
    query.status = { $ne: "maintenance" };
    query.availableUnits = { $gt: 0 };

    const laptops = await Laptop.find(query).sort("-createdAt");
    res.status(200).json(laptops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLaptopById = async (req, res) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ error: "Laptop not found" });
    res.status(200).json(laptop);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
};

const addLaptop = async (req, res) => {
  try {
    const laptopData = {
      ...req.body,
      availableUnits: req.body.totalUnits || 1,
    };
    const laptop = await Laptop.create(laptopData);
    res.status(201).json(laptop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateLaptop = async (req, res) => {
  try {
    const { totalUnits } = req.body;
    const laptop = await Laptop.findById(req.params.id);

    if (!laptop) return res.status(404).json({ error: "Laptop not found" });

    // 1. If totalUnits is being updated, sync availableUnits
    if (totalUnits !== undefined) {
      const unitDifference = totalUnits - laptop.totalUnits;

      // Calculate new availability
      const newAvailableUnits = laptop.availableUnits + unitDifference;

      // Prevent reducing totalUnits below what is currently rented out
      if (newAvailableUnits < 0) {
        return res.status(400).json({
          error: `Cannot reduce total units to ${totalUnits}. ${Math.abs(laptop.availableUnits - laptop.totalUnits)} units are currently rented out.`,
        });
      }

      req.body.availableUnits = newAvailableUnits;

      // Update status if units become available or sold out
      if (newAvailableUnits > 0 && laptop.status === "rented") {
        req.body.status = "available";
      } else if (newAvailableUnits === 0) {
        req.body.status = "rented";
      }
    }

    // 2. Perform the update
    const updatedLaptop = await Laptop.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json(updatedLaptop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteLaptop = async (req, res) => {
  try {
    const laptop = await Laptop.findByIdAndDelete(req.params.id);
    if (!laptop) return res.status(404).json({ error: "Laptop not found" });
    res.status(200).json({ message: "Laptop deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const laptop = await Laptop.findById(req.params.id);
    if (!laptop) return res.status(404).json({ error: "Laptop not found" });

    const isAvailable =
      laptop.availableUnits > 0 && laptop.status === "available";

    res.status(200).json({
      available: isAvailable,
      remainingUnits: laptop.availableUnits,
      pricing: laptop.pricing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getAllLaptops,
  getLaptopById,
  addLaptop,
  updateLaptop,
  deleteLaptop,
  checkAvailability,
};
