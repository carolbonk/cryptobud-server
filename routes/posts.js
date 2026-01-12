const express = require("express");
const router = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const knexConfig = require("../knexfile");
const environment = process.env.NODE_ENV || "development";
const dbConfig = knexConfig[environment];
console.log("Knex config:", JSON.stringify(dbConfig, null, 2));
const knex = require("knex")(dbConfig);
const cloudinary = require("cloudinary").v2;

router.get("/", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }

    let where = null;
    let orWhere = null;
    let orWhereTwo = null;
    if (!req.query.user_id) {
      where = { global: true };
      orWhere = { global: false, primary_user_id: decoded.id };
      orWhereTwo = { global: false, user_id: decoded.id };

      knex("post")
        .leftJoin("user", "post.user_id", "user.id")
        .leftJoin("following", "post.user_id", "following.secondary_user_id")
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
        .leftJoin("user", "post.user_id", "user.id")
        .leftJoin("following", "post.user_id", "following.secondary_user_id")
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

router.post("/:post_id/comments", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }
    const { post_id } = req.params;
    const { message } = req.body;
    const user_id = decoded.id;

    if (!message || !post_id) {
      return res.status(400).send("Please enter the required fields.");
    }
    // Create the new post
    let newComment = {
      message: message,
      post_id: post_id,
      user_id: user_id,
    };

    knex("comment")
      .insert(newComment)
      .then(() => {
        res.status(201).send("Posted successfully");
      })
      .catch((error) => {
        res.status(400).send("Failed posting");
        console.log(error);
      });
  });
});

router.get("/:post_id/comments", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }

    const { post_id } = req.params;

    let where = null;
    let orWhere = null;
    let orWhereTwo = null;

    where = { global: true, "post.id": post_id };
    orWhere = {
      global: false,
      primary_user_id: decoded.id,
      "post.id": post_id,
    };
    orWhereTwo = {
      global: false,
      "post.user_id": decoded.id,
      "post.id": post_id,
    };

    knex("post")
      .leftJoin("user", "post.user_id", "user.id")
      .leftJoin("following", "post.user_id", "following.secondary_user_id")
      .leftJoin("comment", "post.id", "comment.post_id")
      .leftJoin("user as commentUser", "comment.user_id", "commentUser.id")
      .where(where)
      .orWhere(orWhere)
      .orWhere(orWhereTwo)
      .select(
        "post.message as postMessage",
        "post.user_id as postUserId",
        "post.id as postId",
        "post.date as postDate",
        "post.global as postGlobal",
        "post.image_url as postImageURL",
        "post.coin as postCoin",
        "post.start_date as postStartDate",
        "post.end_date as postEndDate",
        "user.first_name as postFirstName",
        "user.last_name as postLastName",
        "user.avatar_url as postAvatarUrl",
        "comment.message",
        "comment.id",
        "comment.user_id",
        "comment.date",
        "commentUser.first_name",
        "commentUser.last_name",
        "commentUser.avatar_url"
      )
      .orderBy("date", "desc")
      .distinct("comment.id")
      .then((posts) => {
        let data = {
          posts: posts,
        };
        res.status(201).send(data);
      });
  });
});

router.post("/", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }
    const { message, global, image, image_type, coin, start_date, end_date } =
      req.body;
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

      let imageRoute = "public/images/" + fileName;

        cloudinary.uploader.upload(imageRoute, {}, (error, result)=>{
          
           newPost = {
        message: message,
        user_id: user_id,
        image_url: result.url,
        global: global,
      };

      if (!!coin) {
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
}
  else {
      newPost = {
        message: message,
        user_id: user_id,
        global: global,
      };
    

    if (!!coin) {
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

    }
  });

});

router.post("/:post_id/likes", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }
    const { post_id } = req.params;
    const { type } = req.body;
    const user_id = decoded.id;

    if (!type || !post_id) {
      return res.status(400).send("Please enter the required fields.");
    }
    // Create the new post
    let newLike = {
      type: type,
      post_id: post_id,
      user_id: user_id,
    };

    knex("likes")
      .insert(newLike)
      .then(() => {
        res.status(201).send("Posted successfully");
      })
      .catch((error) => {
        res.status(400).send("Failed posting");
        console.log(error);
      });
  });
});

router.delete("/:post_id/likes", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }
    const { post_id } = req.params;
    const user_id = decoded.id;

    if (!post_id) {
      return res.status(400).send("Please enter the required fields.");
    }
    // Create the new post

    knex("likes")
      .delete()
      .where({ post_id: post_id, user_id: user_id })
      .then(() => {
        res.status(201).send("Deleted successfully");
      })
      .catch((error) => {
        res.status(400).send("Failed deletion");
        console.log(error);
      });
  });
});

router.get("/:post_id/likes", (req, res) => {
  const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send("Invalid auth token");
    }

    const { post_id } = req.params;

    let where = null;
    let orWhere = null;
    let orWhereTwo = null;

    where = { global: true, "post.id": post_id };
    orWhere = {
      global: false,
      primary_user_id: decoded.id,
      "post.id": post_id,
    };
    orWhereTwo = {
      global: false,
      "post.user_id": decoded.id,
      "post.id": post_id,
    };

    knex("post")
      .leftJoin("user", "post.user_id", "user.id")
      .leftJoin("following", "post.user_id", "following.secondary_user_id")
      .leftJoin("likes", "post.id", "likes.post_id")
      .join("user as likesUser", "likes.user_id", "likesUser.id")
      .where(where)
      .orWhere(orWhere)
      .orWhere(orWhereTwo)
      .select(
        "post.message as postMessage",
        "post.user_id as postUserId",
        "post.id as postId",
        "post.date as postDate",
        "post.global as postGlobal",
        "post.image_url as postImageURL",
        "post.coin as postCoin",
        "post.start_date as postStartDate",
        "post.end_date as postEndDate",
        "user.first_name as postFirstName",
        "user.last_name as postLastName",
        "user.avatar_url as postAvatarUrl",
        "likes.id",
        "likes.user_id",
        "likes.type"
      )
      .distinct("likes.id")
      .then((likes) => {
        let hodlCounter = 0;
        let dumpCounter = 0;
        let userHasInteracted = false;
        let userLikeType = null;

        likes.forEach((like) => {
          if (like.user_id == decoded.id) {
            userHasInteracted = true;
            userLikeType = like.type;
          }

          if (like.type == "hodl") {
            hodlCounter++;
          } else if (like.type == "dump") {
            dumpCounter++;
          }
        });

        let data = {
          dumpCounter: dumpCounter,
          hodlCounter: hodlCounter,
          userHasInteracted: userHasInteracted,
          userLikeType: userLikeType,
        };
        res.status(201).send(data);
      });
  });
});

module.exports = router;
