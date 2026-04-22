const pool = require('../db');

// Obtener todos los personajes
    const obtenerPersonajes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM personajes ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener personajes' });
    }
};

// Obtener por ID
const obtenerPersonajePorId = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM personajes WHERE id = $1', [id]);

        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Personaje no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener personaje' });
    }
};

// Crear personaje
const crearPersonaje = async (req, res) => {
    const { nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento } = req.body;

    try {
        const result = await pool.query(
        `INSERT INTO personajes (nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento)
        VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear personaje' });
    }
};

// Actualizar personaje
const actualizarPersonaje = async (req, res) => {
    const { id } = req.params;
    const { nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento } = req.body;

    try {
        const result = await pool.query(
        `UPDATE personajes 
        SET nombre=$1, color_piel=$2, raza=$3, fuerza=$4, agilidad=$5, defensa=$6, conocimiento=$7
        WHERE id=$8 RETURNING *`,
        [nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento, id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Personaje no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar personaje' });
    }
};

// Eliminar personaje
const eliminarPersonaje = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
        'DELETE FROM personajes WHERE id = $1 RETURNING *',
        [id]
        );

        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Personaje no encontrado' });
        }

        res.json({ mensaje: 'Personaje eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar personaje' });
    }
};

module.exports = {
    obtenerPersonajes,
    obtenerPersonajePorId,
    crearPersonaje,
    actualizarPersonaje,
    eliminarPersonaje
};