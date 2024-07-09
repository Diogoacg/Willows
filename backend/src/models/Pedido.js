const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pedido = sequelize.define("Pedido", {
  item: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pendente", "em_preparo", "pronto", "entregue"),
    defaultValue: "pendente",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Pedido;
