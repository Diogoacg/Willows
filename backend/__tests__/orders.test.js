process.env.JWT_SECRET = "test_secret_willows";

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Manual mocks must be declared before any require of the mocked module
const mockOrderGroup = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  sum: jest.fn(),
};
const mockOrderItem = {
  findAll: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
};
const mockItem = { findAll: jest.fn(), findByPk: jest.fn() };
const mockUser = { findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn() };
const mockIngredientes = { findByPk: jest.fn() };

jest.mock("../src/models/OrderGroup", () => mockOrderGroup);
jest.mock("../src/models/OrderItem", () => mockOrderItem);
jest.mock("../src/models/Item", () => mockItem);
jest.mock("../src/models/User", () => mockUser);
jest.mock("../src/models/Ingredientes", () => mockIngredientes);
jest.mock("../src/config/database", () => ({
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
}));

const userToken = jwt.sign({ id: 1, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
const adminToken = jwt.sign({ id: 2, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

function buildApp() {
  const app = express();
  app.use(express.json());
  const io = { emit: jest.fn() };
  app.use("/api/order-groups", require("../src/routes/orderGroupRoutes")(io));
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

const itemFixture = {
  id: 1,
  nome: "Café Expresso",
  preco: "1.20",
  disponivel: true,
};

const orderFixture = {
  id: 1,
  status: "pendente",
  mesa: 3,
  totalPrice: "2.40",
  userId: 1,
  items: [{ id: 1, nome: "Café Expresso", quantidade: 2 }],
};

describe("POST /api/order-groups", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).post("/api/order-groups").send({ items: [] });
    expect(res.status).toBe(401);
  });

  test("returns 400 when items array is empty", async () => {
    const res = await request(app)
      .post("/api/order-groups")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [] });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/pelo menos um item/);
  });

  test("returns 400 when item not in inventory", async () => {
    mockItem.findAll.mockResolvedValue([]);
    const res = await request(app)
      .post("/api/order-groups")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ nome: "Produto Inexistente", quantidade: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/não disponíveis/);
  });

  test("creates order with mesa and calculates correct total", async () => {
    mockItem.findAll.mockResolvedValue([itemFixture]);
    mockOrderGroup.create.mockResolvedValue({ id: 1 });
    mockOrderItem.create.mockResolvedValue({});
    mockOrderGroup.findByPk.mockResolvedValue(orderFixture);

    const res = await request(app)
      .post("/api/order-groups")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ nome: "Café Expresso", quantidade: 2 }], mesa: 3 });

    expect(res.status).toBe(201);
    expect(mockOrderGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({
        totalPrice: "2.40",
        mesa: 3,
        status: "pendente",
        userId: 1,
      })
    );
  });

  test("stores observacoes per item", async () => {
    mockItem.findAll.mockResolvedValue([itemFixture]);
    mockOrderGroup.create.mockResolvedValue({ id: 5 });
    mockOrderItem.create.mockResolvedValue({});
    mockOrderGroup.findByPk.mockResolvedValue({ ...orderFixture, id: 5 });

    await request(app)
      .post("/api/order-groups")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ nome: "Café Expresso", quantidade: 1, observacoes: "sem açúcar" }] });

    expect(mockOrderItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ observacoes: "sem açúcar" })
    );
  });

  test("creates order with null mesa when not provided", async () => {
    mockItem.findAll.mockResolvedValue([itemFixture]);
    mockOrderGroup.create.mockResolvedValue({ id: 2 });
    mockOrderItem.create.mockResolvedValue({});
    mockOrderGroup.findByPk.mockResolvedValue({ ...orderFixture, mesa: null });

    await request(app)
      .post("/api/order-groups")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ items: [{ nome: "Café Expresso", quantidade: 1 }] });

    expect(mockOrderGroup.create).toHaveBeenCalledWith(
      expect.objectContaining({ mesa: null })
    );
  });
});

describe("GET /api/order-groups", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/order-groups");
    expect(res.status).toBe(401);
  });

  test("returns all active orders", async () => {
    mockOrderGroup.findAll.mockResolvedValue([orderFixture]);
    const res = await request(app)
      .get("/api/order-groups")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("filters by status query param", async () => {
    mockOrderGroup.findAll.mockResolvedValue([]);
    await request(app)
      .get("/api/order-groups?status=pendente")
      .set("Authorization", `Bearer ${userToken}`);
    expect(mockOrderGroup.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "pendente" }),
      })
    );
  });
});

describe("PATCH /api/order-groups/:id", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).patch("/api/order-groups/1").send({ status: "pronto" });
    expect(res.status).toBe(401);
  });

  test("returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch("/api/order-groups/1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "invalido" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Status inválido/);
  });

  test("returns 404 when order not found", async () => {
    mockOrderGroup.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .patch("/api/order-groups/999")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "em_preparo" });
    expect(res.status).toBe(404);
  });

  test("advances status to em_preparo without touching stock", async () => {
    const saveFn = jest.fn().mockResolvedValue();
    mockOrderGroup.findByPk.mockResolvedValue({
      id: 1, status: "pendente", items: [], save: saveFn,
    });

    const res = await request(app)
      .patch("/api/order-groups/1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "em_preparo" });

    expect(res.status).toBe(200);
    expect(saveFn).toHaveBeenCalled();
    expect(mockIngredientes.findByPk).not.toHaveBeenCalled();
  });

  test("deducts ingredients when status becomes pronto", async () => {
    const orderSaveFn = jest.fn().mockResolvedValue();
    const ingSaveFn = jest.fn().mockResolvedValue();

    mockOrderGroup.findByPk.mockResolvedValue({
      id: 1,
      status: "em_preparo",
      items: [{
        quantidade: 2,
        Item: {
          Ingredientes: [{
            id: 10,
            quantidade: 5.0,
            ItemIngredient: { quantidade: 0.5 },
          }],
        },
      }],
      save: orderSaveFn,
    });

    const ingInstance = { id: 10, quantidade: 5.0, save: ingSaveFn };
    mockIngredientes.findByPk.mockResolvedValue(ingInstance);

    const res = await request(app)
      .patch("/api/order-groups/1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "pronto" });

    expect(res.status).toBe(200);
    expect(mockIngredientes.findByPk).toHaveBeenCalledWith(10);
    // 5.0 - (0.5 * 2) = 4.0
    expect(ingInstance.quantidade).toBe(4.0);
    expect(ingSaveFn).toHaveBeenCalled();
  });

  test("stock never goes negative", async () => {
    const ingSaveFn = jest.fn().mockResolvedValue();
    mockOrderGroup.findByPk.mockResolvedValue({
      id: 1, status: "em_preparo",
      items: [{
        quantidade: 10,
        Item: {
          Ingredientes: [{
            id: 11, quantidade: 1.0,
            ItemIngredient: { quantidade: 2.0 },
          }],
        },
      }],
      save: jest.fn().mockResolvedValue(),
    });

    const ingInstance = { id: 11, quantidade: 1.0, save: ingSaveFn };
    mockIngredientes.findByPk.mockResolvedValue(ingInstance);

    await request(app)
      .patch("/api/order-groups/1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "pronto" });

    expect(ingInstance.quantidade).toBe(0); // Math.max(0, 1.0 - 20.0) = 0
  });
});

describe("DELETE /api/order-groups/:id", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).delete("/api/order-groups/1");
    expect(res.status).toBe(401);
  });

  test("returns 404 when order not found", async () => {
    mockOrderGroup.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .delete("/api/order-groups/1")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  test("deletes order and its items", async () => {
    const destroyFn = jest.fn().mockResolvedValue();
    mockOrderGroup.findByPk.mockResolvedValue({ id: 1, destroy: destroyFn });
    mockOrderItem.destroy.mockResolvedValue();

    const res = await request(app)
      .delete("/api/order-groups/1")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(mockOrderItem.destroy).toHaveBeenCalledWith({ where: { orderGroupId: 1 } });
    expect(destroyFn).toHaveBeenCalled();
  });
});
