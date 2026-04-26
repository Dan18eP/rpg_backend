const pool = require('../db');

// Crear personaje
const crearPersonaje = async (data) => {
    const { nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento } = data;

    const result = await pool.query(
        `INSERT INTO personajes (nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento]
    );

    return result.rows[0];
};

// Obtener todos los personajes
const obtenerPersonajes = async () => {

    const result = await pool.query('SELECT * FROM personajes ORDER BY id');
    return result.rows;
};

// Obtener por ID
const obtenerPersonajePorId = async (id) => {
    const result = await pool.query(
        'SELECT * FROM personajes WHERE id = $1', [id]
    );
    return result.rows[0];
};


// Actualizar personaje
const actualizarPersonaje = async (id, data) => {
    const { nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento } = data;

    const result = await pool.query(
            `UPDATE personajes 
        SET nombre=$1, color_piel=$2, raza=$3, fuerza=$4, agilidad=$5, defensa=$6, conocimiento=$7
        WHERE id=$8 RETURNING *`,
            [nombre, color_piel, raza, fuerza, agilidad, defensa, conocimiento, id]
        );

        return result.rows[0];
};

// Eliminar personaje
const eliminarPersonaje = async (id) => {
        const result = await pool.query(
            'DELETE FROM personajes WHERE id = $1 RETURNING *',
            [id]
        );

        return result.rows[0];

};

module.exports = {
    crearPersonaje,
    obtenerPersonajes,
    obtenerPersonajePorId,
    actualizarPersonaje,
    eliminarPersonaje
};