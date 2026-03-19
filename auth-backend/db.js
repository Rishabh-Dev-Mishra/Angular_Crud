const {Pool} = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "authdb",
    password: 'postgres',
    port: 5432,
});

module.exports = pool;