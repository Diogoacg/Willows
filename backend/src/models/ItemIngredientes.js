// models/ItemIngredient.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ItemIngredientes = sequelize.define(
  "ItemIngredient",
  {
    itemNome: {
      type: DataTypes.STRING,
      references: {
        model: "Items",
        key: "nome",
      },
    },
    ingredienteNome: {
      type: DataTypes.STRING,
      references: {
        model: "Ingredientes",
        key: "nome",
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

module.exports = ItemIngredientes
