const { Router } = require('express');
const router = Router();

// controllers
const {
    crear,
    listar,
    obtenerPorId,
    actualizar,
    eliminar
} = require('../controllers/personajes.controller');

// CRUD

// Crear
router.post('/', crear);

// Listar todos
router.get('/', listar);

// Obtener por ID
router.get('/:id', obtenerPorId);

// Actualizar
router.put('/:id', actualizar);

// Eliminar
router.delete('/:id', eliminar);

module.exports = router;