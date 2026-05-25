require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


// TESTAR CONEXÃO
pool.connect()
  .then(() => console.log("Banco conectado"))
  .catch(err => console.log(err));


// CRIAR TABELA
async function criarTabela() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      usuario VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      senha TEXT
    )
  `);
}

criarTabela();


// CADASTRO
app.post("/cadastro", async (req, res) => {
  try {
    const { usuario, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.query(
      "INSERT INTO usuarios (usuario, email, senha) VALUES ($1, $2, $3)",
      [usuario, email, senhaHash]
    );

    res.json({
      mensagem: "Usuário cadastrado com sucesso"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      erro: "Erro ao cadastrar"
    });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {

    const { email, senha } = req.body;

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        erro: "Usuário não encontrado"
      });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return res.status(400).json({
        erro: "Senha incorreta"
      });
    }

    res.json({
      mensagem: "Login realizado"
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      erro: "Erro no login"
    });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});