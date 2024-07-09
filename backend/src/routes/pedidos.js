// ../routes/pedidos.js

const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");
const authenticateToken = require("../middleWare/authMiddleware");

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item
 *               - quantidade
 *             properties:
 *               item:
 *                 type: string
 *               quantidade:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       401:
 *         description: Acesso negado
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Obtém o ID do usuário do token JWT
    const novoPedido = await Pedido.create({
      ...req.body,
      userId: userId,
    });
    res.status(201).json(novoPedido);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Retorna todos os pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A lista de pedidos
 *       401:
 *         description: Acesso negado
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pedidos = await Pedido.findAll();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/pedidos/{id}:
 *   put:
 *     summary: Atualiza o status de um pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, em_preparo, pronto]
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (pedido) {
      await pedido.update(req.body);
      res.json(pedido);
    } else {
      res.status(404).json({ message: "Pedido não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/pedidos/stats:
 *   get:
 *     summary: Retorna estatísticas dos pedidos
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Estatísticas dos pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPedidos:
 *                   type: integer
 *                 totalItens:
 *                   type: integer
 */
router.get("/stats", async (req, res) => {
  try {
    const totalPedidos = await Pedido.count();
    const totalItens = await Pedido.sum("quantidade");
    res.json({ totalPedidos, totalItens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/pedidos/{id}:
 *   delete:
 *     summary: Deleta um pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido apagado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
router.delete("/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (pedido) {
      await pedido.destroy();
      res.json({ message: "Pedido apagado com sucesso" });
    } else {
      res.status(404).json({ message: "Pedido não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
