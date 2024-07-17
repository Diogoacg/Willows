// models/Item.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define(
  "Item",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "nome",
    },
    preco: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    imageUri: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Item;