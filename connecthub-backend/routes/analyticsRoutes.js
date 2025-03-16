const express = require("express");
const {
  getAnalytics,
  getServiceProviderAnalytics,
} = require("../controllers/analyticsController");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.get("/", auth, isAdmin, getAnalytics);
router.get("/provider", auth, getServiceProviderAnalytics);

module.exports = router;
