require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Sets secure HTTP headers
// Allow cross-origin requests from the frontend during development
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000'
}));

// Rate limiting to prevent brute force/DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiter to all API requests
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.warn('WARNING: MONGO_URI environment variable is not defined. Using an in-memory or unauthenticated local fallback may cause issues.');
}

// Set up mongoose connection
mongoose.connect(mongoURI || 'mongodb://localhost:27017/emotilearn', {
  // Use options to suppress warnings if needed, but defaults are fine for modern mongoose
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// API Routes
app.use('/api', apiRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../build')));

  // Catch-all route to serve React app for any unhandled routes
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
