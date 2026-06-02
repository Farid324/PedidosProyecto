// server/controllers/configuracionController.js
const { Configuracion } = require('../models');

// Obtener configuración por clave
const getConfiguracion = async (req, res) => {
  try {
    const { clave } = req.params;
    const config = await Configuracion.findOne({ where: { clave } });

    if (!config) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo configuración' });
  }
};

// Guardar/actualizar configuración
const setConfiguracion = async (req, res) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;

    let config = await Configuracion.findOne({ where: { clave } });

    if (config) {
      await config.update({ valor });
    } else {
      config = await Configuracion.create({ clave, valor });
    }

    res.json({ success: true, data: config, message: 'Configuración guardada' });
  } catch (error) {
    console.error('Error guardando configuración:', error);
    res.status(500).json({ success: false, error: 'Error guardando configuración' });
  }
};

module.exports = { getConfiguracion, setConfiguracion };
