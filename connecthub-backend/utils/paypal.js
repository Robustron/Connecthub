// Import the PayPal SDK and dotenv to load environment variables
require('dotenv').config(); // Loads environment variables from the .env file
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// Function to create PayPal client
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

// Function to configure the PayPal environment (sandbox in this case)
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;  // Load clientId from environment variables
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET; // Load clientSecret from environment variables

  if (!clientId || !clientSecret) {
    throw new Error("PayPal client ID or secret is not set in environment variables.");
  }

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

// Export the client function
module.exports = { client };
