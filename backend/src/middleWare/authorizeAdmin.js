// middleWare/authorizeAdmin.js
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log(req.user.role);
    return res.status(403).json({
      message: "Acesso negado. Permissão de administrador necessária.",
    });
  }
  next();
};

module.exports = authorizeAdmin;
