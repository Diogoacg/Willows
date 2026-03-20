process.env.JWT_SECRET = "test_secret_willows";

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const mockItem = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};
const mockIngredientes = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
};
const mockItemIngredient = {
  create: jest.fn(),
  destroy: jest.fn(),
};

jest.mock("../src/models/Item", () => mockItem);
jest.mock("../src/models/Ingredientes", () => mockIngredientes);
jest.mock("../src/models/ItemIngredientes", () => mockItemIngredient);
jest.mock("../src/config/database", () => ({
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
}));

const adminToken = jwt.sign({ id: 1, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
const userToken = jwt.sign({ id: 2, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

function buildApp() {
  const app = express();
  app.use(express.json());
  const io = { emit: jest.fn() };
  app.use("/api/inventory", require("../src/routes/inventoryRoutes")(io));
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

const itemFixture = {
  id: 1,
  nome: "Café Expresso",
  preco: 1.2,
  categoria: "bebidas_quentes",
  disponivel: true,
  descricao: "Café intenso",
  Ingredientes: [],
};

describe("GET /api/inventory", () => {
  test("returns item list without auth", async () => {
    mockItem.findAll.mockResolvedValue([itemFixture]);
    const res = await request(app).get("/api/inventory");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("filters by categoria query param", async () => {
    mockItem.findAll.mockResolvedValue([itemFixture]);
    await request(app).get("/api/inventory?categoria=bebidas_quentes");
    expect(mockItem.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ categoria: "bebidas_quentes" }),
      })
    );
  });

  test("filters by disponivel=true query param", async () => {
    mockItem.findAll.mockResolvedValue([itemFixture]);
    await request(app).get("/api/inventory?disponivel=true");
    expect(mockItem.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ disponivel: true }),
      })
    );
  });

  test("filters by disponivel=false query param", async () => {
    mockItem.findAll.mockResolvedValue([]);
    await request(app).get("/api/inventory?disponivel=false");
    expect(mockItem.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ disponivel: false }),
      })
    );
  });
});

describe("GET /api/inventory/:id", () => {
  test("returns 404 when item not found", async () => {
    mockItem.findByPk.mockResolvedValue(null);
    const res = await request(app).get("/api/inventory/999");
    expect(res.status).toBe(404);
  });

  test("returns item when found", async () => {
    mockItem.findByPk.mockResolvedValue(itemFixture);
    const res = await request(app).get("/api/inventory/1");
    expect(res.status).toBe(200);
  });
});

describe("POST /api/inventory (admin only)", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).post("/api/inventory").send({ nome: "X", preco: 1 });
    expect(res.status).toBe(401);
  });

  test("returns 403 for non-admin user", async () => {
    const res = await request(app)
      .post("/api/inventory")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "X", preco: 1 });
    expect(res.status).toBe(403);
  });

  test("creates item without ingredientes", async () => {
    mockItem.create.mockResolvedValue({ id: 2, ...itemFixture });
    mockItem.findByPk.mockResolvedValue({ ...itemFixture, id: 2, Ingredientes: [] });

    const res = await request(app)
      .post("/api/inventory")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Café Expresso", preco: 1.2, categoria: "bebidas_quentes" });

    expect(res.status).toBe(201);
    expect(mockItem.create).toHaveBeenCalled();
  });

  test("creates item with ingredientes", async () => {
    const created = { id: 3, nome: "Cappuccino", preco: 2.5 };
    mockItem.create.mockResolvedValue(created);
    mockIngredientes.findOne.mockResolvedValue({ id: 10, nome: "Leite" });
    mockItemIngredient.create.mockResolvedValue({});
    mockItem.findByPk.mockResolvedValue({ ...created, Ingredientes: [{ id: 10, nome: "Leite" }] });

    const res = await request(app)
      .post("/api/inventory")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nome: "Cappuccino",
        preco: 2.5,
        ingredientes: [{ nome: "Leite", quantidade: 0.15 }],
      });

    expect(res.status).toBe(201);
    expect(mockIngredientes.findOne).toHaveBeenCalledWith({ where: { nome: "Leite" } });
    expect(mockItemIngredient.create).toHaveBeenCalledWith({
      itemId: 3,
      ingredienteId: 10,
      quantidade: 0.15,
    });
  });

  test("rolls back (destroys item) if ingrediente not found", async () => {
    const destroyFn = jest.fn().mockResolvedValue();
    mockItem.create.mockResolvedValue({ id: 4, destroy: destroyFn });
    mockIngredientes.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/inventory")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Test", preco: 2, ingredientes: [{ nome: "Leite", quantidade: 0.2 }] });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Leite/);
    expect(destroyFn).toHaveBeenCalled();
  });
});

describe("PUT /api/inventory/:id (admin only)", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).put("/api/inventory/1").send({ nome: "X" });
    expect(res.status).toBe(401);
  });

  test("returns 404 when item not found", async () => {
    mockItem.findByPk.mockResolvedValueOnce(null);
    const res = await request(app)
      .put("/api/inventory/999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "X", preco: 1 });
    expect(res.status).toBe(404);
  });

  test("updates item fields", async () => {
    const updateFn = jest.fn().mockResolvedValue();
    mockItem.findByPk
      .mockResolvedValueOnce({ id: 1, update: updateFn })
      .mockResolvedValueOnce({ ...itemFixture, Ingredientes: [] });

    const res = await request(app)
      .put("/api/inventory/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Café Expresso", preco: 1.5, disponivel: false });

    expect(res.status).toBe(200);
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ preco: 1.5, disponivel: false })
    );
  });

  test("replaces ingredient associations when provided", async () => {
    const updateFn = jest.fn().mockResolvedValue();
    mockItem.findByPk
      .mockResolvedValueOnce({ id: 1, update: updateFn })
      .mockResolvedValueOnce({ ...itemFixture, Ingredientes: [] });
    mockItemIngredient.destroy.mockResolvedValue();
    mockItemIngredient.create.mockResolvedValue({});

    await request(app)
      .put("/api/inventory/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ingredientes: [{ id: 5, quantidade: 0.1 }] });

    expect(mockItemIngredient.destroy).toHaveBeenCalledWith({ where: { itemId: 1 } });
    expect(mockItemIngredient.create).toHaveBeenCalledWith({
      itemId: 1,
      ingredienteId: 5,
      quantidade: 0.1,
    });
  });
});

describe("DELETE /api/inventory/:id (admin only)", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).delete("/api/inventory/1");
    expect(res.status).toBe(401);
  });

  test("returns 404 when item not found", async () => {
    mockItem.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .delete("/api/inventory/999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test("deletes item and its ingredient links", async () => {
    const destroyFn = jest.fn().mockResolvedValue();
    mockItem.findByPk.mockResolvedValue({ id: 1, destroy: destroyFn });
    mockItemIngredient.destroy.mockResolvedValue();

    const res = await request(app)
      .delete("/api/inventory/1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(mockItemIngredient.destroy).toHaveBeenCalledWith({ where: { itemId: 1 } });
    expect(destroyFn).toHaveBeenCalled();
  });
});
