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
    type: DataTypes.ENUM("pendente", "em_preparo", "pronto"),
    defaultValue: "pendente",
  },
});

module.exports = Pedido;
