const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const OrderGroupRoutes = require("./routes/orderGroupRoutes.js");
const inventoryRoutes = require("./routes/inventoryRoutes");
const statsRoutes = require("./routes/statsRoutes");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8081", // Troque pelo endereço do seu frontend local
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const corsOptions = {
  origin: "http://localhost:8081", // Troque pelo endereço do seu frontend local
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Criar um usuário automaticamente ao iniciar a aplicação
async function createInitialUser() {
  const username = "admin"; // Nome de usuário inicial
  const email = "admin@example.com"; // Email inicial
  const password = "admin123"; // Senha inicial

  try {
    // Verifique se já existe um usuário com o nome de usuário
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      console.log("Initial user already exists");
      return;
    }

    // Crie o usuário no banco de dados
    await User.create({
      username,
      email,
      password,
    });

    console.log("Initial user created successfully");
  } catch (error) {
    console.error("Error creating initial user:", error);
  }
}

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

    // Chame a função para criar o usuário inicial
    await createInitialUser();
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

// Rotas da API (modificadas para passar `io`)
// const OrderGroupRoutes = require("./routes/orderGroupRoutes")(io);
const authRoutes = require("./routes/authRoutes")(io);
// const inventoryRoutes = require("./routes/inventoryRoutes")(io);
// const statsRoutes = require("./routes/statsRoutes")(io);

// Rotas da API
app.use("/api/order-groups", OrderGroupRoutes);
app.use("/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/stats", statsRoutes);

// Exemplo básico de conexão Socket.IO
io.on("connection", (socket) => {
  console.log("Novo cliente conectado");
});

// Porta do servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Swagger disponível em: http://localhost:${PORT}/api-docs`);
});
