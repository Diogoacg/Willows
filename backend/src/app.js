const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// Modelos
const sequelize = require("./config/database");
const User = require("./models/User");
const Item = require("./models/Item");
const OrderGroup = require("./models/OrderGroup");
const OrderItem = require("./models/OrderItem");
const Ingredientes = require("./models/Ingredientes");
const ItemIngredient = require("./models/ItemIngredientes");
const MovimentoStock = require("./models/MovimentoStock");

// Associações
OrderGroup.hasMany(OrderItem, { as: "items", foreignKey: "orderGroupId" });
OrderItem.belongsTo(OrderGroup, { foreignKey: "orderGroupId", as: "orderGroup" });
OrderGroup.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(OrderGroup, { foreignKey: "userId" });
Item.hasMany(OrderItem, { foreignKey: "itemId" });
OrderItem.belongsTo(Item, { foreignKey: "itemId" });
Item.belongsToMany(Ingredientes, { through: ItemIngredient, foreignKey: "itemId" });
Ingredientes.belongsToMany(Item, { through: ItemIngredient, foreignKey: "ingredienteId" });
MovimentoStock.belongsTo(Ingredientes, { foreignKey: "ingredienteId" });
Ingredientes.hasMany(MovimentoStock, { foreignKey: "ingredienteId" });
MovimentoStock.belongsTo(User, { foreignKey: "userId" });

async function createInitialUser() {
  try {
    const existing = await User.findOne({ where: { username: "admin" } });
    if (existing) return;

    await User.create({
      username: "admin",
      email: "admin@willows.cafe",
      password: "admin123",
      role: "admin",
    });
    console.log("Utilizador admin inicial criado. Altere a senha em produção!");
  } catch (error) {
    console.error("Erro ao criar utilizador inicial:", error);
  }
}

// Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Willows Café API",
      version: "2.0.0",
      description: "API para gestão do Willows Café",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 5000}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rotas
const OrderGroupRoutes = require("./routes/orderGroupRoutes")(io);
const authRoutes = require("./routes/authRoutes")(io);
const inventoryRoutes = require("./routes/inventoryRoutes")(io);
const ingredientesRoutes = require("./routes/ingredientesRoutes")(io);
const statsRoutes = require("./routes/statsRoutes");
const movimentosStockRoutes = require("./routes/movimentosStockRoutes")(io);

app.use("/api/order-groups", OrderGroupRoutes);
app.use("/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/ingredientes", ingredientesRoutes);
app.use("/api/movimentos-stock", movimentosStockRoutes);

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Base de dados sincronizada.");
    await createInitialUser();
  })
  .catch((error) => {
    console.error("Erro ao sincronizar base de dados:", error);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor a correr na porta ${PORT}`);
  console.log(`Swagger disponível em: http://localhost:${PORT}/api-docs`);
});
