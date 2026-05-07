import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, street, city, state, pincode } =
      req.body;

    //build the address object
    const address = { street, city, state, pincode };

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists", field: "email" });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        message: "Phone Number already exists",
        field: "phone",
      });
    }
    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: password,
      address,
    });

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json(userResponse);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      return res.status(400).json({
        message: `${field} already exists`,
        field,
      });
    }
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Account not found, Please create an account to continue.",
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { name, email, phone, street, city, state, pincode } = req.body;

    const updateData = {};

    if (name?.trim()) updateData.name = name.trim();
    if (email?.trim()) updateData.email = email.trim();
    if (phone?.trim()) updateData.phone = phone.trim();
    if (street?.trim()) updateData["address.street"] = street.trim();
    if (city?.trim()) updateData["address.city"] = city.trim();
    if (state?.trim()) updateData["address.state"] = state.trim();
    if (pincode?.trim()) updateData["address.pincode"] = pincode.trim();

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ error: "No data to update" });

    if (updateData.email) {
      const existing = await User.findOne({ email: updateData.email });
      if (existing && existing._id.toString() !== req.user._id.toString())
        return res.status(400).json({ error: "Email already in use" });
    }

    if (updateData.phone) {
      const existing = await User.findOne({ phone: updateData.phone });
      if (existing && existing._id.toString() !== req.user._id.toString())
        return res.status(400).json({ error: "Phone number already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    const userResponse = updatedUser.toObject();
    delete userResponse.passwordHash;

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: userResponse });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const uploadKYC = async (req, res) => {
  try {
    // 1. Check if file exists in the request
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Please upload a document (Aadhaar/PAN)" });
    }

    // 2. Find user and update document path
    // We set kycStatus to "pending" to require admin re-approval on new uploads
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        kycDocument: req.file.path,
        kycVerified: false,
        kycStatus: "pending",
      },
      { returnDocument: "after", runValidators: true },
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message:
        "KYC document uploaded successfully. Awaiting admin verification.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("KYC UPLOAD ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Generic response for security (prevents user enumeration)
    const genericResponse = {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    };

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Generate secure reset token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Save hashed token to database
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    // Send email with raw token
    try {
      await sendPasswordResetEmail(email, rawToken, user.name);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // token is saved, you can still respond
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Hash the received token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token (not expired)
    const resetToken = await PasswordResetToken.findOne({
      tokenHash: tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new one.",
      });
    }

    // Find user
    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update password (pre-save hook will hash it automatically)
    user.passwordHash = newPassword;
    await user.save();

    // Delete used token (one-time use)
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.kycStatus === "approved") {
      return res.status(400).json({
        message: "KYC already approved",
      });
    }

    user.kycStatus = status;

    if (status === "approved") {
      user.kycVerified = true;
    } else {
      user.kycVerified = false;
    }

    await user.save();
    res.status(200).json({
      message: `KYC ${status} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateProfile,
  uploadKYC,
  forgotPassword,
  resetPassword,
  updateKYCStatus,
};
