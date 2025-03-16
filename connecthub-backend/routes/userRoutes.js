const express = require("express");
const {
    register,
    login,
    getProfile,
    updateProfile,
    updateProviderProfile,
} = require("../controllers/userController"); // Ensure this path is correct
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { authLimiter } = require("../middleware/rateLimiter");
const { validateUserInput } = require("../middleware/inputValidator");
const sanitizeUserInput = require("../middleware/sanitizeUserInput"); // Ensure this is correct

const router = express.Router();

// Helper function to handle async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Public routes
router.post("/register", sanitizeUserInput, validateUserInput, asyncHandler(register));
router.post("/login", sanitizeUserInput, validateUserInput, asyncHandler(login));

// Protected routes
router.get("/profile", auth, asyncHandler(getProfile));
router.put(
    "/profile",
    auth,
    sanitizeUserInput,
    validateUserInput,
    upload.single("profilePicture"),
    asyncHandler(updateProfile)
);
router.put(
    "/provider-profile",
    auth,
    sanitizeUserInput,
    validateUserInput,
    upload.single("profilePicture"),
    asyncHandler(updateProviderProfile)
);

// Error handling middleware
router.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

module.exports = router;