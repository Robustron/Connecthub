const Analytics = require("../models/Analytics");
const User = require("../models/user");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

exports.generateDailyAnalytics = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newUsers = await User.countDocuments({ createdAt: { $gte: today } });
  const activeUsers = await User.countDocuments({
    lastActive: { $gte: today },
  });
  const newBookings = await Booking.countDocuments({
    createdAt: { $gte: today },
  });
  const completedBookings = await Booking.countDocuments({
    status: "completed",
    updatedAt: { $gte: today },
  });
  const totalRevenue = await Booking.aggregate([
    { $match: { status: "completed", updatedAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const averageRating = await Review.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);

  const analytics = new Analytics({
    date: today,
    newUsers,
    activeUsers,
    newBookings,
    completedBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    averageRating: averageRating[0]?.avg || 0,
  });

  await analytics.save();
};

exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const analytics = await Analytics.find(query).sort("date");
    res.json(analytics);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
};

exports.getServiceProviderAnalytics = async (req, res) => {
  try {
    const providerId = req.user._id;
    const { startDate, endDate } = req.query;
    const query = { provider: providerId };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const bookings = await Booking.find(query);
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(
      (booking) => booking.status === "completed",
    ).length;
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0,
    );
    const averageRating = await Review.aggregate([
      {
        $match: {
          service: { $in: bookings.map((booking) => booking.service) },
        },
      },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.json({
      totalBookings,
      completedBookings,
      totalRevenue,
      averageRating: averageRating[0]?.avg || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching service provider analytics",
      error: error.message,
    });
  }
};
