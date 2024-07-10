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
 *     summary: Retorna o lucro no dia e na semana
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lucro no dia e na semana
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
 *       500:
 *         description: Erro no servidor
 */
router.get("/profit", authenticateToken, async (req, res) => {
  try {
    const today = moment().startOf("day").toISOString();
    const startOfWeek = moment().startOf("week").toISOString();
    console.log(today);
    console.log(startOfWeek);
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

    res.json({ dailyProfit, weeklyProfit });
  } catch (error) {
    console.error("Erro ao obter o lucro:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
