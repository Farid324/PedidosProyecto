// server/controllers/authController.js
const { Usuario, AccesoCajero } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-pos-secret-key-2024';

// Login de Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario admin
    const usuario = await Usuario.findOne({ 
      where: { email, rol: 'admin' } 
    });

    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales incorrectas' 
      });
    }

    // Verificar contraseña
    const validPassword = await usuario.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales incorrectas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        carnet: usuario.carnet,
        edad: (usuario.edad && usuario.anio_actualizacion_edad) ? usuario.edad + (new Date().getFullYear() - usuario.anio_actualizacion_edad) : usuario.edad,
        telefono: usuario.telefono,
        foto: usuario.foto,
        activo: usuario.activo
      },
      token
    });

  } catch (error) {
    console.error('Error en login admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error en el servidor' 
    });
  }
};

// Login de Cajero (sin contraseña)
const loginCajero = async (req, res) => {
  try {
    const { nombre, password, turno } = req.body;
    const dispositivo = req.headers['user-agent'];
 
    if (!nombre || !password || !turno) {
      return res.status(400).json({ 
        success: false, 
        error: 'Usuario, contraseña y turno son requeridos' 
      });
    }
    
    // Buscar el usuario cajero por nombre o correo
    const cajero = await Usuario.findOne({ 
      where: { 
        [Op.or]: [
          { nombre: nombre.trim() },
          { email: nombre.trim() }
        ],
        rol: 'cajero', 
        activo: true 
      } 
    });
 
    if (!cajero) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario o contraseña incorrectos' 
      });
    }
 
    // Verificar contraseña
    const validPassword = await cajero.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario o contraseña incorrectos' 
      });
    }
 
    // Registrar acceso del cajero
    const acceso = await AccesoCajero.create({
      nombre_cajero: cajero.nombre,
      turno,
      dispositivo,
      fecha_ingreso: new Date()
    });
 
    // Generar token JWT con el turno incluido
    const token = jwt.sign(
      { 
        id: cajero.id,
        nombre: cajero.nombre,
        rol: 'cajero',
        turno,
        acceso_id: acceso.id
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
 
    res.json({
      success: true,
      user: {
        id: cajero.id,
        nombre: cajero.nombre,
        email: cajero.email,
        rol: cajero.rol,
        carnet: cajero.carnet,
        edad: (cajero.edad && cajero.anio_actualizacion_edad) ? cajero.edad + (new Date().getFullYear() - cajero.anio_actualizacion_edad) : cajero.edad,
        telefono: cajero.telefono,
        foto: cajero.foto,
        activo: cajero.activo,
        turno
      },
      token
    });
 
  } catch (error) {
    console.error('Error en login cajero:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error en el servidor' 
    });
  }
};

// Logout de Cajero (registrar salida)
const logoutCajero = async (req, res) => {
  try {
    const { acceso_id } = req.user;

    if (acceso_id) {
      await AccesoCajero.update(
        { fecha_salida: new Date() },
        { where: { id: acceso_id } }
      );
    }

    res.json({ 
      success: true, 
      message: 'Sesión cerrada correctamente' 
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al cerrar sesión' 
    });
  }
};

// Cambiar Turno de Cajero dinámicamente
const cambiarTurno = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nuevoTurno } = req.body;
    const { id, nombre, acceso_id, turno } = req.user;
    const dispositivo = req.headers['user-agent'];

    if (!nuevoTurno || !['AM', 'PM'].includes(nuevoTurno)) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Turno inválido' });
    }

    if (turno === nuevoTurno) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Ya estás en ese turno' });
    }

    // 1. Cerrar el acceso anterior
    if (acceso_id) {
      await AccesoCajero.update(
        { fecha_salida: new Date() },
        { where: { id: acceso_id }, transaction: t }
      );
    }

    // 2. Crear nuevo acceso para el nuevo turno
    const nuevoAcceso = await AccesoCajero.create({
      nombre_cajero: nombre,
      turno: nuevoTurno,
      dispositivo,
      fecha_ingreso: new Date()
    }, { transaction: t });

    // 3. Buscar información completa del cajero
    const cajero = await Usuario.findByPk(id, { transaction: t });

    await t.commit();

    // 4. Generar nuevo token JWT
    const token = jwt.sign(
      { 
        id: cajero.id,
        nombre: cajero.nombre,
        rol: 'cajero',
        turno: nuevoTurno,
        acceso_id: nuevoAcceso.id
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      user: {
        id: cajero.id,
        nombre: cajero.nombre,
        email: cajero.email,
        rol: cajero.rol,
        carnet: cajero.carnet,
        edad: (cajero.edad && cajero.anio_actualizacion_edad) ? cajero.edad + (new Date().getFullYear() - cajero.anio_actualizacion_edad) : cajero.edad,
        telefono: cajero.telefono,
        foto: cajero.foto,
        activo: cajero.activo,
        turno: nuevoTurno
      },
      token,
      message: `Turno cambiado a ${nuevoTurno} exitosamente`
    });

  } catch (error) {
    await t.rollback();
    console.error('Error al cambiar de turno:', error);
    res.status(500).json({ success: false, error: 'Error al procesar el cambio de turno' });
  }
};

// Crear usuario admin inicial (seed)
const createAdminUser = async (req, res) => {
  try {
    // Verificar si ya existe un admin
    const adminExists = await Usuario.findOne({ 
      where: { rol: 'admin' } 
    });

    if (adminExists) {
      return res.json({ 
        message: 'Ya existe un usuario administrador' 
      });
    }

    // Crear admin por defecto
    const admin = await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@restaurant.com',
      password: 'admin123',
      rol: 'admin'
    });

    res.json({
      success: true,
      message: 'Usuario administrador creado',
      credentials: {
        email: 'admin@restaurant.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Error creando admin:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creando administrador' 
    });
  }
};

// Obtener historial de accesos de cajeros
const getAccesosCajeros = async (req, res) => {
  try {
    const { fecha, cajero } = req.query;
    const where = {};

    // Filtrar por fecha si se proporciona
    if (fecha) {
      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fecha);
      fechaFin.setDate(fechaFin.getDate() + 1);
      
      where.fecha_ingreso = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    // Filtrar por cajero si se proporciona
    if (cajero) {
      where.nombre_cajero = {
        [Op.like]: `%${cajero}%`
      };
    }

    const accesos = await AccesoCajero.findAll({
      where,
      order: [['fecha_ingreso', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: accesos
    });

  } catch (error) {
    console.error('Error obteniendo accesos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error obteniendo historial' 
    });
  }
};

module.exports = {
  loginAdmin,
  loginCajero,
  logoutCajero,
  cambiarTurno,
  createAdminUser,
  getAccesosCajeros
};