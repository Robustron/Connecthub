const express = require("express");
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
} = require("../controllers/bookingController.js");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/", auth, getBookings);
router.get("/:id", auth, getBookingById);
router.patch("/:id/status", auth, updateBookingStatus);

module.exports = router;
