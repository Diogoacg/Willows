const express = require("express");
const router = express.Router();
const Ingredientes = require("../models/Ingredientes");
const authenticateToken = require("../middleWare/authMiddleware");

module.exports = (io) => {
  /**
   * @swagger
   * components:
   *   schemas:
   *     Ingrediente:
   *       type: object
   *       required:
   *         - nome
   *         - quantidade
   *         - unidade
   *       properties:
   *         id:
   *           type: integer
   *           description: ID do Ingrediente
   *         nome:
   *           type: string
   *           description: Nome do Ingrediente
   *         quantidade:
   *           type: number
   *           format: float
   *           description: Quantidade do Ingrediente
   *         unidade:
   *           type: string
   *           description: Unidade de medida do Ingrediente
   */

  /**
   * @swagger
   * /api/ingredientes:
   *   post:
   *     summary: Adiciona um novo ingrediente ao inventário
   *     tags: [Ingredientes]
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
   *               - quantidade
   *               - unidade
   *             properties:
   *               nome:
   *                 type: string
   *               quantidade:
   *                 type: number
   *               unidade:
   *                 type: string
   *     responses:
   *       201:
   *         description: Ingrediente criado com sucesso
   *       400:
   *         description: Erro na criação do ingrediente
   */
  router.post("/", authenticateToken, async (req, res) => {
    const { nome, quantidade, unidade } = req.body;

    try {
      const novoIngrediente = await Ingredientes.create({ nome, quantidade, unidade });
      io.emit("ingredienteCreated", novoIngrediente);
      res.status(201).json(novoIngrediente);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/ingredientes:
   *   get:
   *     summary: Retorna todos os ingredientes do inventário
   *     tags: [Ingredientes]
   *     responses:
   *       200:
   *         description: Lista de ingredientes
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Ingrediente'
   *       500:
   *         description: Erro no servidor
   */
  router.get("/", async (req, res) => {
    try {
      const ingredientes = await Ingredientes.findAll();
      io.emit("getIngredientes", ingredientes);
      res.json(ingredientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/ingredientes/{id}:
   *   put:
   *     summary: Atualiza um ingrediente do inventário
   *     tags: [Ingredientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do ingrediente
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
   *     responses:
   *       200:
   *         description: Ingrediente atualizado com sucesso
   *       404:
   *         description: Ingrediente não encontrado
   */
  router.put("/:id", authenticateToken, async (req, res) => {
    const { nome, quantidade, unidade } = req.body;

    try {
      const ingrediente = await Ingredientes.findByPk(req.params.id);
      if (ingrediente) {
        await ingrediente.update({ nome, quantidade, unidade });
        io.emit("ingredienteUpdated", ingrediente);
        res.json(ingrediente);
      } else {
        res.status(404).json({ message: "Ingrediente não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/ingredientes/{id}:
   *   delete:
   *     summary: Deleta um ingrediente do inventário
   *     tags: [Ingredientes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID do ingrediente
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Ingrediente deletado com sucesso
   *       404:
   *         description: Ingrediente não encontrado
   */
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const ingrediente = await Ingredientes.findByPk(req.params.id);
      if (ingrediente) {
        await ingrediente.destroy();
        io.emit("ingredienteDeleted", ingrediente);
        res.json({ message: "Ingrediente deletado com sucesso" });
      } else {
        res.status(404).json({ message: "Ingrediente não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
