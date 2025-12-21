const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

// Importar middleware de error
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
// Configuración específica de CORS para el login desde el frontend
app.use(cors({
  origin: 'http://localhost:5173', // Permite conexión desde Vite
  credentials: true // Permite cookies/headers de autorización si fueran necesarios
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Restaurant POS API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida correctamente');
    
    // 🔥 FIX: Desactivar restricciones FK temporalmente
    // Esto evita el error "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed" al hacer cambios
    await sequelize.query('PRAGMA foreign_keys = OFF');

    // Sincronizar modelos con la base de datos
    // Usamos alter: true para intentar conservar datos, pero ahora protegido por el PRAGMA
    await sequelize.sync({ alter: true });
    
    // 🔥 FIX: Reactivar restricciones FK
    await sequelize.query('PRAGMA foreign_keys = ON');

    console.log('✅ Base de datos sincronizada');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 API disponible en http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();