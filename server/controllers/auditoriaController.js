// server/controllers/auditoriaController.js
const { Auditoria } = require('../models');
const { Op } = require('sequelize');

const createLog = async (req, res) => {
  try {
    const { usuario_id, nombre_usuario, accion, turno, detalles } = req.body;
    
    if (!usuario_id || !nombre_usuario || !accion) {
      return res.status(400).json({ success: false, error: 'Faltan datos obligatorios' });
    }

    const log = await Auditoria.create({
      usuario_id,
      nombre_usuario,
      accion,
      turno,
      detalles
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Error registrando auditoría:', error);
    res.status(500).json({ success: false, error: 'Error registrando auditoría' });
  }
};

const getLogsRecientes = async (req, res) => {
  try {
    const { date } = req.query; // format YYYY-MM-DD
    let whereClause = {};

    if (date) {
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      whereClause.createdAt = {
        [Op.between]: [startOfDay, endOfDay]
      };
    } else {
      // Por defecto, ultimas 24 horas
      const yesterday = new Date(new Date() - 24 * 60 * 60 * 1000);
      whereClause.createdAt = {
        [Op.gte]: yesterday
      };
    }

    const logs = await Auditoria.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error obteniendo historial de auditoría:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo historial' });
  }
};

module.exports = {
  createLog,
  getLogsRecientes
};
