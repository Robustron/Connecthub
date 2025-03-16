const express = require("express");
const {
  createReview,
  getServiceReviews,
} = require("../controllers/reviewController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createReview);
router.get("/service/:serviceId", getServiceReviews);

module.exports = router;
