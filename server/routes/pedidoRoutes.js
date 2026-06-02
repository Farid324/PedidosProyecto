// server/routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', pedidoController.getPedidos);
router.get('/mesas-ocupadas', pedidoController.getMesasOcupadas);
router.get('/mesa/:mesa', pedidoController.getPedidoByMesa);
router.get('/:id', pedidoController.getPedidoById);
router.post('/', pedidoController.createPedido);
router.put('/:id', pedidoController.updatePedido);
router.put('/:id/items', pedidoController.updatePedidoItems);
router.put('/:id/estado', pedidoController.updateEstadoPedido);
router.put('/:id/finalizar', pedidoController.finalizarPedido);
router.delete('/:id', pedidoController.cancelPedido);

module.exports = router;