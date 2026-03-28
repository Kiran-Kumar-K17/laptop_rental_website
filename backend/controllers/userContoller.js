import User from "../models/User.js";
import jwt from "jsonwebtoken";

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
      return res.status(400).json({ error: "Email already registered" });
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
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
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
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(req.body);

    const { name, email, phone, street, city, state, pincode } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (street) updateData["address.street"] = street;
    if (city) updateData["address.city"] = city;
    if (state) updateData["address.state"] = state;
    if (pincode) updateData["address.pincode"] = pincode;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No data to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const userResponse = updatedUser.toObject();
    delete userResponse.passwordHash;

    res.status(200).json(userResponse);
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
    // We set kycVerified to false to require admin re-approval on new uploads
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        kycDocument: req.file.path,
        kycVerified: false,
      },
      { new: true, runValidators: true },
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

export { registerUser, loginUser, getUserProfile, updateProfile, uploadKYC };
