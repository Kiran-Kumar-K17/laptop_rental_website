import { Router } from "express";
import {
  addReview,
  getLaptopReviews,
  getUserReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = Router();

router.post("/", protect, addReview);

router.get("/my-reviews", protect, getUserReviews);

router.get("/laptop/:laptopId", getLaptopReviews);

router.delete("/:id", protect, admin, deleteReview);

export default router;
