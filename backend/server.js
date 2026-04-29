import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import laptopRoutes from "./routes/laptopRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
const PORT = process.env.PORT || 8000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/laptops", laptopRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
