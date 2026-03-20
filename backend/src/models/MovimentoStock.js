const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MovimentoStock = sequelize.define(
  "MovimentoStock",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ingredienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Ingredientes", key: "id" },
    },
    quantidade: {
      // positivo = entrou stock; negativo = saiu stock
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM("compra", "oferta", "quebra", "ajuste"),
      allowNull: false,
      // compra  = reposição de stock (ex: nova entrega de leite)
      // oferta  = consumo intencional não faturado (ex: rodada grátis)
      // quebra  = desperdício/derrame
      // ajuste  = correção após contagem física (diferença em relação ao sistema)
    },
    observacoes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = MovimentoStock;
