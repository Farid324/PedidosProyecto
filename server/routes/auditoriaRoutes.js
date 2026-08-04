// server/routes/auditoriaRoutes.js
const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');

router.post('/', auditoriaController.createLog);
router.get('/recientes', auditoriaController.getLogsRecientes);

module.exports = router;
