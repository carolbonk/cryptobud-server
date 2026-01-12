const express = require("express");
const router = express.Router();
const fs = require("fs");
const crypto = require("crypto");
const axios = require("axios");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const knexConfig = require("../knexfile");
const environment = process.env.NODE_ENV || "development";
const dbConfig = knexConfig[environment];
console.log("Knex config:", JSON.stringify(dbConfig, null, 2));
const knex = require("knex")(dbConfig);

router.get("/coins", (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).send("Please login");
    }

    const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, _decoded) => {

    if (err) {
        console.log(err);
        return res.status(401).send("Invalid auth token");
      }

    var config = {
        method: 'get',
        url: 'http://api.coincap.io/v2/assets',
        headers: { }
      };
      
      axios(config)
      .then(function (response) {
          let coins = response.data.data.map(coin => {
              let newCoin = 
              {
                  id: coin.id,
                  name: coin.name
              }  
              return newCoin;
          }
          );

          
        res.status(201).send(coins); 
       
      })
      .catch(function (error) {
        console.log(error);
        res.status(400).send("Failed retrieve");
      });

  });
})

router.get("/:coinId/history", (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).send("Please login");
    }

    const authToken = req.headers.authorization.split(" ")[1];
  jwt.verify(authToken, process.env.JWT_KEY, (err, _decoded) => {
    const { coinId } = req.params;
    if (err) {
        console.log(err);
        return res.status(401).send("Invalid auth token");
      }

    var config = {
        method: 'get',
        url: 'http://api.coincap.io/v2/assets/' + coinId + '/history?interval=' + req.query.interval + '&start=' +  req.query.start + '&end=' +  req.query.end,
        headers: { }
      };
      
      axios(config)
      .then(function (response) {
          let values = response.data.data;
          res.status(201).send(values); 
          }
          )
      .catch(function (error) {
        console.log(error);
        res.status(400).send("Failed retrieve");
      });

  });
})

module.exports = router;