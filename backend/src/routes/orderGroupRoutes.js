const express = require("express");
const router = express.Router();
const OrderGroup = require("../models/OrderGroup");
const OrderItem = require("../models/OrderItem");
const Item = require("../models/Item");
const Ingredientes = require("../models/Ingredientes");
const User = require("../models/User");
const authenticateToken = require("../middleWare/authMiddleware");

module.exports = (io) => {
  /**
   * @swagger
   * components:
   *   schemas:
   *     OrderGroup:
   *       type: object
   *       required:
   *         - items
   *       properties:
   *         id:
   *           type: integer
   *         status:
   *           type: string
   *           enum: [pendente, em_preparo, pronto]
   *         mesa:
   *           type: integer
   *         userId:
   *           type: integer
   *         totalPrice:
   *           type: number
   *         items:
   *           type: array
   *           items:
   *             type: object
   *             properties:
   *               nome:
   *                 type: string
   *               quantidade:
   *                 type: integer
   */

  /**
   * @swagger
   * /api/order-groups:
   *   post:
   *     summary: Cria um novo pedido
   *     tags: [OrderGroups]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [items]
   *             properties:
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     nome:
   *                       type: string
   *                     quantidade:
   *                       type: integer
   *               mesa:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Pedido criado com sucesso
   *       400:
   *         description: Erro na criação do pedido
   */
  router.post("/", authenticateToken, async (req, res) => {
    const { items, mesa } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "O pedido deve ter pelo menos um item." });
    }

    try {
      const itemNames = items.map((i) => i.nome);
      const existingItems = await Item.findAll({
        where: { nome: itemNames, disponivel: true },
      });

      const validNames = existingItems.map((i) => i.nome);
      const invalidNames = itemNames.filter((n) => !validNames.includes(n));
      if (invalidNames.length > 0) {
        return res.status(400).json({
          message: `Itens não disponíveis: ${invalidNames.join(", ")}`,
        });
      }

      let totalPrice = 0;
      for (const item of items) {
        const found = existingItems.find((i) => i.nome === item.nome);
        totalPrice += parseFloat(found.preco) * item.quantidade;
      }

      const orderGroup = await OrderGroup.create({
        status: "pendente",
        userId,
        totalPrice: totalPrice.toFixed(2),
        mesa: mesa || null,
      });

      for (const item of items) {
        const found = existingItems.find((i) => i.nome === item.nome);
        await OrderItem.create({
          nome: item.nome,
          quantidade: item.quantidade,
          orderGroupId: orderGroup.id,
          itemId: found.id,
        });
      }

      const orderGroupWithItems = await OrderGroup.findByPk(orderGroup.id, {
        include: [{ model: OrderItem, as: "items" }],
      });

      io.emit("orderGroupCreated", orderGroupWithItems);
      res.status(201).json(orderGroupWithItems);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/order-groups:
   *   get:
   *     summary: Lista todos os pedidos
   *     tags: [OrderGroups]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pendente, em_preparo, pronto]
   *         description: Filtrar por status
   *     responses:
   *       200:
   *         description: Lista de pedidos
   */
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const where = {};
      if (req.query.status) where.status = req.query.status;

      const orderGroups = await OrderGroup.findAll({
        where,
        include: [
          { model: OrderItem, as: "items" },
          { model: User, as: "user", attributes: ["id", "username"] },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.json(orderGroups);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/order-groups/{id}:
   *   patch:
   *     summary: Atualiza o status de um pedido
   *     tags: [OrderGroups]
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
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pendente, em_preparo, pronto]
   *     responses:
   *       200:
   *         description: Status atualizado com sucesso
   *       404:
   *         description: Pedido não encontrado
   */
  router.patch("/:id", authenticateToken, async (req, res) => {
    const { status } = req.body;

    const validStatuses = ["pendente", "em_preparo", "pronto"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    try {
      const orderGroup = await OrderGroup.findByPk(req.params.id, {
        include: [
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Item,
                include: [
                  {
                    model: Ingredientes,
                    through: { attributes: ["quantidade"] },
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!orderGroup) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      orderGroup.status = status;
      await orderGroup.save();

      // Descontar ingredientes apenas quando o pedido fica pronto
      if (status === "pronto") {
        for (const orderItem of orderGroup.items) {
          if (!orderItem.Item || !orderItem.Item.Ingredientes) continue;
          for (const ingrediente of orderItem.Item.Ingredientes) {
            const quantidadeNecessaria =
              ingrediente.ItemIngredient.quantidade * orderItem.quantidade;
            const ing = await Ingredientes.findByPk(ingrediente.id);
            if (ing) {
              ing.quantidade = Math.max(0, ing.quantidade - quantidadeNecessaria);
              await ing.save();
            }
          }
        }
      }

      io.emit("orderGroupUpdated", {
        id: orderGroup.id,
        status: orderGroup.status,
        mesa: orderGroup.mesa,
      });
      res.json({ message: "Status atualizado com sucesso", status: orderGroup.status });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/order-groups/{id}:
   *   delete:
   *     summary: Elimina um pedido
   *     tags: [OrderGroups]
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
   *         description: Pedido eliminado com sucesso
   *       404:
   *         description: Pedido não encontrado
   */
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const orderGroup = await OrderGroup.findByPk(req.params.id);
      if (!orderGroup) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      await OrderItem.destroy({ where: { orderGroupId: orderGroup.id } });
      await orderGroup.destroy();

      io.emit("orderGroupDeleted", { id: req.params.id });
      res.json({ message: "Pedido eliminado com sucesso" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  /**
   * @swagger
   * /api/order-groups/user/{id}:
   *   get:
   *     summary: Lista pedidos de um utilizador
   *     tags: [OrderGroups]
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
   *         description: Lista de pedidos do utilizador
   */
  router.get("/user/:id", authenticateToken, async (req, res) => {
    try {
      const orderGroups = await OrderGroup.findAll({
        where: { userId: req.params.id },
        include: [{ model: OrderItem, as: "items" }],
        order: [["createdAt", "DESC"]],
      });
      res.json(orderGroups);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
