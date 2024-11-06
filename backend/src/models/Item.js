// models/Item.js
// itens individuais que nao contam para o inventario
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
    ingredientes: {
      type: DataTypes.STRING,
      allowNull: true,
    },


    
  },
  {
    timestamps: false,
  }
);


module.exports = Item;