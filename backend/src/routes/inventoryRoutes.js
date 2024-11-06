const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Ingredientes = require("../models/Ingredientes");
const ItemIngredient = require("../models/ItemIngredientes");
const authenticateToken = require("../middleWare/authMiddleware");

module.exports = (io) => {
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
   *         ingredientes:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               id:
   *                 type: string
   *                 description: nome do ingrediente
   *               quantidade:
   *                 type: number
   *                 format: float
   *                 description: Quantidade do Ingrediente
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
   *               ingredientes:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     nome:
   *                       type: string
   *                     quantidade:
   *                       type: number
   *     responses:
   *       201:
   *         description: Item criado com sucesso
   *       400:
   *         description: Erro na criação do item
   */
  router.post("/", authenticateToken, async (req, res) => {
    const { nome, preco, ingredientes } = req.body;
  
    try {
      const novoItem = await Item.create({ nome, preco });
  
      if (ingredientes && ingredientes.length > 0) {
        for (const ingrediente of ingredientes) {
          const { nome, quantidade } = ingrediente;
          const ingredienteEncontrado = await Ingredientes.findOne({ where: { nome } });
  
          if (ingredienteEncontrado) {
            await ItemIngredient.create({
              itemId: novoItem.id,
              ingredienteId: ingredienteEncontrado.id,
              quantidade,
            });
          } else {
            //delete item if ingredient not found
            await novoItem.destroy();
            return res.status(400).json({ message: `Ingrediente ${nome} não encontrado` });
          }
        }
      }
  
      io.emit("itemCreated", novoItem);
      res.status(201).json(novoItem);
    } catch (error) {
      res.status(400).json({ message: error});
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
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Item'
   *       500:
   *         description: Erro no servidor
   */
  router.get("/", async (req, res) => {
    try {
      const itens = await Item.findAll({
        include: {
          model: Ingredientes,
          through: { attributes: ["quantidade"] },
        },
      });

      io.emit("getItems", itens);
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
   *               ingredientes:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     quantidade:
   *                       type: number
   *     responses:
   *       200:
   *         description: Item atualizado com sucesso
   *       404:
   *         description: Item não encontrado
   */
  router.put("/:id", authenticateToken, async (req, res) => {
    const { nome, preco, ingredientes } = req.body;

    try {
      const item = await Item.findByPk(req.params.id);
      if (item) {
        await item.update({ nome, preco });

        if (ingredientes && ingredientes.length > 0) {
          await ItemIngredient.destroy({ where: { itemId: item.id } });

          for (const ingrediente of ingredientes) {
            const { id, quantidade } = ingrediente;
            await ItemIngredient.create({
              itemId: item.id,
              ingredienteId: id,
              quantidade,
            });
          }
        }

        io.emit("itemUpdated", item);
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
        await ItemIngredient.destroy({ where: { itemId: item.id } });
        await item.destroy();

        io.emit("itemDeleted", item);
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
