//models/ingredientes.js
// itens que podem ser quantificados e contam para o inventario

const { Sequelize, DataTypes } = require("sequelize");
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
        unique: "nome",
        },
        quantidade: {
        type: DataTypes.FLOAT,
        allowNull: false,
        },
        unidade: {
        type: DataTypes.STRING,
        allowNull: false,
        },
    },
    {
        timestamps: false,
    }
    );

    

module.exports = Ingredientes;