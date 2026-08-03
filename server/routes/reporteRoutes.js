// server/routes/reporteRoutes.js
const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Reportes del cajero actual
router.get('/mi-reporte', reporteController.getMiReporteDiario);

// Reportes generales (solo admin)
router.get('/diario', roleMiddleware(['admin']), reporteController.getReporteDiario);
router.get('/mensual', roleMiddleware(['admin']), reporteController.getReporteMensual);
router.get('/cajeros', roleMiddleware(['admin']), reporteController.getReporteCajeros);
router.get('/admin-ventas', roleMiddleware(['admin']), reporteController.getReportesAdministrador);
router.get('/admin-dashboard', roleMiddleware(['admin']), reporteController.getDashboardAdministrador);
router.delete('/limpiar-historial', roleMiddleware(['admin']), reporteController.limpiarHistorialAntiguo);

module.exports = router;