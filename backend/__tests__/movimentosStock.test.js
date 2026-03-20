process.env.JWT_SECRET = "test_secret_willows";

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const mockIngredientes = {
  findByPk: jest.fn(),
};
const mockMovimentoStock = {
  create: jest.fn(),
  findAll: jest.fn(),
};

jest.mock("../src/models/Ingredientes", () => mockIngredientes);
jest.mock("../src/models/MovimentoStock", () => mockMovimentoStock);
jest.mock("../src/config/database", () => ({
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
}));

const userToken = jwt.sign({ id: 1, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

function buildApp() {
  const app = express();
  app.use(express.json());
  const io = { emit: jest.fn() };
  app.use("/api/movimentos-stock", require("../src/routes/movimentosStockRoutes")(io));
  app._io = io;
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

const ingredienteFixture = {
  id: 1,
  nome: "Gin",
  unidade: "ml",
  quantidade: 1000,
  save: jest.fn().mockResolvedValue(),
};

const movimentoFixture = {
  id: 1,
  ingredienteId: 1,
  quantidade: 500,
  tipo: "compra",
  observacoes: null,
  userId: 1,
};

describe("POST /api/movimentos-stock", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).post("/api/movimentos-stock").send({});
    expect(res.status).toBe(401);
  });

  test("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1 }); // missing quantidade and tipo
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/obrigatórios/);
  });

  test("returns 400 when quantidade is zero or negative", async () => {
    const res = await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1, quantidade: 0, tipo: "compra" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/positiva/);
  });

  test("returns 400 when tipo is invalid", async () => {
    const res = await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1, quantidade: 100, tipo: "roubo" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Tipo inválido/);
  });

  test("returns 404 when ingrediente not found", async () => {
    mockIngredientes.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 99, quantidade: 100, tipo: "compra" });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/não encontrado/);
  });

  test("compra: adds to stock and creates positive movement", async () => {
    const ing = { ...ingredienteFixture, save: jest.fn().mockResolvedValue() };
    mockIngredientes.findByPk.mockResolvedValue(ing);
    mockMovimentoStock.create.mockResolvedValue({ ...movimentoFixture, quantidade: 500, tipo: "compra" });

    const res = await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1, quantidade: 500, tipo: "compra" });

    expect(res.status).toBe(201);
    expect(ing.quantidade).toBe(1500); // 1000 + 500
    expect(mockMovimentoStock.create).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade: 500, tipo: "compra" })
    );
  });

  test("oferta: subtracts from stock and creates negative movement", async () => {
    const ing = { ...ingredienteFixture, quantidade: 1000, save: jest.fn().mockResolvedValue() };
    mockIngredientes.findByPk.mockResolvedValue(ing);
    mockMovimentoStock.create.mockResolvedValue({ ...movimentoFixture, quantidade: -200, tipo: "oferta" });

    const res = await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1, quantidade: 200, tipo: "oferta", observacoes: "rodada mesa 3" });

    expect(res.status).toBe(201);
    expect(ing.quantidade).toBe(800); // 1000 - 200
    expect(mockMovimentoStock.create).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade: -200, tipo: "oferta", observacoes: "rodada mesa 3" })
    );
  });

  test("quebra: subtracts from stock, clamped at 0", async () => {
    const ing = { ...ingredienteFixture, quantidade: 50, save: jest.fn().mockResolvedValue() };
    mockIngredientes.findByPk.mockResolvedValue(ing);
    mockMovimentoStock.create.mockResolvedValue({ ...movimentoFixture, quantidade: -200, tipo: "quebra" });

    await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1, quantidade: 200, tipo: "quebra" });

    expect(ing.quantidade).toBe(0); // Math.max(0, 50 - 200)
  });

  test("ajuste: sets new stock value and records difference as quantidade", async () => {
    const ing = { ...ingredienteFixture, quantidade: 1000, save: jest.fn().mockResolvedValue() };
    mockIngredientes.findByPk.mockResolvedValue(ing);
    mockMovimentoStock.create.mockResolvedValue({ ...movimentoFixture, quantidade: -150, tipo: "ajuste" });

    const res = await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1, quantidade: 850, tipo: "ajuste" });

    expect(res.status).toBe(201);
    expect(ing.quantidade).toBe(850); // set to physical count
    expect(mockMovimentoStock.create).toHaveBeenCalledWith(
      expect.objectContaining({ quantidade: -150, tipo: "ajuste" }) // 850 - 1000 = -150
    );
  });

  test("emits movimentoStockCreated socket event", async () => {
    const ing = { ...ingredienteFixture, save: jest.fn().mockResolvedValue() };
    mockIngredientes.findByPk.mockResolvedValue(ing);
    mockMovimentoStock.create.mockResolvedValue(movimentoFixture);

    await request(app)
      .post("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ingredienteId: 1, quantidade: 100, tipo: "compra" });

    expect(app._io.emit).toHaveBeenCalledWith("movimentoStockCreated", expect.any(Object));
  });
});

describe("GET /api/movimentos-stock", () => {
  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/movimentos-stock");
    expect(res.status).toBe(401);
  });

  test("returns list of movements", async () => {
    mockMovimentoStock.findAll.mockResolvedValue([
      { ...movimentoFixture, Ingrediente: { nome: "Gin", unidade: "ml" } },
    ]);

    const res = await request(app)
      .get("/api/movimentos-stock")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  test("applies ingredienteId filter when provided", async () => {
    mockMovimentoStock.findAll.mockResolvedValue([]);

    await request(app)
      .get("/api/movimentos-stock?ingredienteId=1&periodo=semana&tipo=compra")
      .set("Authorization", `Bearer ${userToken}`);

    expect(mockMovimentoStock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ingredienteId: 1, tipo: "compra" }),
      })
    );
  });
});
