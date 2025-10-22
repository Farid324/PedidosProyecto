// server/middlewares/roleMiddleware.js
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para acceder a este recurso' 
      });
    }

    next();
  };
};

module.exports = roleMiddleware;