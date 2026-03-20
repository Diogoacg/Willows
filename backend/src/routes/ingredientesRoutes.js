const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Ingredientes = require("../models/Ingredientes");
const authenticateToken = require("../middleWare/authMiddleware");
const { requireAdmin } = require("../middleWare/authMiddleware");

module.exports = (io) => {
  /**
   * @swagger
   * /api/ingredientes:
   *   get:
   *     summary: Lista todos os ingredientes
   *     tags: [Ingredientes]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de ingredientes
   */
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const ingredientes = await Ingredientes.findAll({ order: [["nome", "ASC"]] });
      res.json(ingredientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/ingredientes/stock-baixo:
   *   get:
   *     summary: Lista ingredientes com stock abaixo do mínimo
   *     tags: [Ingredientes]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Ingredientes com stock baixo
   */
  router.get("/stock-baixo", authenticateToken, async (req, res) => {
    try {
      const ingredientes = await Ingredientes.findAll({
        where: sequelize.literal("`quantidade` <= `quantidadeMinima` AND `quantidadeMinima` > 0"),
      });
      res.json(ingredientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/ingredientes:
   *   post:
   *     summary: Cria um novo ingrediente (requer admin)
   *     tags: [Ingredientes]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [nome, quantidade, unidade]
   *             properties:
   *               nome:
   *                 type: string
   *               quantidade:
   *                 type: number
   *               unidade:
   *                 type: string
   *               quantidadeMinima:
   *                 type: number
   *     responses:
   *       201:
   *         description: Ingrediente criado com sucesso
   */
  router.post("/", authenticateToken, requireAdmin, async (req, res) => {
    const { nome, quantidade, unidade, quantidadeMinima } = req.body;
    try {
      const novoIngrediente = await Ingredientes.create({
        nome,
        quantidade,
        unidade,
        quantidadeMinima: quantidadeMinima || 0,
      });
      io.emit("ingredienteCreated", novoIngrediente);
      res.status(201).json(novoIngrediente);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/ingredientes/{id}:
   *   put:
   *     summary: Atualiza um ingrediente (requer admin)
   *     tags: [Ingredientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
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
   *               quantidade:
   *                 type: number
   *               unidade:
   *                 type: string
   *               quantidadeMinima:
   *                 type: number
   *     responses:
   *       200:
   *         description: Ingrediente atualizado com sucesso
   *       404:
   *         description: Ingrediente não encontrado
   */
  router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { nome, quantidade, unidade, quantidadeMinima } = req.body;
    try {
      const ingrediente = await Ingredientes.findByPk(req.params.id);
      if (!ingrediente) return res.status(404).json({ message: "Ingrediente não encontrado" });

      await ingrediente.update({ nome, quantidade, unidade, quantidadeMinima });
      io.emit("ingredienteUpdated", ingrediente);
      res.json(ingrediente);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/ingredientes/{id}:
   *   delete:
   *     summary: Elimina um ingrediente (requer admin)
   *     tags: [Ingredientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Ingrediente eliminado com sucesso
   *       404:
   *         description: Ingrediente não encontrado
   */
  router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const ingrediente = await Ingredientes.findByPk(req.params.id);
      if (!ingrediente) return res.status(404).json({ message: "Ingrediente não encontrado" });

      await ingrediente.destroy();
      io.emit("ingredienteDeleted", { id: req.params.id });
      res.json({ message: "Ingrediente eliminado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
