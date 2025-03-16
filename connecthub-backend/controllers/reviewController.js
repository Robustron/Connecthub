const Review = require("../models/Review");
const Service = require("../models/Service");
const { reviewSchema } = require("../utils/validationSchemas");

exports.createReview = async (req, res) => {
  try {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", error: error.details[0].message });
    }

    const { serviceId, rating, comment } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const review = new Review({
      user: req.user._id,
      service: serviceId,
      rating,
      comment,
    });

    await review.save();

    // Update service average rating and review count
    service.reviewCount += 1;
    service.averageRating =
      (service.averageRating * (service.reviewCount - 1) + rating) /
      service.reviewCount;
    await service.save();

    res.status(201).json({ message: "Review created successfully", review });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Review creation failed", error: error.message });
  }
};

exports.getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("user", "username")
      .sort("-createdAt");
    res.json(reviews);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: error.message });
  }
};
