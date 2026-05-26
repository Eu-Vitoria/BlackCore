const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query("SELECT 1")
  .then(() => console.log("Banco conectado ✅"))
  .catch(err => console.error("Erro banco ❌", err));

module.exports = pool;