const express = require("express");
const router = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile"));

router.get("/", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }

    console.log("to " + req.query.to);
    let where = null;
    let orWhere = null;
    let orWhereTwo = null;
    if (!req.query.user_id) {
      where = { global: true };
      orWhere = { global: false, primary_user_id: decoded.id };
      orWhereTwo = { global: false, user_id: decoded.id };

      knex("post")
        .join("user", "post.user_id", "user.id")
        .join("following", "post.user_id", "following.secondary_user_id")
        .where(where)
        .orWhere(orWhere)
        .orWhere(orWhereTwo)
        .select(
          "post.message",
          "post.user_id",
          "post.id",
          "post.date",
          "post.global",
          "post.image_url",
          "post.coin",
          "post.start_date",
          "post.end_date",
          "user.first_name",
          "user.last_name",
          "user.avatar_url"
        )
        .orderBy("date", "desc")
        .distinct("post.id")
        .limit(req.query.to)
        .offset(req.query.from)
        .then((posts) => {
          let data = {
            posts: posts,
          };
          res.status(201).send(data);
        });
    } else {
      where = { user_id: req.query.user_id, global: true };
      orWhere = {
        user_id: req.query.user_id,
        global: false,
        primary_user_id: decoded.id,
      };

      knex("post")
      .join("user", "post.user_id", "user.id")
      .join("following", "post.user_id", "following.secondary_user_id")
      .where(where)
      .orWhere(orWhere)
      .select(
        "post.message",
        "post.user_id",
        "post.id",
        "post.date",
        "post.global",
        "post.image_url",
        "post.coin",
        "post.start_date",
        "post.end_date",
        "user.first_name",
        "user.last_name",
        "user.avatar_url"
      )
      .orderBy("date", "desc")
      .distinct("post.id")
      .limit(req.query.to)
      .offset(req.query.from)
      .then((posts) => {
        let data = {
          posts: posts,
        };
        res.status(201).send(data);
      });
    }
  });
});

router.post("/", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }
    const { message, global, image, image_type, coin, start_date, end_date } = req.body;
    const user_id = decoded.id;

    if (global == null) {
      return res.status(400).send("Please enter the required fields.");
    }

    //at least one of these is required
    if (!message && (!image || !image_type)) {
      return res.status(400).send("Please enter the required fields.");
    }

    let newPost = null;
    if (!!image && !!image_type) {
      let binaryData = Buffer.from(image, "base64").toString("binary");

      let fileName = crypto.randomUUID() + "." + image_type;

      fs.writeFileSync("public/images/" + fileName, binaryData, "binary");

      let urlPrefix =
        process.env.BACKEND_URL + ":" + process.env.PORT + "/images/";

    
      newPost = {
        message: message,
        user_id: user_id,
        image_url: (urlPrefix + fileName),
        global: global,
      };


    } else {
      newPost = {
        message: message,
        user_id: user_id,
        global: global,
      };
    }

    if (!!coin)
    {
    newPost.coin = coin;
    newPost.start_date = new Date(start_date);
    newPost.end_date = new Date(end_date);
    }
      // Create the new post

      knex("post")
        .insert(newPost)
        .then(() => {
          res.status(201).send("Posted successfully");
        })
        .catch((error) => {
          res.status(400).send("Failed posting");
          console.log(error);
        });
    
  });
});

module.exports = router;
