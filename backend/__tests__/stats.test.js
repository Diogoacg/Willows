process.env.JWT_SECRET = "test_secret_willows";

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const mockOrderGroup = {
  findAll: jest.fn(),
  count: jest.fn(),
  sum: jest.fn(),
};
const mockOrderItem = { findAll: jest.fn() };
const mockItem = {};
const mockUser = {};

jest.mock("../src/models/OrderGroup", () => mockOrderGroup);
jest.mock("../src/models/OrderItem", () => mockOrderItem);
jest.mock("../src/models/Item", () => mockItem);
jest.mock("../src/models/User", () => mockUser);
jest.mock("../src/models/Ingredientes", () => ({ count: jest.fn().mockResolvedValue(0) }));
jest.mock("../src/config/database", () => ({
  fn: jest.fn((func, col) => `${func}(${col})`),
  col: jest.fn((name) => name),
  literal: jest.fn((s) => s),
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
}));

const token = jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
const userToken = jwt.sign({ id: 2, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/stats", require("../src/routes/statsRoutes"));
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

describe("GET /api/stats/profit", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/stats/profit");
    expect(res.status).toBe(401);
  });

  test("returns profit with default 0 when no data", async () => {
    mockOrderGroup.sum = jest.fn().mockResolvedValue(null);
    const res = await request(app)
      .get("/api/stats/profit")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ dailyProfit: 0, weeklyProfit: 0, monthlyProfit: 0 });
  });

  test("returns correct profit values", async () => {
    mockOrderGroup.sum = jest.fn()
      .mockResolvedValueOnce(50.5)
      .mockResolvedValueOnce(210.0)
      .mockResolvedValueOnce(800.0);
    const res = await request(app)
      .get("/api/stats/profit")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.dailyProfit).toBe(50.5);
    expect(res.body.weeklyProfit).toBe(210.0);
    expect(res.body.monthlyProfit).toBe(800.0);
  });

  test("only queries orders with status pronto", async () => {
    mockOrderGroup.sum = jest.fn().mockResolvedValue(0);
    await request(app).get("/api/stats/profit").set("Authorization", `Bearer ${token}`);
    const callArgs = mockOrderGroup.sum.mock.calls[0];
    expect(callArgs[1].where).toMatchObject({ status: "pronto" });
  });

  test("works for non-admin authenticated users", async () => {
    mockOrderGroup.sum = jest.fn().mockResolvedValue(0);
    const res = await request(app)
      .get("/api/stats/profit")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/stats/total-orders-dmw", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/stats/total-orders-dmw");
    expect(res.status).toBe(401);
  });

  test("returns order counts per period", async () => {
    mockOrderGroup.count = jest.fn()
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(30)
      .mockResolvedValueOnce(120);
    const res = await request(app)
      .get("/api/stats/total-orders-dmw")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ dailyOrders: 5, weeklyOrders: 30, monthlyOrders: 120 });
  });
});

describe("GET /api/stats/profit-per-user", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/stats/profit-per-user");
    expect(res.status).toBe(401);
  });

  test("returns ranked profit per user", async () => {
    mockOrderGroup.findAll = jest.fn().mockResolvedValue([
      {
        userId: 1,
        User: { username: "alice" },
        getDataValue: (key) => key === "totalProfit" ? "120.50" : "8",
      },
    ]);
    const res = await request(app)
      .get("/api/stats/profit-per-user")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({
      userId: 1,
      username: "alice",
      totalProfit: "120.50",
      totalOrders: 8,
    });
  });

  test("only queries pronto orders for profit", async () => {
    mockOrderGroup.findAll = jest.fn().mockResolvedValue([]);
    await request(app).get("/api/stats/profit-per-user").set("Authorization", `Bearer ${token}`);
    const callArgs = mockOrderGroup.findAll.mock.calls[0][0];
    expect(callArgs.where).toMatchObject({ status: "pronto" });
  });
});

describe("GET /api/stats/orders-per-item", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/stats/orders-per-item");
    expect(res.status).toBe(401);
  });

  test("returns item popularity with totalVendido and totalPedidos", async () => {
    mockOrderItem.findAll = jest.fn().mockResolvedValue([
      {
        itemId: 1,
        Item: { nome: "Café Expresso", categoria: "bebidas_quentes" },
        getDataValue: (key) => key === "totalVendido" ? "42" : "20",
      },
    ]);
    const res = await request(app)
      .get("/api/stats/orders-per-item")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({
      itemId: 1,
      itemName: "Café Expresso",
      categoria: "bebidas_quentes",
      totalVendido: 42,
      totalPedidos: 20,
    });
  });
});

describe("GET /api/stats/resumo", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/stats/resumo");
    expect(res.status).toBe(401);
  });

  test("returns operational dashboard data", async () => {
    mockOrderGroup.count = jest.fn()
      .mockResolvedValueOnce(3)  // pendentes
      .mockResolvedValueOnce(2); // em_preparo
    mockOrderGroup.sum = jest.fn().mockResolvedValue(89.5);

    const res = await request(app)
      .get("/api/stats/resumo")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("pedidosPendentes");
    expect(res.body).toHaveProperty("pedidosEmPreparo");
    expect(res.body).toHaveProperty("lucroHoje");
    expect(res.body).toHaveProperty("alertasStock");
  });
});
