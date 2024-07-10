// routes/orderGroupRoutes.js
const express = require("express");
const router = express.Router();
const OrderGroup = require("../models/OrderGroup");
const OrderItem = require("../models/OrderItem");
const Item = require("../models/Item");
const authenticateToken = require("../middleWare/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do Item
 *         nome:
 *           type: string
 *           description: Nome do Item
 *         quantidade:
 *           type: integer
 *           description: Quantidade do Item
 *
 *     OrderGroup:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do Grupo de Pedidos
 *         status:
 *           type: string
 *           enum: [pendente, em_preparo, pronto]
 *           description: Status do Grupo de Pedidos
 *         userId:
 *           type: integer
 *           description: ID do usuário que criou o grupo de pedidos
 *         totalPrice:
 *           type: number
 *           format: float
 *           description: Preço total do grupo de pedidos
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Item'
 */

/**
 * @swagger
 * /api/order-groups:
 *   post:
 *     summary: Cria um novo grupo de pedidos
 *     tags: [OrderGroups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderGroup'
 *           example:
 *             items:
 *               - nome: Item1
 *                 quantidade: 2
 *               - nome: Item2
 *                 quantidade: 1
 *     responses:
 *       201:
 *         description: Grupo de pedidos criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderGroup'
 *       400:
 *         description: Erro na criação do grupo de pedidos
 */

// Rota para criar um novo grupo de pedidos
router.post("/", authenticateToken, async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id; // Obtém o ID do usuário autenticado
  const status = "pendente"; // Definindo status como "pendente" por padrão

  try {
    // Verifica se todos os itens existem no inventário
    const itemNames = items.map((item) => item.nome);
    const existingItems = await Item.findAll({ where: { nome: itemNames } });
    const validNames = existingItems.map((item) => item.nome);
    const invalidNames = itemNames.filter((name) => !validNames.includes(name));

    if (invalidNames.length > 0) {
      return res.status(400).json({
        message: `Os seguintes itens não estão no inventário: ${invalidNames.join(
          ", "
        )}`,
      });
    }

    // Cálculo do preço total da ordem
    let totalPrice = 0;
    for (const item of items) {
      const foundItem = existingItems.find((i) => i.nome === item.nome);
      totalPrice += foundItem.preco * item.quantidade;
    }

    // Cria o grupo de pedidos com o totalPrice calculado
    const orderGroup = await OrderGroup.create({ status, userId, totalPrice });

    // Cria os itens do pedido e associa ao grupo
    for (const item of items) {
      await OrderItem.create({
        nome: item.nome,
        quantidade: item.quantidade,
        orderGroupId: orderGroup.id,
      });
    }

    // Atualiza o grupo de pedidos com os itens criados
    const orderGroupWithItems = await OrderGroup.findByPk(orderGroup.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    res.status(201).json(orderGroupWithItems);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/order-groups/{id}:
 *   delete:
 *     summary: Apaga um grupo de pedidos
 *     tags: [OrderGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de pedidos
 *     responses:
 *       200:
 *         description: Grupo de pedidos apagado com sucesso
 *       400:
 *         description: Erro ao apagar o grupo de pedidos
 *       404:
 *         description: Grupo de pedidos não encontrado
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const orderGroup = await OrderGroup.findByPk(id);

    if (!orderGroup) {
      return res
        .status(404)
        .json({ message: "Grupo de pedidos não encontrado" });
    }

    // Remover todos os itens associados ao grupo de pedidos
    await OrderItem.destroy({ where: { orderGroupId: orderGroup.id } });

    // Remover o grupo de pedidos
    await orderGroup.destroy();

    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/order-groups:
 *   get:
 *     summary: Retorna todos os grupos de pedidos
 *     tags: [OrderGroups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderGroup'
 *       500:
 *         description: Erro no servidor
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const orderGroups = await OrderGroup.findAll({
      include: [{ model: OrderItem, as: "items" }],
    });
    res.json(orderGroups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update status of order group
/**
 * @swagger
 * /api/order-groups/{id}:
 *   patch:
 *     summary: Atualiza o status de um grupo de pedidos
 *     tags: [OrderGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo de pedidos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, pronto]
 *                 description: Novo status do grupo de pedidos
 *     responses:
 *       200:
 *         description: Status do grupo de pedidos atualizado com sucesso
 *       400:
 *         description: Erro ao atualizar o status do grupo de pedidos
 *       404:
 *         description: Grupo de pedidos não encontrado
 */

router.patch("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const orderGroup = await OrderGroup.findByPk(id);

    if (!orderGroup) {
      return res
        .status(404)
        .json({ message: "Grupo de pedidos não encontrado" });
    }

    orderGroup.status = status;
    await orderGroup.save();

    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
