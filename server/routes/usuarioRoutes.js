// server/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Obtener todos los usuarios
router.get('/', usuarioController.getUsuarios);

// Crear un nuevo usuario
router.post('/', usuarioController.createUsuario);

// Actualizar usuario existente
router.put('/:id', usuarioController.updateUsuario);

// Desactivar (eliminar lógico) usuario
router.delete('/:id', usuarioController.deleteUsuario);

module.exports = router;
