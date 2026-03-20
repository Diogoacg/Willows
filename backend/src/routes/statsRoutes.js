const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const OrderGroup = require("../models/OrderGroup");
const User = require("../models/User");
const Item = require("../models/Item");
const OrderItem = require("../models/OrderItem");
const ItemIngredient = require("../models/ItemIngredientes");
const MovimentoStock = require("../models/MovimentoStock");
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
        where: sequelize.literal("`quantidade` <= `quantidadeMinima` AND `quantidadeMinima` > 0"),
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

/**
 * @swagger
 * /api/stats/variancia-ingredientes:
 *   get:
 *     summary: Relatório de variância de consumo de ingredientes
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [dia, semana, mes]
 *         description: Período de análise (padrão semana)
 *     responses:
 *       200:
 *         description: Variância por ingrediente
 */
router.get("/variancia-ingredientes", authenticateToken, async (req, res) => {
  try {
    const Ingredientes = require("../models/Ingredientes");
    const periodo = req.query.periodo || "semana";
    const desde = startOf(periodo === "dia" ? "day" : periodo === "mes" ? "month" : "week");

    // Todos os ingredientes que têm pelo menos uma receita associada
    const ingredientesComReceita = await Ingredientes.findAll({
      include: [{ model: Item, through: { attributes: ["quantidade"] }, required: true }],
    });

    if (ingredientesComReceita.length === 0) {
      return res.json([]);
    }

    const ingIds = ingredientesComReceita.map((i) => i.id);

    // Pedidos prontos no período com items e receitas
    const pedidosProntos = await OrderGroup.findAll({
      where: { status: "pronto", updatedAt: { [Op.gte]: desde } },
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
                  where: { id: ingIds },
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });

    // Calcular consumo teórico por ingrediente
    const consumoTeorico = {}; // ingredienteId -> quantidade consumida
    for (const pedido of pedidosProntos) {
      for (const orderItem of pedido.items) {
        if (!orderItem.Item || !orderItem.Item.Ingredientes) continue;
        for (const ing of orderItem.Item.Ingredientes) {
          const recipeQty = ing.ItemIngredient.quantidade;
          const consumed = recipeQty * orderItem.quantidade;
          consumoTeorico[ing.id] = (consumoTeorico[ing.id] || 0) + consumed;
        }
      }
    }

    // Movimentos manuais no período por ingrediente
    const movimentos = await MovimentoStock.findAll({
      where: {
        ingredienteId: ingIds,
        createdAt: { [Op.gte]: desde },
        tipo: { [Op.in]: ["oferta", "quebra", "ajuste"] },
      },
    });

    // Agrupar movimentos por ingrediente e tipo
    const movimentosPorIng = {};
    for (const mov of movimentos) {
      if (!movimentosPorIng[mov.ingredienteId]) {
        movimentosPorIng[mov.ingredienteId] = { oferta: 0, quebra: 0, ajuste: 0 };
      }
      // quantidade já está com sinal correcto no modelo (negativo para consumos, positivo para compras)
      movimentosPorIng[mov.ingredienteId][mov.tipo] += Math.abs(mov.quantidade);
      if (mov.tipo === "ajuste") {
        // ajuste guarda a diferença; negativo = sistema tem mais do que o real (falta stock)
        movimentosPorIng[mov.ingredienteId]["ajusteRaw"] =
          (movimentosPorIng[mov.ingredienteId]["ajusteRaw"] || 0) + mov.quantidade;
      }
    }

    const resultado = ingredientesComReceita.map((ing) => {
      const teorico = consumoTeorico[ing.id] || 0;
      const movIng = movimentosPorIng[ing.id] || { oferta: 0, quebra: 0, ajuste: 0, ajusteRaw: 0 };
      const ofertas = movIng.oferta;
      const quebras = movIng.quebra;
      const ajusteRaw = movIng.ajusteRaw || 0; // negativo = falta não explicada

      // Consumo explicado = vendas + ofertas + quebras
      const consumoExplicado = teorico + ofertas + quebras;

      // Variância em unidades: ajusteRaw negativo significa que havia menos stock do que esperado
      // abs(ajusteRaw) / consumoExplicado se > 0
      const varianciaPct = consumoExplicado > 0 ? Math.abs(ajusteRaw) / consumoExplicado : 0;
      const tolerancia = ing.toleranciaVariancia;

      let status;
      if (ajusteRaw === 0 && teorico === 0) {
        status = "sem_dados";
      } else if (varianciaPct <= tolerancia) {
        status = "verde";
      } else if (varianciaPct <= tolerancia * 2) {
        status = "amarelo";
      } else {
        status = "vermelho";
      }

      return {
        id: ing.id,
        nome: ing.nome,
        unidade: ing.unidade,
        quantidade_atual: parseFloat(ing.quantidade.toFixed(3)),
        quantidadeMinima: ing.quantidadeMinima,
        toleranciaVariancia: ing.toleranciaVariancia,
        consumo_teorico: parseFloat(teorico.toFixed(3)),
        ofertas: parseFloat(ofertas.toFixed(3)),
        quebras: parseFloat(quebras.toFixed(3)),
        variancia_unidades: parseFloat(ajusteRaw.toFixed(3)),
        variancia_percentagem: parseFloat((varianciaPct * 100).toFixed(1)),
        status,
      };
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
