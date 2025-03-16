const Joi = require("joi");
const { body, validationResult } = require("express-validator");

// Define the registration schema
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "provider").required(),
});

// Define the login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Middleware to validate user input for registration
const validateUserInput = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Validation error", error: error.details[0].message });
  }
  next();
};

// Middleware to validate user input for login
const validateLoginInput = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Validation error", error: error.details[0].message });
  }
  next();
};

// Middleware to validate service input
const validateServiceInput = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("price").isNumeric().withMessage("Price must be a valid number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateUserInput, validateLoginInput, registerSchema, loginSchema, validateServiceInput };