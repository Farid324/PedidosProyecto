// server/controllers/usuarioController.js
const { Usuario, Pedido } = require('../models');
const { enviarCorreoBienvenida } = require('../utils/emailService');

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'carnet', 'edad', 'telefono', 'rol', 'activo', 'createdAt']
    });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los usuarios' });
  }
};

// Crear un nuevo usuario
const createUsuario = async (req, res) => {
  try {
    const { nombre, email, carnet, edad, telefono, rol } = req.body;

    if (!nombre || !email || !carnet) {
      return res.status(400).json({ success: false, message: 'Nombre, email y carnet son requeridos' });
    }

    // Verificar si el email o carnet ya existen
    const existingUser = await Usuario.findOne({ 
      where: { email } 
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
    }

    const existingCarnet = await Usuario.findOne({ 
      where: { carnet } 
    });
    if (existingCarnet) {
      return res.status(400).json({ success: false, message: 'El carnet ya está registrado' });
    }

    // La contraseña será automáticamente el carnet
    const password = carnet;

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      carnet,
      password, // el hash se hace en el beforeCreate
      edad: edad || null,
      telefono: telefono || null,
      rol: rol || 'cajero',
      activo: true
    });

    // Enviar correo de bienvenida
    await enviarCorreoBienvenida(email, nombre, carnet);

    // Remover el password del objeto devuelto
    const userResponse = nuevoUsuario.toJSON();
    delete userResponse.password;

    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: userResponse });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ success: false, message: 'Error al crear el usuario' });
  }
};

// Actualizar un usuario existente
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, carnet, edad, telefono, rol, activo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar si el email o carnet ya existen en OTRO usuario
    if (email && email !== usuario.email) {
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ success: false, message: 'El correo ya está en uso por otro usuario' });
    }

    if (carnet && carnet !== usuario.carnet) {
      const existingCarnet = await Usuario.findOne({ where: { carnet } });
      if (existingCarnet) return res.status(400).json({ success: false, message: 'El carnet ya está en uso por otro usuario' });
    }

    await usuario.update({
      nombre: nombre !== undefined ? nombre : usuario.nombre,
      email: email !== undefined ? email : usuario.email,
      carnet: carnet !== undefined ? carnet : usuario.carnet,
      edad: edad !== undefined ? edad : usuario.edad,
      telefono: telefono !== undefined ? telefono : usuario.telefono,
      rol: rol !== undefined ? rol : usuario.rol,
      activo: activo !== undefined ? activo : usuario.activo,
    });

    const userResponse = usuario.toJSON();
    delete userResponse.password;

    res.json({ success: true, message: 'Usuario actualizado exitosamente', data: userResponse });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
  }
};

// Eliminar (desactivar o borrar) usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario tiene ventas/pedidos asociados
    const tienePedidos = await Pedido.findOne({
      where: { cajero_nombre: usuario.nombre }
    });

    if (tienePedidos) {
      // Eliminación lógica (desactivar) porque tiene historial
      await usuario.update({ activo: false });
      res.json({ success: true, message: 'El usuario tiene ventas, por lo que fue desactivado (estado inactivo)' });
    } else {
      // Eliminación física (borrado completo) porque no tiene historial
      await usuario.destroy();
      res.json({ success: true, message: 'El usuario no tenía ventas y fue eliminado por completo de la base de datos' });
    }
  } catch (error) {
    console.error('Error al procesar eliminación de usuario:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la eliminación del usuario' });
  }
};

module.exports = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
