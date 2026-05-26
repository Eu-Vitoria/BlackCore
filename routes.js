const express = require("express");
const router = express.Router();
const db = require("./db");
const bcrypt = require("bcrypt");

router.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)",
      [nome, email, senhaHash]
    );

    res.json({ mensagem: "Usuário cadastrado!" });
  } catch (err) {
    console.error(err); // 👈 adiciona isso pra debug
    res.status(500).json({ erro: "Erro ao cadastrar" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    const user = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(400).json({ erro: "Senha inválida" });
    }

    res.json({ mensagem: "Login sucesso!" });

  } catch (err) {
    res.status(500).json({ erro: "Erro no login" });
  }
});

module.exports = router;