const express = require("express");
const {
  createPayment,
  capturePayment,
} = require("../controllers/paymentController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/:bookingId/create", auth, createPayment);
router.post("/:bookingId/capture", auth, capturePayment);

module.exports = router;
