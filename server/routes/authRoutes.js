// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // ojo: ../
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/login/admin', authController.loginAdmin);
router.post('/login/cajero', authController.loginCajero);
router.post('/logout', authMiddleware, authController.logoutCajero);
router.post('/cambiar-turno', authMiddleware, authController.cambiarTurno);
router.get('/accesos', authMiddleware, roleMiddleware(['admin']), authController.getAccesosCajeros);

module.exports = router;