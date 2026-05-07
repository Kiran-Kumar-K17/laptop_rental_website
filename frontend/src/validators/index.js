import { z } from "zod";

// Reusable schemas
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

// User Validation Schemas
const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
});

const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(
      /^[0-9]{10}$/,
      "Phone must be exactly 10 digits and it should be a valid phone number",
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z
    .string()
    .min(6, "Pincode must be at least 6 digits")
    .regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
});

const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .optional(),
  street: z.string().min(1, "Street is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  pincode: z
    .string()
    .min(6, "Pincode must be at least 6 digits")
    .regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
    .optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
});

// Laptop Validation Schemas
const laptopSpecsSchema = z.object({
  processor: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  gpu: z.string().optional(),
  display: z.string().optional(),
  battery: z.string().optional(),
});

const laptopPricingSchema = z.object({
  perDay: z.number().positive(),
  perWeek: z.number().positive(),
  perMonth: z.number().positive(),
});

const addLaptopSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),

  specs: laptopSpecsSchema,
  pricing: laptopPricingSchema,

  category: z.enum(["Office", "Gaming", "Student", "Workstation"]),
  condition: z.enum(["new", "good", "fair"]),
  status: z.enum(["available", "rented", "maintenance"]).optional(),

  totalUnits: z.number().int().positive(),
  availableUnits: z.number().optional(),

  securityDeposit: z.number().positive(),

  tags: z.array(z.string()).optional(),
});

const updateLaptopSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  specs: z.union([laptopSpecsSchema, z.string()]).optional(),
  pricing: z.union([laptopPricingSchema, z.string()]).optional(),
  condition: z.enum(["excellent", "good", "fair"]).optional(),
  totalUnits: z.number().int().positive().optional(),
  status: z.enum(["available", "rented", "maintenance"]).optional(),
  securityDeposit: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

// Rental Validation Schemas
const createRentalSchema = z
  .object({
    laptopId: objectIdSchema,
    rentedFrom: z.string().transform((str) => new Date(str)),
    rentedTo: z.string().transform((str) => new Date(str)),
  })
  .refine(
    (data) => {
      const fromDate = new Date(data.rentedFrom);
      const toDate = new Date(data.rentedTo);
      return toDate > fromDate;
    },
    {
      message: "Rented to date must be after rented from date",
      path: ["rentedTo"],
    },
  );

// Payment Validation Schemas
const createOrderSchema = z.object({
  rentalId: objectIdSchema,
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  rentalId: objectIdSchema,
});

const processRefundSchema = z.object({
  notes: z.string().optional(),
});

// Review Validation Schemas
const addReviewSchema = z.object({
  laptopId: objectIdSchema,
  rentalId: objectIdSchema,
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
});

// Export all schemas
export {
  registerUserSchema,
  loginUserSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  addLaptopSchema,
  updateLaptopSchema,
  createRentalSchema,
  createOrderSchema,
  verifyPaymentSchema,
  processRefundSchema,
  addReviewSchema,
};
