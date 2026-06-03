// server/controllers/usuarioController.js
const { Usuario, Pedido } = require('../models');
const { enviarCorreoBienvenida } = require('../utils/emailService');

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'carnet', 'edad', 'anio_actualizacion_edad', 'telefono', 'fecha_actualizacion_telefono', 'rol', 'activo', 'createdAt', 'foto']
    });
    
    const currentYear = new Date().getFullYear();
    const data = usuarios.map(u => {
      const userObj = u.toJSON();
      if (userObj.edad && userObj.anio_actualizacion_edad) {
        userObj.edad = userObj.edad + (currentYear - userObj.anio_actualizacion_edad);
      }
      return userObj;
    });

    res.json({ success: true, data });
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

    // Verificar si el nombre, email o carnet ya existen
    const existingNombre = await Usuario.findOne({ 
      where: { nombre } 
    });
    if (existingNombre) {
      return res.status(400).json({ success: false, message: 'El nombre de usuario ya está registrado' });
    }

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
      anio_actualizacion_edad: edad ? new Date().getFullYear() : null,
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
    const { nombre, email, carnet, edad, telefono, rol, activo, foto } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar si el nombre ya existe en OTRO usuario
    if (nombre && nombre !== usuario.nombre) {
      const existingNombre = await Usuario.findOne({ where: { nombre } });
      if (existingNombre) return res.status(400).json({ success: false, message: 'El nombre de usuario ya está en uso por otra persona' });
    }

    // Verificar si el email ya existe en OTRO usuario
    if (email && email !== usuario.email) {
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ success: false, message: 'El correo ya está en uso por otro usuario' });
    }

    // Regla 1: Carnet (solo se puede modificar si está vacío)
    if (carnet !== undefined && carnet !== usuario.carnet) {
      if (usuario.carnet) {
        return res.status(400).json({ success: false, message: 'El carnet no puede ser modificado una vez establecido' });
      }
      const existingCarnet = await Usuario.findOne({ where: { carnet } });
      if (existingCarnet) return res.status(400).json({ success: false, message: 'El carnet ya está en uso por otro usuario' });
    }

    // Regla 2: Teléfono (solo 1 vez al mes)
    let nuevaFechaTelefono = usuario.fecha_actualizacion_telefono;
    if (telefono !== undefined && telefono !== usuario.telefono) {
      if (usuario.fecha_actualizacion_telefono) {
        const fechaActual = new Date();
        const fechaAntigua = new Date(usuario.fecha_actualizacion_telefono);
        const diasDiferencia = (fechaActual - fechaAntigua) / (1000 * 60 * 60 * 24);
        if (diasDiferencia < 30) {
          return res.status(400).json({ success: false, message: 'El teléfono solo puede ser modificado una vez al mes' });
        }
      }
      nuevaFechaTelefono = new Date();
    }

    // Regla 3: Edad
    let nuevoAnioEdad = usuario.anio_actualizacion_edad;
    if (edad !== undefined && edad !== usuario.edad) {
      nuevoAnioEdad = new Date().getFullYear();
    }

    await usuario.update({
      nombre: nombre !== undefined ? nombre : usuario.nombre,
      email: email !== undefined ? email : usuario.email,
      carnet: carnet !== undefined ? carnet : usuario.carnet,
      edad: edad !== undefined ? edad : usuario.edad,
      anio_actualizacion_edad: nuevoAnioEdad,
      telefono: telefono !== undefined ? telefono : usuario.telefono,
      fecha_actualizacion_telefono: nuevaFechaTelefono,
      rol: rol !== undefined ? rol : usuario.rol,
      activo: activo !== undefined ? activo : usuario.activo,
      foto: foto !== undefined ? foto : usuario.foto,
    });

    const userResponse = usuario.toJSON();
    delete userResponse.password;

    // Calcular edad real a enviar al frontend
    if (userResponse.edad && userResponse.anio_actualizacion_edad) {
      const currentYear = new Date().getFullYear();
      userResponse.edad = userResponse.edad + (currentYear - userResponse.anio_actualizacion_edad);
    }

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

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const validPassword = await usuario.comparePassword(currentPassword);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    usuario.password = newPassword;
    await usuario.save();

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar la contraseña' });
  }
};

module.exports = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarPassword
};
