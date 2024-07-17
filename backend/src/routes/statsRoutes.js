// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const moment = require("moment");
const sequelize = require("../config/database"); // Caminho para sua configuração do banco de dados

const OrderGroup = require("../models/OrderGroup");
const User = require("../models/User");

// Middleware de autenticação
const authenticateToken = require("../middleWare/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Endpoints para estatísticas do sistema
 */

/**
 * @swagger
 * /api/stats/top-users:
 *   get:
 *     summary: Retorna os usuários com mais pedidos feitos
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários com mais pedidos
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
 *                     description: Total de pedidos feitos pelo usuário
 *       500:
 *         description: Erro no servidor
 */
router.get("/top-users", async (req, res) => {
  try {
    // Consulta para obter os usuários com mais pedidos
    const topUsers = await OrderGroup.findAll({
      attributes: [
        "userId",
        [sequelize.fn("count", sequelize.col("OrderGroup.id")), "totalOrders"],
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: [],
        },
      ],
      group: ["userId"],
      order: [[sequelize.literal("totalOrders"), "DESC"]],
      limit: 10, // Por exemplo, os top 10 usuários com mais pedidos
    });

    res.json(topUsers);
  } catch (error) {
    console.error("Erro ao obter os top users:", error);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

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
  }catch (error) {
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
  try{
    const ordersPerUser = await OrderGroup.findAll({
      attributes: [
        "userId",
        [sequelize.fn("count", sequelize.col("OrderGroup.id")), "totalOrders"],
      ],
      group: ["userId"],
      order: [[sequelize.literal("totalOrders"), "DESC"]],
    });
    res.json(ordersPerUser);
  }catch (error) {
    console.error("Erro ao obter o número total de pedidos por user:", error);
    res.status(500).json({ message: error.message });
    }
});

module.exports = router;