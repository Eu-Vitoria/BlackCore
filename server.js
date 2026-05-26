app.post("/cadastro", async (req, res) => {
  try {
    const { usuario, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.query(
      "INSERT INTO usuarios (usuario, email, senha) VALUES ($1, $2, $3)",
      [usuario, email, senhaHash]
    );

    res.json({ mensagem: "Usuário cadastrado com sucesso" });

  } catch (err) {
    console.log(err);

    if (err.code === "23505") {
      return res.status(400).json({
        erro: "Email já cadastrado"
      });
    }

    res.status(500).json({
      erro: "Erro ao cadastrar"
    });
  }
});