// connecthub-backend/server.js

const http = require('http');
const socketIo = require('socket.io');
/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const rateLimit = require('express-rate-limit');
const axios = require('axios'); // Import axios for PayPal token
require('dotenv').config();

/* eslint-enable import/no-extraneous-dependencies */

// Import routes
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');


const { generateDailyAnalytics } = require('./controllers/analyticsController');
const sanitizeUserInput = require('./middleware/sanitizeUserInput'); // Ensure this is correct

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const csrfProtection = csrf({ cookie: true });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Provide a default secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },
}));

// Test connection route
app.get('/api/test-connection', (req, res) => {
  res.json({ message: 'Successfully connected to backend' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle location updates
  socket.on('updateLocation', (data) => {
    socket.broadcast.emit('locationUpdated', data); // Broadcast location updates to other clients
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
});

// Middleware to make io accessible to route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Apply security middlewares
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}));
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

// Rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login requests per hour
  message: 'Too many login attempts, please try again after an hour',
});

// Use rate limiters and sanitizers
app.use(apiLimiter);
app.use(sanitizeUserInput); // Ensure this is a valid middleware function
app.use(csrfProtection);

// CSRF token middleware
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});

// PayPal access token retrieval
const getPayPalAccessToken = async () => {
  const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
    params: {
      grant_type: 'client_credentials',
    },
  });
  return response.data.access_token;
};

// Middleware to set PayPal access token
app.use(async (req, res, next) => {
  try {
    const token = await getPayPalAccessToken();
    process.env.PAYPAL_ACCESS_TOKEN = token; // Store token in environment variable
    next();
  } catch (error) {
    console.error('Error retrieving PayPal access token:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);


// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Schedule daily analytics generation at midnight
cron.schedule('0 0 * * *', generateDailyAnalytics);

// Error handling middleware
app.use((err, _req, res) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export app and io for use in other modules
module.exports = { app, io };
