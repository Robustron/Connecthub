const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { registerSchema, loginSchema } = require("../utils/validationSchemas");

// User registration
exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", error: error.details[0].message });
    }

    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || "1d" });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error); // Log the error
    res.status(400).json({ message: "Registration failed", error: "Failed to register user." });
  }
};

// Other controller functions remain the same


// User login
exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Validation error", error: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error); // Log the error
    res.status(400).json({ message: "Login failed", error: "Failed to log in." });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming you set userId in the auth middleware
    const user = await User.findById(userId).select("-password"); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: "Error retrieving profile", error: "Failed to retrieve profile." });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming you set userId in the auth middleware
    const updates = req.body; // Get the updates from the request body

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: "Error updating profile", error: "Failed to update profile." });
  }
};

// Update provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming you set userId in the auth middleware
    const updates = req.body; // Get the updates from the request body

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Provider profile updated successfully", user });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: "Error updating provider profile", error: "Failed to update provider profile." });
  }
};
