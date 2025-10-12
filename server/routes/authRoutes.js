// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.post('/login/admin', authController.loginAdmin);
router.post('/login/cajero', authController.loginCajero);
router.post('/seed/admin', authController.createAdminUser);

// Rutas protegidas
router.post('/logout', authMiddleware, authController.logoutCajero);
router.get('/accesos', authMiddleware, authController.getAccesosCajeros);

module.exports = router;