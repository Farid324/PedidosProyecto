const router = require('express').Router();
const menu = require('../controllers/menuController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

// Todas requieren estar logueado
router.use(auth);

// Categorías (solo admin para crear/editar/borrar)
router.get('/categorias', menu.getCategorias);
router.post('/categorias', role(['admin']), menu.createCategoria);
router.put('/categorias/:id', role(['admin']), menu.updateCategoria);
router.delete('/categorias/:id', role(['admin']), menu.deleteCategoria);

// Productos
router.get('/productos', menu.getProductos);
router.post('/productos', role(['admin']), menu.createProducto);
router.put('/productos/:id', role(['admin']), menu.updateProducto);
router.delete('/productos/:id', role(['admin']), menu.deleteProducto);
router.put('/productos/:id/disponible', role(['admin']), menu.setDisponibilidad);

module.exports = router;
