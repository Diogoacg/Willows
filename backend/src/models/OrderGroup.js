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
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = OrderGroup;
