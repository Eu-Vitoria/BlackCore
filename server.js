import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// CADASTRO
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1,$2,$3) RETURNING *",
      [nome, email, senhaHash]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Erro ao cadastrar");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const result = await pool.query(
    "SELECT * FROM usuarios WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.json({ sucesso: false });
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(senha, user.senha);

  if (!match) {
    return res.json({ sucesso: false });
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ sucesso: true, token });
});

// PERFIL (painel)
app.get("/perfil", async (req, res) => {
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await pool.query(
      "SELECT id, nome, email FROM usuarios WHERE id=$1",
      [decoded.id]
    );

    res.json(user.rows[0]);
  } catch {
    res.sendStatus(401);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Rodando na porta " + PORT);
});