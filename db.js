const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blackcore",
  password: "davina10",
  port: 5432,
});

module.exports = pool;