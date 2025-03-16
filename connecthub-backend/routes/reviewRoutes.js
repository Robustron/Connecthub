// connecthub-backend/routes/reviewRoutes.js
const express = require('express');
const Review = require('../models/Review');
const router = express.Router();

// Create a new review
router.post('/', async (req, res) => {
    const { user, service, rating, comment } = req.body;
    const review = new Review({ user, service, rating, comment });
    await review.save();
    res.status(201).json(review);
});

// Get reviews for a service
router.get('/:serviceId', async (req, res) => {
    const reviews = await Review.find({ service: req.params.serviceId }).populate('user', 'username');
    res.json(reviews);
});

module.exports = router;