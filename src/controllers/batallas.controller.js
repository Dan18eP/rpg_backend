const pool = require('../db');

const { simularBatallaService } = require('../services/battle.service');

const simularBatalla = async (req, res) => {
    const { personaje1_id, personaje2_id } = req.body;

    try {
        const p1Result = await pool.query('SELECT * FROM personajes WHERE id = $1', [personaje1_id]);
        const p2Result = await pool.query('SELECT * FROM personajes WHERE id = $1', [personaje2_id]);

        if (p1Result.rows.length === 0 || p2Result.rows.length === 0) {
            return res.status(404).json({ error: 'Uno de los personajes no existe' });
        }

        const p1 = p1Result.rows[0];
        const p2 = p2Result.rows[0];

        const resultado = simularBatallaService(p1, p2);
        const {
            ganador,
            vidaP1,
            vidaP2,
            log,
            ronda,
            staminaP1,
            staminaP2,
            danioTotalP1,
            danioTotalP2
        } = resultado;

        // Guardar en DB
        await pool.query(
            `INSERT INTO batallas 
            (personaje1_id, personaje2_id, ganador_id, vida_p1, vida_p2, resumen)
            VALUES ($1,$2,$3,$4,$5,$6)`,
            [
                p1.id,
                p2.id,
                ganador.id,
                Math.max(vidaP1, 0),
                Math.max(vidaP2, 0),
                JSON.stringify(log)
            ]
        );

        // Respuesta
        res.json({
            ganador: ganador.nombre,
            rondas: ronda,
            personaje1: {
                nombre: p1.nombre,
                vida_final: Math.max(vidaP1, 0),
                danio_total: danioTotalP1,
                stamina: Math.floor(staminaP1)
            },
            personaje2: {
                nombre: p2.nombre,
                vida_final: Math.max(vidaP2, 0),
                danio_total: danioTotalP2,
                stamina: Math.floor(staminaP2)
            },
            historial: log
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la batalla' });
    }
};

module.exports = {
    simularBatalla
};