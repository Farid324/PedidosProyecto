// server/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({ 
      success: false, 
      error: 'Error de validación', 
      details: errors 
    });
  }

  // Error de duplicado
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ 
      success: false, 
      error: 'El registro ya existe' 
    });
  }

  // Error general
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;