const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OrderGroup = require("../models/OrderGroup");
const authenticateToken = require("../middleWare/authMiddleware");
const { requireAdmin } = require("../middleWare/authMiddleware");

const router = express.Router();

const safeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

module.exports = (io) => {
  /**
   * @swagger
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       required:
   *         - username
   *         - email
   *         - password
   *       properties:
   *         username:
   *           type: string
   *         email:
   *           type: string
   *         password:
   *           type: string
   *         role:
   *           type: string
   *           enum: [user, admin]
   */

  /**
   * @swagger
   * /auth/signup:
   *   post:
   *     summary: Cria um novo funcionário (requer admin)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       201:
   *         description: Utilizador criado com sucesso
   *       400:
   *         description: Erro ao criar utilizador
   */
  router.post("/signup", authenticateToken, requireAdmin, async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
      const newUser = await User.create({ username, email, password, role });
      io.emit("userCreated", safeUser(newUser));
      res.status(201).json({ message: "Utilizador criado com sucesso", user: safeUser(newUser) });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login de funcionário
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password]
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login bem sucedido
   *       401:
   *         description: Credenciais inválidas
   */
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username e senha são obrigatórios" });
    }

    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );

      io.emit("userLoggedIn", { username: user.username });
      res.json({ token, user: safeUser(user) });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  /**
   * @swagger
   * /auth/login-admin:
   *   post:
   *     summary: Login de administrador
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password]
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login bem sucedido
   *       403:
   *         description: Acesso negado
   */
  router.post("/login-admin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username e senha são obrigatórios" });
    }

    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      io.emit("adminLoggedIn", { username: user.username });
      res.json({ token, user: safeUser(user) });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  /**
   * @swagger
   * /auth/all:
   *   get:
   *     summary: Lista todos os utilizadores (requer admin)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de utilizadores
   */
  router.get("/all", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "username", "email", "role"],
      });
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /auth/{id}:
   *   get:
   *     summary: Retorna um utilizador específico
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Utilizador encontrado
   *       404:
   *         description: Utilizador não encontrado
   */
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ["id", "username", "email", "role"],
      });
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /auth/update-role/{id}:
   *   patch:
   *     summary: Atualiza o papel de um utilizador (requer admin)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [role]
   *             properties:
   *               role:
   *                 type: string
   *                 enum: [user, admin]
   *     responses:
   *       200:
   *         description: Papel atualizado com sucesso
   */
  router.patch("/update-role/:id", authenticateToken, requireAdmin, async (req, res) => {
    const { role } = req.body;
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }
      user.role = role;
      await user.save();
      io.emit("userRoleUpdated", safeUser(user));
      res.json({ message: "Papel atualizado com sucesso", user: safeUser(user) });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /auth/delete/{id}:
   *   delete:
   *     summary: Elimina um utilizador (requer admin)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Utilizador eliminado com sucesso
   */
  router.delete("/delete/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }
      await OrderGroup.update({ userId: null }, { where: { userId: req.params.id } });
      await user.destroy();
      io.emit("userDeleted", { id: req.params.id });
      res.json({ message: "Utilizador eliminado com sucesso" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};
