process.env.JWT_SECRET = "test_secret_willows";

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const mockIngredientes = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

jest.mock("../src/models/Ingredientes", () => mockIngredientes);
jest.mock("../src/config/database", () => ({
  literal: jest.fn((s) => s),
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
  app.use("/api/ingredientes", require("../src/routes/ingredientesRoutes")(io));
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

const ingFixture = {
  id: 1,
  nome: "Café em grão",
  quantidade: 5.0,
  unidade: "kg",
  quantidadeMinima: 1.0,
};

describe("GET /api/ingredientes", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/ingredientes");
    expect(res.status).toBe(401);
  });

  test("returns ingredient list for authenticated user", async () => {
    mockIngredientes.findAll.mockResolvedValue([ingFixture]);
    const res = await request(app)
      .get("/api/ingredientes")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  test("orders results alphabetically", async () => {
    mockIngredientes.findAll.mockResolvedValue([ingFixture]);
    await request(app)
      .get("/api/ingredientes")
      .set("Authorization", `Bearer ${userToken}`);
    expect(mockIngredientes.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ order: [["nome", "ASC"]] })
    );
  });
});

describe("POST /api/ingredientes (admin only)", () => {
  test("returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/ingredientes")
      .send({ nome: "Leite", quantidade: 10, unidade: "L" });
    expect(res.status).toBe(401);
  });

  test("returns 403 for non-admin", async () => {
    const res = await request(app)
      .post("/api/ingredientes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Leite", quantidade: 10, unidade: "L" });
    expect(res.status).toBe(403);
  });

  test("creates ingredient with quantidadeMinima defaulting to 0", async () => {
    mockIngredientes.create.mockResolvedValue({ id: 2, nome: "Leite", quantidade: 10, unidade: "L", quantidadeMinima: 0 });
    const res = await request(app)
      .post("/api/ingredientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Leite", quantidade: 10, unidade: "L" });
    expect(res.status).toBe(201);
    expect(mockIngredientes.create).toHaveBeenCalledWith(
      expect.objectContaining({ quantidadeMinima: 0 })
    );
  });

  test("creates ingredient with custom quantidadeMinima", async () => {
    mockIngredientes.create.mockResolvedValue({ ...ingFixture, id: 3 });
    const res = await request(app)
      .post("/api/ingredientes")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Café em grão", quantidade: 5, unidade: "kg", quantidadeMinima: 1 });
    expect(res.status).toBe(201);
    expect(mockIngredientes.create).toHaveBeenCalledWith(
      expect.objectContaining({ quantidadeMinima: 1 })
    );
  });
});

describe("PUT /api/ingredientes/:id (admin only)", () => {
  test("returns 403 for non-admin", async () => {
    const res = await request(app)
      .put("/api/ingredientes/1")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantidade: 10 });
    expect(res.status).toBe(403);
  });

  test("returns 404 when not found", async () => {
    mockIngredientes.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .put("/api/ingredientes/999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantidade: 10 });
    expect(res.status).toBe(404);
  });

  test("updates ingredient fields", async () => {
    const updateFn = jest.fn().mockResolvedValue();
    mockIngredientes.findByPk.mockResolvedValue({ ...ingFixture, update: updateFn });
    const res = await request(app)
      .put("/api/ingredientes/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantidade: 8.0, quantidadeMinima: 2.0 });
    expect(res.status).toBe(200);
    expect(updateFn).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade: 8.0, quantidadeMinima: 2.0 })
    );
  });
});

describe("DELETE /api/ingredientes/:id (admin only)", () => {
  test("returns 403 for non-admin", async () => {
    const res = await request(app)
      .delete("/api/ingredientes/1")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test("returns 404 when not found", async () => {
    mockIngredientes.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .delete("/api/ingredientes/999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test("deletes ingredient", async () => {
    const destroyFn = jest.fn().mockResolvedValue();
    mockIngredientes.findByPk.mockResolvedValue({ id: 1, destroy: destroyFn });
    const res = await request(app)
      .delete("/api/ingredientes/1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(destroyFn).toHaveBeenCalled();
  });
});
