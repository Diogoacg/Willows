// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const authenticateToken = require("../middleWare/authMiddleware");
const authorizeAdmin = require("../middleWare/authorizeAdmin");

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - nome
 *         - preco
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do Item
 *         nome:
 *           type: string
 *           description: Nome do Item
 *         preco:
 *           type: number
 *           format: float
 *           description: Preço do Item
 */

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Adiciona um novo item ao inventário
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Erro na criação do item
 */
router.post("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const novoItem = await Item.create(req.body);
    res.status(201).json(novoItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Retorna todos os itens do inventário
 *     tags: [Inventário]
 *     responses:
 *       200:
 *         description: Lista de itens
 *       500:
 *         description: Erro no servidor
 */
router.get("/", async (req, res) => {
  try {
    const itens = await Item.findAll();
    res.json(itens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Atualiza um item do inventário
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (item) {
      await item.update(req.body);
      res.json(item);
    } else {
      res.status(404).json({ message: "Item não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Deleta um item do inventário
 *     tags: [Inventário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do item
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deletado com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.delete("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (item) {
      await item.destroy();
      res.json({ message: "Item deletado com sucesso" });
    } else {
      res.status(404).json({ message: "Item não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
