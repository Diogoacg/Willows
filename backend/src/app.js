const express = require("express");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const pedidosRoutes = require("./routes/pedidos");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const sequelize = require("./config/database");
const Pedido = require("./models/Pedido");

// Sync Database
sequelize.sync({ force: false }).then(() => {
  console.log("Database & tables created!");
});

// Configuração Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API do Café",
      version: "1.0.0",
      description: "API para gerenciamento de pedidos de café",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api/pedidos", pedidosRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Swagger disponível em: http://localhost:${PORT}/api-docs`);
});
