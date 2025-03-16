const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { bookingSchema } = require("../utils/validationSchemas");
const io = require("../utils/socket");
const { createNotification } = require("../utils/notificationUtils");

exports.createBooking = async (req, res) => {
  try {
    // Validate request body
    const { error } = bookingSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", error: error.details[0].message });
    }

    // Find the service
    const service = await Service.findById(req.body.service);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Create new booking
    const booking = new Booking({
      // eslint-disable-next-line no-underscore-dangle
      user: req.user._id,
      // eslint-disable-next-line no-underscore-dangle
      service: service._id,
      provider: service.provider,
      bookingDate: req.body.bookingDate,
      totalPrice: service.price,
    });

    await booking.save();

    // Send real-time notification to the provider
    io.getIo().to(service.provider.toString()).emit("newBooking", { booking });

    // Create notification for the service provider
    await createNotification(
      service.provider,
      `New booking request for ${service.name}`,
      "booking",
      booking._id,
      "Booking",
    );

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Booking creation error:", error);
    res
      .status(500)
      .json({ message: "Booking creation failed", error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("service")
      .populate("provider", "username email");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("service")
      .populate("provider", "username email");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res
      .status(500)
      .json({ message: "Error fetching booking", error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({
      _id: req.params.id,
      provider: req.user._id,
    });
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or you are not authorized to update it",
      });
    }
    booking.status = status;
    await booking.save();

    // Send real-time notification to the user
    io.getIo()
      .to(booking.user.toString())
      .emit("bookingStatusUpdate", { booking });

    // Create notification for the user
    await createNotification(
      booking.user,
      `Your booking status has been updated to ${status}`,
      "booking",
      booking._id,
      "Booking",
    );

    res
      .status(200)
      .json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    console.error("Booking status update error:", error);
    res
      .status(500)
      .json({ message: "Booking status update failed", error: error.message });
  }
};
