const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const e = require("express");

const router = express.Router();

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
  const { username, email, password } = req.body;
  try {
    const newUser = await User.create({
      username,
      email,
      password,
    });
    res
      .status(201)
      .json({ message: "Utilizador registrado com sucesso", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
      { expiresIn: "1h" }
    );
    console.log(token);
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

    await user.destroy();
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
    res.status(200).json({ message: "Papel atualizado com sucesso", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
