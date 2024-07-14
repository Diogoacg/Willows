const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const authenticateToken = require("../middleWare/authMiddleware");

module.exports = (io) => {
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
  router.post("/", authenticateToken, async (req, res) => {
    try {
      const novoItem = await Item.create(req.body);

      // Emitir evento para atualização da lista de itens
      io.emit("atualizarItens", {
        message: "Novo item adicionado ao inventário",
        item: novoItem,
      });

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

        // Emitir evento para atualização da lista de itens
        io.emit("atualizarItens", {
          message: "Item atualizado no inventário",
          item: await Item.findByPk(req.params.id),
        });

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
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const item = await Item.findByPk(req.params.id);
      if (item) {
        await item.destroy();

        // Emitir evento para atualização da lista de itens
        io.emit("atualizarItens", {
          message: "Item removido do inventário",
          itemId: req.params.id,
        });

        res.json({ message: "Item deletado com sucesso" });
      } else {
        res.status(404).json({ message: "Item não encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
