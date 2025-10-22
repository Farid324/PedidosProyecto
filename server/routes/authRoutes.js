// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // ojo: ../
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login/admin', authController.loginAdmin);
router.post('/login/cajero', authController.loginCajero);
router.post('/logout', authMiddleware, authController.logoutCajero);

module.exports = router;