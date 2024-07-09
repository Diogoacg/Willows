const express = require("express");
const router = express.Router();
const Pedido = require("../models/Pedido");

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
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
 */
router.post("/", async (req, res) => {
  try {
    const novoPedido = await Pedido.create(req.body);
    res.status(201).json(novoPedido);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   item:
 *                     type: string
 *                   quantidade:
 *                     type: integer
 *                   status:
 *                     type: string
 */
router.get("/", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

// obter o numero de pedidos ja feitos

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
module.exports = router;
