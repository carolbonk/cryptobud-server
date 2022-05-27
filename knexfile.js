// Update with your config settings.
require('dotenv').config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
 module.exports = {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASS
  },
  production: {
    client: 'mysql',
    connection: process.env.JAWSDB_URL,
  },
};


