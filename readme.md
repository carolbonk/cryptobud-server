# Cryptobud Server Application

This is the server application for the cryptobud social media. The goal was to create a robust and dynamic social media platform that meets user needs while offering a modern, user-friendly experience tailored to the cryptocurrency community, you can check more about the project here: https://www.carolbonk.com/Work/CryptoProject

## Architecture

This is a node.js application based on express. All of the server-side functionality is exposed through stateless REST APIs. Sessions are maintained using JWT tokens sent from the client with every request. 

The database is mysql and it uses Knex as an ORM. 

## Project Structure

The project has the following structure: 

* A migrations folder where knex migrations are stored (for generating the database)
* A routes folder for API requests. There are three files inside, one for charts, one for posts and one for users. All API requests that start with the "/posts" are routed to the post.js file - "/charts" maps to chart.js and "/users" to users.js. 
* An index.js file that sets up the routing and imports for all of the APIs
* Configurable settings are stored in a .env file
* A public folder that exposes resources inside with individual URLs. This is used for user avatars' and posts' images. In both cases the database only stores the URL of the image which links back to this folder. 

## Tech Stack

### SERVER SIDE

* NODE.JS
* EXPRESS
* KNEX
* MYSQL
* JWT TOKENS

## EXTERNAL APIs
* COINCAP
