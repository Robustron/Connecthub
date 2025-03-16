const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Education",
        "Technical Support",
        "Pet Services",
        "Transportation",
        "Home Services",
        "Health and Wellness",
      ],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Index for geospatial queries
serviceSchema.index({ location: "2dsphere" });

// Text index for search
serviceSchema.index({ name: "text", description: "text", tags: "text" });

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
