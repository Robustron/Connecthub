const Joi = require("joi");

exports.registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  role: Joi.string().valid("user", "provider", "admin").default("user"),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.serviceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string()
    .valid(
      "Education",
      "Technical Support",
      "Pet Services",
      "Transportation",
      "Home Services",
      "Health and Wellness",
    )
    .required(),
  price: Joi.number().min(0).required(),
  availability: Joi.boolean(),
});

exports.bookingSchema = Joi.object({
  service: Joi.string().required(),
  bookingDate: Joi.date().greater("now").required(),
});

exports.reviewSchema = Joi.object({
  serviceId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
});

exports.updateProfileSchema = Joi.object({
  profilePicture: Joi.string().uri(),
  bio: Joi.string().max(500),
  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/),
  address: Joi.string().max(200),
  specialties: Joi.array().items(Joi.string()),
  availability: Joi.array().items(Joi.string()),
}).min(1);

exports.searchSchema = Joi.object({
  query: Joi.string(),
  category: Joi.string().valid(
    "Education",
    "Technical Support",
    "Pet Services",
    "Transportation",
    "Home Services",
    "Health and Wellness",
  ),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  rating: Joi.number().min(1).max(5),
  location: Joi.string().pattern(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  distance: Joi.number().min(0),
});
