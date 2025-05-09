// models/OrderGroup.js
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
      allowNull: true,
      references: {
        model: "Users",
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
