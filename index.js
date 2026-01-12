const express = require('express');
const app = express();
require('dotenv').config();
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const chartRoutes = require('./routes/charts');
const cors = require('cors');
const helmet = require('helmet');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Add security headers
app.use(helmet());

// In production, replace '*' with your deployed frontend's URL
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
};

app.use(cors(corsOptions));

app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/charts', chartRoutes);

app.use(express.static("public"));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
