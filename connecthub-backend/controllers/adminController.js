const User = require("../models/user");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.json({
      totalUsers,
      totalServices,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating user status", error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate(
      "provider",
      "username email",
    );
    res.json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

exports.updateServiceStatus = async (req, res) => {
  try {
    const { serviceId, status } = req.body;
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { status },
      { new: true },
    );
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating service status", error: error.message });
  }
};

exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort("-createdAt")
      .limit(10)
      .populate("user", "username email")
      .populate("service", "name");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recent bookings",
      error: error.message,
    });
  }
};

exports.getRecentReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort("-createdAt")
      .limit(10)
      .populate("user", "username")
      .populate("service", "name");
    res.json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching recent reviews", error: error.message });
  }
};
