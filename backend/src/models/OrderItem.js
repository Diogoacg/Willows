const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderGroupId: {
    type: DataTypes.INTEGER,
    references: {
      model: "OrderGroups", // Nome da tabela referenciada
      key: "id",
    },
    allowNull: false,
  },
});

module.exports = OrderItem;
