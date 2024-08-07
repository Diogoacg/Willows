const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const e = require("express");

const router = express.Router();

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
   *           description: Nome de Utilizador
   *         email:
   *           type: string
   *           description: Endereço de email
   *         password:
   *           type: string
   *           description: Senha do Utilizador
   *         role:
   *           type: string
   *           description: Papel do Utilizador
   */

  /**
   * @swagger
   * /auth/signup:
   *   post:
   *     summary: Registra um novo Utilizador
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       201:
   *         description: Utilizador registrado com sucesso
   *       400:
   *         description: Erro ao registrar o Utilizador
   */
  router.post("/signup", async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
      const newUser = await User.create({
        username,
        email,
        password,
        role,
      });
      // Emitir um evento com o Socket.IO
      io.emit("userCreated", newUser);
      res
        .status(201)
        .json({ message: "Utilizador registrado com sucesso", user: newUser });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // login para todos os utilizadores na app cliente
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Faz login de um Utilizador
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
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
   *       404:
   *         description: Utilizador não encontrado
   *       400:
   *         description: Erro ao fazer login
   */
  // Rota de login
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username e senha são obrigatórios" });
    }

    try {
      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      const passwordHashed = await bcrypt.hash(password, 10);
      console.log(password);
      console.log(passwordHashed);
      console.log(user.password);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "999y" }
      );
      // Emitir um evento com o Socket.IO
      io.emit("userLoggedIn", user);
      console.log(token);
      res.json({ token });
    } catch (error) {
      console.error("Erro ao tentar fazer login:", error); // Log do erro para depuração
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  /**
   * @swagger
   * /auth/login-admin:
   *   post:
   *     summary: Faz login de um Utilizador com papel de Admin
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
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
   *       404:
   *         description: Utilizador não encontrado
   *       400:
   *         description: Erro ao fazer login
   *       403:
   *         description: Acesso negado
   */

  // Rota de login para administradores

  router.post("/login-admin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username e senha são obrigatórios" });
    }

    try {
      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      // Emitir um evento com o Socket.IO
      io.emit("adminLoggedIn", user);
      res.json({ token });
    } catch (error) {
      console.error("Erro ao tentar fazer login:", error); // Log do erro para depuração
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  /**
   * @swagger
   * /auth/delete/{id}:
   *   delete:
   *     summary: Deleta um Utilizador
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do Utilizador
   *     responses:
   *       200:
   *         description: Utilizador deletado com sucesso
   *       404:
   *         description: Utilizador não encontrado
   */
  router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }

      // Set userId to NULL or a default value for associated order groups
      await OrderGroup.update({ userId: null }, { where: { userId: id } });

      await user.destroy();

      // Emitir um evento com o Socket.IO
      io.emit("userDeleted", user);
      res.status(200).json({ message: "Utilizador deletado com sucesso" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * @swagger
   * /auth/update-role/{id}:
   *   patch:
   *     summary: Atualiza o papel de um Utilizador
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do Utilizador
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - role
   *             properties:
   *               role:
   *                 type: string
   *                 description: Novo papel do Utilizador
   *     responses:
   *       200:
   *         description: Papel atualizado com sucesso
   *       404:
   *         description: Utilizador não encontrado
   *       400:
   *         description: Erro ao atualizar papel
   */
  router.patch("/update-role/:id", async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }

      user.role = role;
      await user.save();
      // Emitir um evento com o Socket.IO
      io.emit("userRoleUpdated", user);
      res.status(200).json({ message: "Papel atualizado com sucesso", user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Rota para obter todos os utilizadores
  /**
   * @swagger
   * /auth/all:
   *   get:
   *     summary: Retorna todos os Utilizadores
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Lista de Utilizadores
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       400:
   *         description: Erro ao buscar Utilizadores
   */
  router.get("/all", async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Rota para obter um utilizador específico
  /**
   * @swagger
   * /auth/{id}:
   *   get:
   *     summary: Retorna um Utilizador específico
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do Utilizador
   *     responses:
   *       200:
   *         description: Utilizador encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: Utilizador não encontrado
   *       400:
   *         description: Erro ao buscar Utilizador
   */
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
      }

      // Emitir um evento com o Socket.IO
      io.emit("userFound", user);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
};
