const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const Ingredientes = require("../models/Ingredientes");
const ItemIngredient = require("../models/ItemIngredientes");
const authenticateToken = require("../middleWare/authMiddleware");
const { requireAdmin } = require("../middleWare/authMiddleware");

module.exports = (io) => {
  /**
   * @swagger
   * /api/inventory:
   *   get:
   *     summary: Lista itens do menu
   *     tags: [Inventário]
   *     parameters:
   *       - in: query
   *         name: categoria
   *         schema:
   *           type: string
   *           enum: [bebidas_quentes, bebidas_frias, petiscos, bolos, outros]
   *       - in: query
   *         name: disponivel
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: Lista de itens
   */
  router.get("/", async (req, res) => {
    try {
      const where = {};
      if (req.query.categoria) where.categoria = req.query.categoria;
      if (req.query.disponivel !== undefined) {
        where.disponivel = req.query.disponivel === "true";
      }

      const itens = await Item.findAll({
        where,
        include: {
          model: Ingredientes,
          through: { attributes: ["quantidade"] },
        },
        order: [["categoria", "ASC"], ["nome", "ASC"]],
      });

      res.json(itens);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/inventory/{id}:
   *   get:
   *     summary: Retorna um item específico
   *     tags: [Inventário]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Item encontrado
   *       404:
   *         description: Item não encontrado
   */
  router.get("/:id", async (req, res) => {
    try {
      const item = await Item.findByPk(req.params.id, {
        include: { model: Ingredientes, through: { attributes: ["quantidade"] } },
      });
      if (!item) return res.status(404).json({ message: "Item não encontrado" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/inventory:
   *   post:
   *     summary: Cria um novo item no menu (requer admin)
   *     tags: [Inventário]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [nome, preco]
   *             properties:
   *               nome:
   *                 type: string
   *               preco:
   *                 type: number
   *               descricao:
   *                 type: string
   *               categoria:
   *                 type: string
   *                 enum: [bebidas_quentes, bebidas_frias, petiscos, bolos, outros]
   *               disponivel:
   *                 type: boolean
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
  router.post("/", authenticateToken, requireAdmin, async (req, res) => {
    const { nome, preco, descricao, categoria, disponivel, ingredientes } = req.body;

    try {
      const novoItem = await Item.create({ nome, preco, descricao, categoria, disponivel });

      if (ingredientes && ingredientes.length > 0) {
        for (const ing of ingredientes) {
          const ingEncontrado = await Ingredientes.findOne({ where: { nome: ing.nome } });
          if (!ingEncontrado) {
            await novoItem.destroy();
            return res.status(400).json({ message: `Ingrediente "${ing.nome}" não encontrado` });
          }
          await ItemIngredient.create({
            itemId: novoItem.id,
            ingredienteId: ingEncontrado.id,
            quantidade: ing.quantidade,
          });
        }
      }

      const itemComIngredientes = await Item.findByPk(novoItem.id, {
        include: { model: Ingredientes, through: { attributes: ["quantidade"] } },
      });

      io.emit("itemCreated", itemComIngredientes);
      res.status(201).json(itemComIngredientes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/inventory/{id}:
   *   put:
   *     summary: Atualiza um item do menu (requer admin)
   *     tags: [Inventário]
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
   *               preco:
   *                 type: number
   *               descricao:
   *                 type: string
   *               categoria:
   *                 type: string
   *               disponivel:
   *                 type: boolean
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
  router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { nome, preco, descricao, categoria, disponivel, ingredientes } = req.body;

    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Item não encontrado" });

      await item.update({ nome, preco, descricao, categoria, disponivel });

      if (ingredientes !== undefined) {
        await ItemIngredient.destroy({ where: { itemId: item.id } });
        for (const ing of ingredientes) {
          await ItemIngredient.create({
            itemId: item.id,
            ingredienteId: ing.id,
            quantidade: ing.quantidade,
          });
        }
      }

      const itemAtualizado = await Item.findByPk(item.id, {
        include: { model: Ingredientes, through: { attributes: ["quantidade"] } },
      });

      io.emit("itemUpdated", itemAtualizado);
      res.json(itemAtualizado);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/inventory/{id}:
   *   delete:
   *     summary: Elimina um item do menu (requer admin)
   *     tags: [Inventário]
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
   *         description: Item eliminado com sucesso
   *       404:
   *         description: Item não encontrado
   */
  router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const item = await Item.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Item não encontrado" });

      await ItemIngredient.destroy({ where: { itemId: item.id } });
      await item.destroy();

      io.emit("itemDeleted", { id: req.params.id });
      res.json({ message: "Item eliminado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
