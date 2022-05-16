const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require("fs");
const crypto = require("crypto");





// ## POST /api/users/register
// -   Creates a new user.
router.post('/register', (req, res) => {
    const { first_name, last_name, email, password, avatar, city, country, avatar_file_type} = req.body;

    if (!first_name || !last_name || !email || !password || !avatar || !avatar_file_type || !city || !country) {

       
        return res.status(400).send("Please enter the required fields.");
    }

    console.log(avatar);
    let binaryData = Buffer.from(avatar, 'base64').toString('binary');

    let fileName= crypto.randomUUID() + "." + avatar_file_type;
    fs.writeFileSync("public/images/" + fileName, binaryData, "binary");
    
    let urlPrefix = process.env.BACKEND_URL + ":" + process.env.PORT + "/images/";
    const hashedPassword = bcrypt.hashSync(password, 12);


    // Create the new user
    const newUser = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: hashedPassword,
        avatar_url: urlPrefix + fileName,
        city: city,
        country: country
    };

    knex('user')
        .insert(newUser)
        .then(() => {
            res.status(201).send("Registered successfully");
        })
        .catch((error) => {
            res.status(400).send("Failed registration");
            console.log(error);
        });
});


// ## POST /api/users/login
// -   Generates and responds a JWT for the user to use for future authorization.
// -   Expected body: { email, password }
// -   Response format: { token: "JWT_TOKEN_HERE" }
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).send("Please enter the required fields");
    }

    // Find the user
    knex('user')
        .where({ email: email })
        .first()
        .then((user) => {
            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            if (!isPasswordCorrect) {
                return res.status(400).send("Invalid password");
            }

            // Create a token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_KEY,
                { expiresIn: "24h" }
            );

            res.json({ token });
        })
        .catch(() => {
            res.status(400).send("Invalid credentials");
        });
});


// ## GET /api/users/current
// -   Gets information about the currently logged in user.
// -   If no valid JWT is provided, this route will respond with 401 Unauthorized.
// -   Expected headers: { Authorization: "Bearer JWT_TOKEN_HERE" }
router.get('/current', (req, res) => {
    // If there is no auth header provided
    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }
    console.log("Auth token " + req.headers.authorization);
    // Parse the Bearer token
    const authToken = req.headers.authorization.split(" ")[1];
    console.log("Auth token after split " + authToken);
    // Verify the token
    jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send("Invalid auth token");
        }

        knex('user')
            .where({ email: decoded.email })
            .first()
            .then((user) => {
                // Respond with the user data
                delete user.password;
                res.json(user);
            });
    });
});





module.exports = router;