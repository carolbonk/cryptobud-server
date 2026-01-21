// Update with your config settings.
require('dotenv').config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const connections = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT || 24603,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    },
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL || process.env.DATABASE_URI,
    pool: {
      min: 1,
      max: 5
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

module.exports = connections;
