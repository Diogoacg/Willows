const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ItemIngredient = sequelize.define(
  "ItemIngredient",
  {
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Items",
        key: "id",
      },
    },
    ingredienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Ingredientes",
        key: "id",
      },
    },
    quantidade: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = ItemIngredient;
