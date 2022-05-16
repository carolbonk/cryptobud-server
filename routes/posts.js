const express = require('express');
const router = express.Router();
const fs = require('fs');
const crypto = require('crypto');
const { response } = require('express');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../knexfile'));


router.get ('/', (req, res) => {
    const authToken = req.headers.authorization.split(" ")[1];
    jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
        
        if (err) {
            console.log(err);
            return res.status(401).send("Invalid auth token");
        }

      knex('post')
       .where({ global: true })
       .then((posts) => {
        res.status(201).send(posts);
    }
    );
});
});

router.post('/', (req, res) => {
    const authToken = req.headers.authorization.split(" ")[1];
    jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send("Invalid auth token");
        }
    const {message, global, image, image_type} = req.body;
    const user_id = decoded.id;
   
    if (!global) {

       
        return res.status(400).send("Please enter the required fields.");
    }


    //at least one of these is required
    if (!message && (!image || !image_type)) {

       
        return res.status(400).send("Please enter the required fields.");
    }

            let newPost = null;
            if (!!image && !!image_type)
            {
            
            let binaryData = Buffer.from(image, 'base64').toString('binary');
        
            let fileName= crypto.randomUUID() + "." + image_type;
        
            fs.writeFileSync("public/images/" + fileName, binaryData, "binary");
            
            
            let urlPrefix = process.env.BACKEND_URL + ":" + process.env.PORT + "/images/";
        
            newPost = {
               message: message,
               user_id: user_id,
               image_url: urlPrefix + fileName,
               global: global
            }
          }
          else
          {
                 
            newPost = {
                message: message,
                user_id: user_id,
                global: global
          }
        
            // Create the new post
  
            knex('post')
                .insert(newPost)
                .then(() => {
                    res.status(201).send("Posted successfully");
                })
                .catch((error) => {
                    res.status(400).send("Failed posting");
                    console.log(error);
                });
        
    }});
   
}
);



module.exports = router;
