// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const OrderGroup = require("../models/OrderGroup");
const User = require("../models/User");
const Item = require("../models/Item");
const OrderItem = require("../models/OrderItem");
const moment = require("moment");

// Middleware de autenticação
const authenticateToken = require("../middleWare/authMiddleware");
/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Endpoints para estatísticas do sistema
 */

// Rota para obter os usuários com mais lucro nos pedidos que fizeram dando uma resposta com nr de pedidos, lucro total e nome do usuário, ordenado por lucro total
/**
 * @swagger
 * /api/stats/profit-per-user:
 *   get:
 *     summary: Retorna o lucro total de cada usuário
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lucro total de cada usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: ID do usuário
 *                   totalProfit:
 *                     type: number
 *                     description: Lucro total do usuário
 *                   totalOrders:
 *                     type: integer
 *                     description: Número total de pedidos do usuário
 *                   username:
 *                     type: string
 *                     description: Nome do usuário
 *       500:
 *         description: Erro no servidor
 */
router.get("/profit-per-user", authenticateToken, async (req, res) => {
  try {
    const profitPerUser = await OrderGroup.findAll({
      attributes: [
        "userId",
        [
          sequelize.fn("sum", sequelize.col("OrderGroup.totalPrice")),
          "totalProfit",
        ],
        [sequelize.fn("count", sequelize.col("OrderGroup.id")), "totalOrders"],
      ],
      include: [
        {
          model: User,
          attributes: ["username"], // Atributo do nome do usuário
        },
      ],
      where: {
        userId: {
          [Op.not]: null, // Exclui registros com userId null
        },
      },
      group: ["userId", "User.username"],
      order: [[sequelize.literal("totalProfit"), "DESC"]],
    });

    const result = profitPerUser.map((profit) => ({
      userId: profit.userId,
      totalProfit: profit.getDataValue("totalProfit"),
      totalOrders: profit.getDataValue("totalOrders"),
      username: profit.User.username,
    }));

    res.json(result);
  } catch (error) {
    console.error("Erro ao obter lucro por usuário:", error);
    res.status(500).json({ message: error.message });
  }
});
// obter lucro total por usuario recebendo o user

/**
 * @swagger
 * /api/stats/profit:
 *   get:
 *     summary: Retorna o lucro no dia, na semana e no mês
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lucro no dia, na semana e no mês
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyProfit:
 *                   type: number
 *                   description: Lucro no dia
 *                 weeklyProfit:
 *                   type: number
 *                   description: Lucro na semana
 *                 monthlyProfit:
 *                   type: number
 *                   description: Lucro no mês
 *       500:
 *         description: Erro no servidor
 */
router.get("/profit", authenticateToken, async (req, res) => {
  try {
    const today = moment().startOf("day").toISOString();
    const startOfWeek = moment().startOf("week").toISOString();
    const startOfMonth = moment().startOf("month").toISOString();
    console.log(today);
    console.log(startOfWeek);
    console.log(startOfMonth);
    const dailyProfit = await OrderGroup.sum("totalPrice", {
      where: {
        //status: "pronto", // Supondo que "pronto" indica que o pedido foi finalizado
        updatedAt: {
          [Op.gte]: today,
        },
      },
    });

    const weeklyProfit = await OrderGroup.sum("totalPrice", {
      where: {
        //status: "pronto", // Supondo que "pronto" indica que o pedido foi finalizado
        updatedAt: {
          [Op.gte]: startOfWeek,
        },
      },
    });

    const monthlyProfit = await OrderGroup.sum("totalPrice", {
      where: {
        //status: "pronto", // Supondo que "pronto" indica que o pedido foi finalizado
        updatedAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });

    res.json({ dailyProfit, weeklyProfit, monthlyProfit });
  } catch (error) {
    console.error("Erro ao obter o lucro:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stats/total-orders-dmw:
 *   get:
 *     summary: Retorna o número total de pedidos do dia, semana e mês
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Número total de pedidos do dia, semana e mês
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailyOrders:
 *                   type: integer
 *                   description: Total de pedidos do dia
 *                 weeklyOrders:
 *                   type: integer
 *                   description: Total de pedidos da semana
 *                 monthlyOrders:
 *                   type: integer
 *                   description: Total de pedidos do mês
 *       500:
 *         description: Erro no servidor
 */
router.get("/total-orders-dmw", authenticateToken, async (req, res) => {
  try {
    const today = moment().startOf("day").toISOString();
    const startOfWeek = moment().startOf("week").toISOString();
    const startOfMonth = moment().startOf("month").toISOString();
    console.log(today);
    console.log(startOfWeek);
    console.log(startOfMonth);
    const dailyOrders = await OrderGroup.count({
      where: {
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    const weeklyOrders = await OrderGroup.count({
      where: {
        createdAt: {
          [Op.gte]: startOfWeek,
        },
      },
    });

    const monthlyOrders = await OrderGroup.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth,
        },
      },
    });
    res.json({ dailyOrders, weeklyOrders, monthlyOrders });
  } catch (error) {
    console.error("Erro ao obter o número total de pedidos:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stats/total-orders-per-user:
 *   get:
 *     summary: Retorna o número total de pedidos por usuário
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Número total de pedidos por usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: ID do usuário
 *                   totalOrders:
 *                     type: integer
 *                     description: Total de pedidos pelo usuário
 *       500:
 *         description: Erro no servidor
 */

router.get("/total-orders-per-user", authenticateToken, async (req, res) => {
  try {
    const ordersPerUser = await OrderGroup.findAll({
      attributes: [
        "userId",
        [sequelize.fn("count", sequelize.col("OrderGroup.id")), "totalOrders"],
      ],
      group: ["userId"],
      order: [[sequelize.literal("totalOrders"), "DESC"]],
    });
    res.json(ordersPerUser);
  } catch (error) {
    console.error("Erro ao obter o número total de pedidos por user:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stats/orders-per-item:
 *   get:
 *     summary: Retorna o número de pedidos que envolvem cada item
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Número de pedidos por item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemId:
 *                     type: integer
 *                     description: ID do item
 *                   itemName:
 *                     type: string
 *                     description: Nome do item
 *                   totalOrders:
 *                     type: integer
 *                     description: Total de pedidos que envolvem o item
 *       500:
 *         description: Erro no servidor
 */
router.get("/orders-per-item", authenticateToken, async (req, res) => {
  try {
    const ordersPerItem = await OrderItem.findAll({
      attributes: [
        "itemId",
        [sequelize.fn("count", sequelize.col("OrderItem.id")), "totalOrders"],
      ],
      include: [
        {
          model: Item,
          attributes: ["nome"],
        },
      ],
      group: ["itemId", "Item.nome"],
      order: [[sequelize.literal("totalOrders"), "DESC"]],
    });

    const result = ordersPerItem.map((order) => ({
      itemId: order.itemId,
      itemName: order.Item.nome,
      totalOrders: order.getDataValue("totalOrders"),
    }));

    res.json(result);
  } catch (error) {
    console.error("Erro ao obter pedidos por item:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
