const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        message: "Acesso negado. Token não fornecido ou formato inválido.",
      });
  }

  const token = authHeader.split(" ")[1]; // Remove "Bearer " prefix
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      console.error("Erro ao tentar verificar o token:", err);
      return res.status(403).json({ message: "Token inválido." });
    }

    req.user = decodedToken;
    next();
  });
};

module.exports = authenticateToken;
