const Service = require("../models/Service");
const { serviceSchema, searchSchema } = require("../utils/validationSchemas");

exports.createService = async (req, res) => {
  try {
    const { error } = serviceSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", error: error.details[0].message });
    }

    const service = new Service({
      ...req.body,
      provider: req.user._id,
    });
    await service.save();
    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Service creation failed", error: error.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate(
      "provider",
      "username email"
    );
    res.json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "provider",
      "username email"
    );
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching service", error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { error } = serviceSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", error: error.details[0].message });
    }

    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found or you are not authorized to update it",
      });
    }

    res.json({ message: "Service updated successfully", service });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Service update failed", error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      provider: req.user._id,
    });
    if (!service) {
      return res.status(404).json({
        message: "Service not found or you are not authorized to delete it",
      });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting service", error: error.message });
  }
};

exports.searchServices = async (req, res) => {
  try {
    const { error } = searchSchema.validate(req.query);
    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", error: error.details[0].message });
    }

    const { query, category, minPrice, maxPrice, rating, location, distance } =
      req.query;

    let filter = {};

    if (query) {
      filter.$text = { $search: query };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (rating) {
      filter.averageRating = { $gte: Number(rating) };
    }

    if (location && distance) {
      const [lng, lat] = location.split(",").map(Number);
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: Number(distance) * 1000, // Convert km to meters
        },
      };
    }

    const services = await Service.find(filter)
      .populate("provider", "username email profilePicture")
      .sort("-createdAt");

    res.json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching services", error: error.message });
  }
};
