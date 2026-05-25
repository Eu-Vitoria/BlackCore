import { Client } from "pg";

console.log(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  const { usuario, email, senha } = req.body;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    await client.query(
      "INSERT INTO usuarios (usuario, email, senha) VALUES ($1, $2, $3)",
      [usuario, email, senha]
    );

    await client.end();

    return res.status(200).json({ mensagem: "Usuário cadastrado!" });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}