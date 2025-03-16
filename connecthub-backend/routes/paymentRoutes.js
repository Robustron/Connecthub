// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Create a payment
router.post('/create-payment', async (req, res) => {
    const { amount } = req.body;

    try {
        const response = await axios.post('https://api.sandbox.paypal.com/v1/payments/payment', {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            transactions: [{
                amount: {
                    total: amount,
                    currency: 'USD',
                },
                description: 'Payment for service',
            }],
            redirect_urls: {
                return_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/cancel',
            },
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Execute payment
router.post('/execute-payment', async (req, res) => {
    const { paymentId, payerId } = req.body;

    try {
        const response = await axios.post(`https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`, {
            payer_id: payerId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error executing payment:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
