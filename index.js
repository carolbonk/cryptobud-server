const express = require('express');
const app = express();
require('dotenv').config();
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const cors = require('cors');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use('/posts', postRoutes);
app.use('/users', userRoutes);

app.use(express.static("public"));

const {PORT, BACKEND_URL} = process.env;

app.listen(PORT, () => {
    console.log("server has started");
});
