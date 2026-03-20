const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ingredientes = sequelize.define(
  "Ingredientes",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    quantidade: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unidade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantidadeMinima: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Ingredientes;
