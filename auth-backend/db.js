const { Pool } = require("pg");
require("dotenv").config({ path: "../.env" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database:'authdb',
//   password: 'postgres',
//   port:5432
// });

module.exports = pool;