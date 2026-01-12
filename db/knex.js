const knexConfig = require('../knexfile');
const environment = process.env.NODE_ENV || 'development';
const dbConfig = knexConfig[environment];

module.exports = require('knex')(dbConfig);
