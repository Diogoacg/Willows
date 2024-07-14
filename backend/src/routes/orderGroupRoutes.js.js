const express = require("express");
const router = express.Router();
const OrderGroup = require("../models/OrderGroup");
const OrderItem = require("../models/OrderItem");
const Item = require("../models/Item");
const authenticateToken = require("../middleWare/authMiddleware");

module.exports = (io) => {
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
      const invalidNames = itemNames.filter(
        (name) => !validNames.includes(name)
      );

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
      const orderGroup = await OrderGroup.create({
        status,
        userId,
        totalPrice,
      });

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

      // Emitir evento para todos os clientes
      io.emit("novoPedidoCriado", orderGroupWithItems);

      res.status(201).json(orderGroupWithItems);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rota para atualizar o status de um grupo de pedidos
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

      // Emitir evento para todos os clientes
      io.emit("statusPedidoAtualizado", id, status);

      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // Rota para listar todos os grupos de pedidos
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

  // Rota para deletar um grupo de pedidos
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

      // Emitir evento para todos os clientes
      io.emit("pedidoRemovido", id);

      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  return router;
};
