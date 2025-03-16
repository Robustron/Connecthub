const paypal = require("@paypal/checkout-server-sdk");
const payPalClient = require("../utils/paypal");
const Booking = require("../models/Booking");

exports.createPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: booking.totalPrice.toString(),
          },
        },
      ],
    });

    const order = await payPalClient.client().execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating payment", error: error.message });
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await payPalClient.client().execute(request);
    const captureId = capture.result.purchase_units[0].payments.captures[0].id;

    // Update booking status to 'paid'
    await Booking.findByIdAndUpdate(req.params.bookingId, { status: "paid" });

    res.json({ captureId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error capturing payment", error: error.message });
  }
};
