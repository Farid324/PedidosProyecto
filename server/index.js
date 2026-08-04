const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

// Importar middleware de error
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
// Configuración de CORS - acepta peticiones desde Electron (file://) y desarrollo (localhost)
app.use(cors({
  origin: function(origin, callback) {
    // Permitir peticiones sin origin (file://, mismo origen, curl, etc.)
    if (!origin) return callback(null, true);
    // Permitir cualquier localhost
    if (origin.startsWith('http://localhost')) return callback(null, true);
    callback(null, true); // En app local de escritorio, permitir todo
  },
  credentials: true 
}));

// 🔥 SOLUCIÓN DEL ERROR "PayloadTooLargeError"
// Aumentamos el límite de 100kb (default) a 50mb para soportar imágenes en Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/config', configuracionRoutes);
app.use('/api/auditoria', auditoriaRoutes);

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
    
    // Desactivar restricciones FK temporalmente para permitir actualizaciones de esquema
    await sequelize.query('PRAGMA foreign_keys = OFF');
    
    // Sincronizar modelos sin "alter" para evitar crasheos de SQLite con constraints
    await sequelize.sync();
    
    // Reactivar restricciones FK
    await sequelize.query('PRAGMA foreign_keys = ON');

    console.log('✅ Base de datos sincronizada');
    
    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 API disponible en http://localhost:${PORT}/api`);
    });

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`⚠️ El puerto ${PORT} ya está en uso. Asumiendo servidor activo.`);
      } else {
        console.error('❌ Error en el servidor:', e);
      }
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    // process.exit(1); // Eliminado para no cerrar la app de Electron
  }
};

startServer();