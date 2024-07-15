const express = require("express");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const OrderGroupRoutes = require("./routes/orderGroupRoutes.js");
const inventoryRoutes = require("./routes/inventoryRoutes");
const statsRoutes = require("./routes/statsRoutes");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const socketIo = require("socket.io");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const server = require("http").createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8081", // Troque pelo endereço do seu frontend local
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Middleware para processar corpos de requisição JSON
app.use(express.json());

// Conexão com o banco de dados Sequelize
const sequelize = require("./config/database");
const User = require("./models/User");
const Item = require("./models/Item");
const OrderGroup = require("./models/OrderGroup");
const OrderItem = require("./models/OrderItem");

// Definição de associações entre modelos Sequelize
OrderGroup.hasMany(OrderItem, { as: "items", foreignKey: "orderGroupId" });
OrderItem.belongsTo(OrderGroup, {
  foreignKey: "orderGroupId",
  as: "orderGroup",
});
OrderGroup.belongsTo(User, { foreignKey: "userId", as: "user" });

// Sincronização do banco de dados (alter: true para alterar automaticamente o esquema)
sequelize
  .sync({ alter: true }) // Remover 'force: true'
  .then(async () => {
    console.log("Database & tables created!");
  })
  .catch((error) => {
    console.error("Error creating database tables:", error);
  });

// Configuração do Swagger
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
        url: `http://localhost:${process.env.PORT || 5000}`,
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
  apis: ["./src/routes/*.js"], // Caminho para os arquivos de definição das rotas
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para autenticar token JWT
const authenticateToken = require("./middleWare/authMiddleware");

// Roteamento das APIs
app.use("/api/order-groups", OrderGroupRoutes(io)); // Passando o Socket.IO para o router
app.use("/api/inventory", inventoryRoutes(io)); // Passando o Socket.IO para o router
app.use("/api/stats", statsRoutes(io)); // Passando o Socket.IO para o router

// Configuração do Socket.IO para ouvir eventos de conexão
io.on("connection", (socket) => {
  console.log("Novo cliente conectado");

  // Lidar com desconexões de clientes
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Iniciar o servidor na porta especificada
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
