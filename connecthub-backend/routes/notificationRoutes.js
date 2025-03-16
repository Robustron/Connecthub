// connecthub-backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Import the Notification model

// Get all notifications for a user
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
});

// Create a new notification (for internal usage)
router.post('/', async (req, res) => {
    try {
        const { recipient, content, type, relatedId, onModel } = req.body;
        const newNotification = new Notification({
            recipient,
            content,
            type,
            relatedId,
            onModel,
        });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
});

// Update a notification (mark as read/unread)
router.put('/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification && notification.recipient.toString() === req.user._id.toString()) {
            notification.read = req.body.read !== undefined ? req.body.read : notification.read;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification && notification.recipient.toString() === req.user._id.toString()) {
            await notification.remove();
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
});

module.exports = router;
