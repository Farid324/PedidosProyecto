// server/routes/facturaRoutes.js
const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/facturaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', facturaController.getFacturas);
router.get('/:id', facturaController.getFacturaById);
router.post('/', facturaController.createFactura);
router.put('/:id/pagar', facturaController.pagarFactura);
router.put('/:id/anular', facturaController.anularFactura);

module.exports = router;