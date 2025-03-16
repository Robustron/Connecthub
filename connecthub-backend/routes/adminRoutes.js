const express = require("express");
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getServices,
  updateServiceStatus,
  getRecentBookings,
  getRecentReviews,
} = require("../controllers/adminController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// Apply auth and isAdmin middleware to all routes
router.use(auth, isAdmin);

router.get("/dashboard-stats", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/status", updateUserStatus);
router.get("/services", getServices);
router.put("/services/status", updateServiceStatus);
router.get("/recent-bookings", getRecentBookings);
router.get("/recent-reviews", getRecentReviews);

module.exports = router;
