process.env.JWT_SECRET = "test_secret_willows";

const bcrypt = require("bcrypt");
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const mockUser = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
};
const mockOrderGroup = {
  update: jest.fn(),
};

jest.mock("../src/models/User", () => mockUser);
jest.mock("../src/models/OrderGroup", () => mockOrderGroup);
jest.mock("../src/config/database", () => ({
  define: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
}));

function buildApp() {
  const app = express();
  app.use(express.json());
  const io = { emit: jest.fn() };
  app.use("/auth", require("../src/routes/authRoutes")(io));
  return app;
}

let app;
let hashedPassword;
let hashedAdminPassword;

beforeAll(async () => {
  hashedPassword = await bcrypt.hash("password123", 10);
  hashedAdminPassword = await bcrypt.hash("adminpass", 10);
  app = buildApp();
});

beforeEach(() => jest.clearAllMocks());

const makeUser = (overrides = {}) => ({
  id: 1, username: "testuser", email: "test@w.cafe",
  password: hashedPassword, role: "user", ...overrides,
});

const makeAdmin = () => ({
  id: 2, username: "admin", email: "admin@w.cafe",
  password: hashedAdminPassword, role: "admin",
});

describe("POST /auth/login", () => {
  test("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
  });

  test("returns 404 when user not found", async () => {
    mockUser.findOne.mockResolvedValue(null);
    const res = await request(app).post("/auth/login").send({ username: "nobody", password: "x" });
    expect(res.status).toBe(404);
  });

  test("returns 401 when password is wrong", async () => {
    mockUser.findOne.mockResolvedValue(makeUser());
    const res = await request(app).post("/auth/login").send({ username: "testuser", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("returns token and safe user on success", async () => {
    mockUser.findOne.mockResolvedValue(makeUser());
    const res = await request(app).post("/auth/login").send({ username: "testuser", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.body.user.username).toBe("testuser");
  });

  test("token expires in 12 hours (not 999y)", async () => {
    mockUser.findOne.mockResolvedValue(makeUser());
    const res = await request(app).post("/auth/login").send({ username: "testuser", password: "password123" });
    const decoded = jwt.decode(res.body.token);
    const expiryHours = (decoded.exp - decoded.iat) / 3600;
    expect(expiryHours).toBeCloseTo(12, 0);
  });
});

describe("POST /auth/login-admin", () => {
  test("returns 403 when user is not admin", async () => {
    mockUser.findOne.mockResolvedValue(makeUser());
    const res = await request(app).post("/auth/login-admin").send({ username: "testuser", password: "password123" });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Acesso negado/);
  });

  test("returns 401 for wrong admin password", async () => {
    mockUser.findOne.mockResolvedValue(makeAdmin());
    const res = await request(app).post("/auth/login-admin").send({ username: "admin", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("returns token for valid admin — password not in response", async () => {
    mockUser.findOne.mockResolvedValue(makeAdmin());
    const res = await request(app).post("/auth/login-admin").send({ username: "admin", password: "adminpass" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.role).toBe("admin");
    expect(res.body.user).not.toHaveProperty("password");
  });

  test("admin token expires in 8 hours", async () => {
    mockUser.findOne.mockResolvedValue(makeAdmin());
    const res = await request(app).post("/auth/login-admin").send({ username: "admin", password: "adminpass" });
    const decoded = jwt.decode(res.body.token);
    const expiryHours = (decoded.exp - decoded.iat) / 3600;
    expect(expiryHours).toBeCloseTo(8, 0);
  });
});

describe("GET /auth/all — admin only", () => {
  const adminToken = () => jwt.sign({ id: 2, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const userToken = () => jwt.sign({ id: 1, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  test("returns 401 with no token", async () => {
    const res = await request(app).get("/auth/all");
    expect(res.status).toBe(401);
  });

  test("returns 403 with non-admin token", async () => {
    const res = await request(app).get("/auth/all").set("Authorization", `Bearer ${userToken()}`);
    expect(res.status).toBe(403);
  });

  test("returns user list for admin (no passwords)", async () => {
    mockUser.findAll.mockResolvedValue([
      { id: 1, username: "u1", email: "u1@t.com", role: "user" },
    ]);
    const res = await request(app).get("/auth/all").set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /auth/signup — admin only", () => {
  const adminToken = () => jwt.sign({ id: 2, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const userToken = () => jwt.sign({ id: 1, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  test("returns 401 with no token", async () => {
    const res = await request(app).post("/auth/signup").send({ username: "x", email: "x@x.com", password: "x" });
    expect(res.status).toBe(401);
  });

  test("returns 403 for non-admin", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ username: "x", email: "x@x.com", password: "x" });
    expect(res.status).toBe(403);
  });

  test("creates user as admin", async () => {
    const newUser = makeUser({ id: 5, username: "novofunc" });
    mockUser.create.mockResolvedValue(newUser);
    const res = await request(app)
      .post("/auth/signup")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ username: "novofunc", email: "novo@w.cafe", password: "pass123" });
    expect(res.status).toBe(201);
    expect(res.body.user).not.toHaveProperty("password");
  });
});

describe("DELETE /auth/delete/:id — admin only", () => {
  const adminToken = () => jwt.sign({ id: 2, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  test("returns 401 with no token", async () => {
    const res = await request(app).delete("/auth/delete/1");
    expect(res.status).toBe(401);
  });

  test("returns 404 when user not found", async () => {
    mockUser.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .delete("/auth/delete/999")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(404);
  });

  test("deletes user and nullifies their orders", async () => {
    const destroyFn = jest.fn().mockResolvedValue();
    mockUser.findByPk.mockResolvedValue({ ...makeUser(), destroy: destroyFn });
    mockOrderGroup.update.mockResolvedValue();

    const res = await request(app)
      .delete("/auth/delete/1")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(mockOrderGroup.update).toHaveBeenCalledWith(
      { userId: null }, { where: { userId: "1" } }
    );
    expect(destroyFn).toHaveBeenCalled();
  });
});

describe("PATCH /auth/update-role/:id — admin only", () => {
  const adminToken = () => jwt.sign({ id: 2, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const userToken = () => jwt.sign({ id: 1, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

  test("returns 403 for non-admin", async () => {
    const res = await request(app)
      .patch("/auth/update-role/1")
      .set("Authorization", `Bearer ${userToken()}`)
      .send({ role: "admin" });
    expect(res.status).toBe(403);
  });

  test("updates user role", async () => {
    const saveFn = jest.fn().mockResolvedValue();
    mockUser.findByPk.mockResolvedValue({ ...makeUser(), save: saveFn });
    const res = await request(app)
      .patch("/auth/update-role/1")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ role: "admin" });
    expect(res.status).toBe(200);
    expect(saveFn).toHaveBeenCalled();
  });
});
