const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  newUsers: {
    type: Number,
    default: 0,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  newBookings: {
    type: Number,
    default: 0,
  },
  completedBookings: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
