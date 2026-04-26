const service= require('../services/personajes.service');

// Crear
const crear = async (req, res) => {
    try {
        const personaje = await service.crearPersonaje(req.body);
        res.json(personaje);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear personaje' });
    }

};

// Listar
const listar = async (req, res) => {
    const personajes = await service.obtenerPersonajes();
    res.json(personajes);
};

// Por ID
const obtenerPorId = async (req, res) => {
    const personaje = await service.obtenerPersonajePorId(req.params.id);

    if (!personaje) {
        return res.status(404).json({ error: 'No encontrado' });
    }

    res.json(personaje);
};

// Actualizar
const actualizar = async (req, res) => {
    const personaje = await service.actualizarPersonaje(req.params.id, req.body);

    if (!personaje) {
        return res.status(404).json({ error: 'No encontrado' });
    }

    res.json(personaje);
};

// Eliminar
const eliminar = async (req, res) => {
    const personaje = await service.eliminarPersonaje(req.params.id);

    if (!personaje) {
        return res.status(404).json({ error: 'No encontrado' });
    }

    res.json({ mensaje: 'Eliminado' });
};

module.exports = {
    crear,
    listar,
    obtenerPorId,
    actualizar,
    eliminar
};