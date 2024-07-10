const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderGroup = sequelize.define(
  "OrderGroup",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("pendente", "pronto"),
      allowNull: false,
      defaultValue: "pendente",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Nome da tabela referenciada
        key: "id",
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = OrderGroup;
