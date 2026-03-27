import Review from "../models/Review.js";
import Rental from "../models/Rental.js";
import Laptop from "../models/Laptop.js";

// Add a review (Only after laptop is returned)
// POST /api/reviews
const addReview = async (req, res) => {
  try {
    // 1. Destructure rentalId from the body
    const { laptopId, rentalId, rating, comment } = req.body;

    // 2. Verify this specific rental belongs to the user and is returned
    const completedRental = await Rental.findOne({
      _id: rentalId,
      userId: req.user._id,
      status: "returned",
    });

    if (!completedRental) {
      return res.status(403).json({
        error:
          "Invalid rental or laptop not yet returned. Check your rentalId and status.",
      });
    }

    // 3. Create the review
    const review = await Review.create({
      userId: req.user._id,
      laptopId,
      rentalId, // Using the ID you passed in JSON
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: "You have already submitted a review for this rental.",
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews for a specific laptop
// GET /api/reviews/laptop/:laptopId
const getLaptopReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ laptopId: req.params.laptopId })
      .populate("userId", "name")
      .sort("-createdAt");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews written by the logged-in user
// GET /api/reviews/my-reviews
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate("laptopId", "brand model")
      .sort("-createdAt");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a review (Admin Only)
// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review removed by admin" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { addReview, getLaptopReviews, getUserReviews, deleteReview };
