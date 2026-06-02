// server/routes/configuracionRoutes.js
const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');

router.get('/:clave', configuracionController.getConfiguracion);
router.put('/:clave', configuracionController.setConfiguracion);

module.exports = router;
