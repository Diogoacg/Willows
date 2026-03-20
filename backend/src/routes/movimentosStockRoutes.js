const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const MovimentoStock = require("../models/MovimentoStock");
const Ingredientes = require("../models/Ingredientes");
const authenticateToken = require("../middleWare/authMiddleware");

function startOf(period) {
  const now = new Date();
  if (period === "dia") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "semana") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  }
  if (period === "mes") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(0);
}

module.exports = (io) => {
  /**
   * @swagger
   * /api/movimentos-stock:
   *   post:
   *     summary: Regista um movimento de stock manual
   *     tags: [MovimentosStock]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [ingredienteId, quantidade, tipo]
   *             properties:
   *               ingredienteId:
   *                 type: integer
   *               quantidade:
   *                 type: number
   *                 description: Quantidade absoluta (sempre positiva; o tipo determina o sentido)
   *               tipo:
   *                 type: string
   *                 enum: [compra, oferta, quebra, ajuste]
   *               observacoes:
   *                 type: string
   *     responses:
   *       201:
   *         description: Movimento registado
   *       400:
   *         description: Erro na validação
   *       404:
   *         description: Ingrediente não encontrado
   */
  router.post("/", authenticateToken, async (req, res) => {
    const { ingredienteId, quantidade, tipo, observacoes } = req.body;
    const userId = req.user.id;

    if (!ingredienteId || quantidade === undefined || !tipo) {
      return res.status(400).json({ message: "ingredienteId, quantidade e tipo são obrigatórios." });
    }
    if (quantidade <= 0) {
      return res.status(400).json({ message: "quantidade deve ser positiva." });
    }

    const tiposValidos = ["compra", "oferta", "quebra", "ajuste"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ message: "Tipo inválido." });
    }

    try {
      const ingrediente = await Ingredientes.findByPk(ingredienteId);
      if (!ingrediente) return res.status(404).json({ message: "Ingrediente não encontrado." });

      let quantidadeMovimento;
      let novaQuantidade;

      if (tipo === "compra") {
        // Reposição: adiciona ao stock
        quantidadeMovimento = quantidade;
        novaQuantidade = ingrediente.quantidade + quantidade;
      } else if (tipo === "ajuste") {
        // Correção física: `quantidade` é o novo valor real contado
        // Guarda a diferença como o movimento (pode ser negativa se há menos do que esperado)
        quantidadeMovimento = quantidade - ingrediente.quantidade;
        novaQuantidade = quantidade;
      } else {
        // oferta ou quebra: consome stock
        quantidadeMovimento = -quantidade;
        novaQuantidade = Math.max(0, ingrediente.quantidade - quantidade);
      }

      ingrediente.quantidade = novaQuantidade;
      await ingrediente.save();

      const movimento = await MovimentoStock.create({
        ingredienteId,
        quantidade: quantidadeMovimento,
        tipo,
        observacoes: observacoes || null,
        userId,
      });

      io.emit("movimentoStockCreated", { movimento, ingrediente });
      res.status(201).json({ movimento, ingrediente });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/movimentos-stock:
   *   get:
   *     summary: Lista movimentos de stock
   *     tags: [MovimentosStock]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: ingredienteId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: periodo
   *         schema:
   *           type: string
   *           enum: [dia, semana, mes]
   *       - in: query
   *         name: tipo
   *         schema:
   *           type: string
   *           enum: [compra, oferta, quebra, ajuste]
   *     responses:
   *       200:
   *         description: Lista de movimentos
   */
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const where = {};
      if (req.query.ingredienteId) where.ingredienteId = parseInt(req.query.ingredienteId);
      if (req.query.tipo) where.tipo = req.query.tipo;
      if (req.query.periodo) {
        where.createdAt = { [Op.gte]: startOf(req.query.periodo) };
      }

      const movimentos = await MovimentoStock.findAll({
        where,
        include: [{ model: Ingredientes, attributes: ["nome", "unidade"] }],
        order: [["createdAt", "DESC"]],
      });

      res.json(movimentos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
