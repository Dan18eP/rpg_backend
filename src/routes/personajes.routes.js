const { Router } = require('express');
const router = Router();

// controllers
const {
    crearPersonaje,
    obtenerPersonajes,
    obtenerPersonajePorId,
    actualizarPersonaje,
    eliminarPersonaje
} = require('../controllers/personajes.controller');

// CRUD

// Crear
router.post('/', crearPersonaje);

// Listar todos
router.get('/', obtenerPersonajes);

// Obtener por ID
router.get('/:id', obtenerPersonajePorId);

// Actualizar
router.put('/:id', actualizarPersonaje);

// Eliminar
router.delete('/:id', eliminarPersonaje);

module.exports = router;