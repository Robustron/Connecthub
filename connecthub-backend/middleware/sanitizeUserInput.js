const { body } = require("express-validator");

const sanitizeUserInput = [
  body("username").trim().escape(),
  body("email").trim().normalizeEmail(),
  body("password").trim().escape(),
  body("firstName").trim().escape(),
  body("lastName").trim().escape(),
  // Add more fields as needed
];

module.exports = sanitizeUserInput; // Ensure this is exported correctly