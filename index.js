const express = require('express');
const app = express();
require('dotenv').config();
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const chartRoutes = require('./routes/charts');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Add security headers
app.use(helmet());

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// In production, replace '*' with your deployed frontend's URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
};

app.use(cors(corsOptions));

app.use('/posts', postRoutes);
app.use('/users/login', authLimiter);
app.use('/users/register', authLimiter);
app.use('/users', userRoutes);
app.use('/charts', chartRoutes);

app.use(express.static("public"));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8080;

// Only start the server if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
