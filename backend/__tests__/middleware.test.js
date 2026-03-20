const jwt = require("jsonwebtoken");
process.env.JWT_SECRET = "test_secret_willows";

const authenticateToken = require("../src/middleWare/authMiddleware");
const { requireAdmin } = require("../src/middleWare/authMiddleware");

function mockReq(token) {
  return { headers: { authorization: token ? `Bearer ${token}` : undefined } };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("authenticateToken middleware", () => {
  test("rejects request with no authorization header", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects request with malformed header (no Bearer)", () => {
    const req = { headers: { authorization: "Token abc123" } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects invalid/expired token", () => {
    const req = mockReq("invalid.token.here");
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("accepts valid token and sets req.user", () => {
    const payload = { id: 1, role: "user" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 1, role: "user" });
  });

  test("rejects expired token", () => {
    const payload = { id: 1, role: "user" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "-1s" });
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("requireAdmin middleware", () => {
  test("rejects non-admin users", () => {
    const req = { user: { id: 1, role: "user" } };
    const res = mockRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("allows admin users", () => {
    const req = { user: { id: 1, role: "admin" } };
    const res = mockRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects request with no user set", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
