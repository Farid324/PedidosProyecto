// server/routes/menuRoutes.js  
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/categorias', menuController.getCategorias);
router.post('/categorias', menuController.createCategoria);

router.get('/productos', menuController.getProductos);
router.get('/productos/:id', menuController.getProductoById);
router.post('/productos', menuController.createProducto);
router.put('/productos/:id', menuController.updateProducto);
router.delete('/productos/:id', menuController.deleteProducto);

module.exports = router;