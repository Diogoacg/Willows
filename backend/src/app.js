const express = require("express");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const OrderGroupRoutes = require("./routes/orderGroupRoutes.js");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const statsRoutes = require("./routes/statsRoutes");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const sequelize = require("./config/database");
const User = require("./models/User");
const Item = require("./models/Item");
const OrderGroup = require("./models/OrderGroup");
const OrderItem = require("./models/OrderItem");

// Definir associações
OrderGroup.hasMany(OrderItem, { as: "items", foreignKey: "orderGroupId" });
OrderItem.belongsTo(OrderGroup, {
  foreignKey: "orderGroupId",
  as: "orderGroup",
});
OrderGroup.belongsTo(User, { foreignKey: "userId", as: "user" });

// Sincronizar o banco de dados
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((error) => {
    console.error("Error creating database tables:", error);
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotas
app.use("/api/order-groups", OrderGroupRoutes);
app.use("/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Swagger disponível em: http://localhost:${PORT}/api-docs`);
});
