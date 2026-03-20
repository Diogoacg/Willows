const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const OrderGroup = require("../models/OrderGroup");
const User = require("../models/User");
const Item = require("../models/Item");
const OrderItem = require("../models/OrderItem");
const authenticateToken = require("../middleWare/authMiddleware");

function startOf(period) {
  const now = new Date();
  if (period === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return new Date(0);
}

/**
 * @swagger
 * /api/stats/profit:
 *   get:
 *     summary: Lucro do dia, semana e mês (apenas pedidos prontos)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lucro por período
 */
router.get("/profit", authenticateToken, async (req, res) => {
  try {
    const baseWhere = { status: "pronto" };

    const [dailyProfit, weeklyProfit, monthlyProfit] = await Promise.all([
      OrderGroup.sum("totalPrice", {
        where: { ...baseWhere, updatedAt: { [Op.gte]: startOf("day") } },
      }),
      OrderGroup.sum("totalPrice", {
        where: { ...baseWhere, updatedAt: { [Op.gte]: startOf("week") } },
      }),
      OrderGroup.sum("totalPrice", {
        where: { ...baseWhere, updatedAt: { [Op.gte]: startOf("month") } },
      }),
    ]);

    res.json({
      dailyProfit: dailyProfit || 0,
      weeklyProfit: weeklyProfit || 0,
      monthlyProfit: monthlyProfit || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stats/profit-per-user:
 *   get:
 *     summary: Lucro total por funcionário (apenas pedidos prontos)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lucro por utilizador
 */
router.get("/profit-per-user", authenticateToken, async (req, res) => {
  try {
    const profitPerUser = await OrderGroup.findAll({
      attributes: [
        "userId",
        [sequelize.fn("sum", sequelize.col("OrderGroup.totalPrice")), "totalProfit"],
        [sequelize.fn("count", sequelize.col("OrderGroup.id")), "totalOrders"],
      ],
      include: [{ model: User, attributes: ["username"] }],
      where: {
        userId: { [Op.not]: null },
        status: "pronto",
      },
      group: ["userId", "User.username"],
      order: [[sequelize.literal("totalProfit"), "DESC"]],
    });

    const result = profitPerUser.map((p) => ({
      userId: p.userId,
      totalProfit: parseFloat(p.getDataValue("totalProfit") || 0).toFixed(2),
      totalOrders: parseInt(p.getDataValue("totalOrders") || 0),
      username: p.User.username,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stats/total-orders-dmw:
 *   get:
 *     summary: Total de pedidos do dia, semana e mês
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contagem de pedidos por período
 */
router.get("/total-orders-dmw", authenticateToken, async (req, res) => {
  try {
    const [dailyOrders, weeklyOrders, monthlyOrders] = await Promise.all([
      OrderGroup.count({ where: { createdAt: { [Op.gte]: startOf("day") } } }),
      OrderGroup.count({ where: { createdAt: { [Op.gte]: startOf("week") } } }),
      OrderGroup.count({ where: { createdAt: { [Op.gte]: startOf("month") } } }),
    ]);

    res.json({ dailyOrders, weeklyOrders, monthlyOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stats/orders-per-item:
 *   get:
 *     summary: Número de pedidos por item (popularidade)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Popularidade dos itens
 */
router.get("/orders-per-item", authenticateToken, async (req, res) => {
  try {
    const ordersPerItem = await OrderItem.findAll({
      attributes: [
        "itemId",
        [sequelize.fn("sum", sequelize.col("quantidade")), "totalVendido"],
        [sequelize.fn("count", sequelize.col("OrderItem.id")), "totalPedidos"],
      ],
      include: [{ model: Item, attributes: ["nome", "categoria"] }],
      group: ["itemId", "Item.nome", "Item.categoria"],
      order: [[sequelize.literal("totalVendido"), "DESC"]],
    });

    const result = ordersPerItem.map((o) => ({
      itemId: o.itemId,
      itemName: o.Item.nome,
      categoria: o.Item.categoria,
      totalVendido: parseInt(o.getDataValue("totalVendido") || 0),
      totalPedidos: parseInt(o.getDataValue("totalPedidos") || 0),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stats/resumo:
 *   get:
 *     summary: Resumo geral do café (pedidos ativos, lucro do dia, stock baixo)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumo operacional
 */
router.get("/resumo", authenticateToken, async (req, res) => {
  try {
    const Ingredientes = require("../models/Ingredientes");

    const [pedidosPendentes, pedidosEmPreparo, lucroHoje, stockBaixo] = await Promise.all([
      OrderGroup.count({ where: { status: "pendente" } }),
      OrderGroup.count({ where: { status: "em_preparo" } }),
      OrderGroup.sum("totalPrice", {
        where: { status: "pronto", updatedAt: { [Op.gte]: startOf("day") } },
      }),
      Ingredientes.count({
        where: sequelize.where(
          sequelize.col("quantidade"),
          { [Op.lte]: sequelize.col("quantidadeMinima") }
        ),
      }),
    ]);

    res.json({
      pedidosPendentes,
      pedidosEmPreparo,
      lucroHoje: parseFloat(lucroHoje || 0).toFixed(2),
      alertasStock: stockBaixo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
