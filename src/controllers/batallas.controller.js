const pool = require('../db');

// Funciones base
const calcularAtaque = (p) => p.fuerza;

const calcularDefensa = (p) => {
    return Math.abs(p.defensa - p.agilidad) + p.conocimiento;
};

const ejecutarAtaque = (atacante, defensor) => {
    let logExtra = null;

    // EVASIÓN (AGILIDAD)
    const probEvasion = (defensor.agilidad / 100) * 0.3;
    if (Math.random() < probEvasion) {
        return { danio: 0, evento: `${defensor.nombre} esquivó el ataque` };
    }

    // BASE 
    let ataque = atacante.fuerza;
    let defensa = Math.abs(defensor.defensa - defensor.agilidad) + defensor.conocimiento;

    let danio = Math.abs(ataque - defensa);

    // VARIACIÓN RANDOM
    danio *= (0.85 + Math.random() * 0.3);

    // CRÍTICO POR MAGIA
    if (atacante.magia > 70 && Math.random() < 0.3) {
        danio *= 1.5;
        logExtra = `${atacante.nombre} lanzó un ataque mágico crítico`;
    }

    // BONUS POR CONOCIMIENTO
    danio *= (1 + (atacante.conocimiento / 100) * 0.2);

    return {
        danio: Math.floor(danio),
        evento: logExtra
    };
};

// Batalla
const simularBatalla = async (req, res) => {
    const { personaje1_id, personaje2_id } = req.body;

    try {
        // Obtener personajes
        const p1Result = await pool.query(
        'SELECT * FROM personajes WHERE id = $1',
            [personaje1_id]
        );

        const p2Result = await pool.query(
        'SELECT * FROM personajes WHERE id = $1',
            [personaje2_id]
        );

        if (p1Result.rows.length === 0 || p2Result.rows.length === 0) {
            return res.status(404).json({ error: 'Uno de los personajes no existe' });
        }

        const p1 = p1Result.rows[0];
        const p2 = p2Result.rows[0];

        let vidaP1 = 100;
        let vidaP2 = 100;

        let log = [];

        // Combate por rondas
        let ronda = 1;

        let atacante = p1.agilidad >= p2.agilidad ? p1 : p2;
        let defensor = atacante === p1 ? p2 : p1;

        while (vidaP1 > 0 && vidaP2 > 0) {

            const atkA = ejecutarAtaque(atacante, defensor);

            if (defensor.id === p1.id) {
                vidaP1 -= atkA.danio;
            } else {
                vidaP2 -= atkA.danio;
            }

            log.push(
                `Ronda ${ronda}: ${
                    atkA.evento || `${atacante.nombre} hace ${atkA.danio} daño a ${defensor.nombre}`
                }`
            );

            if (vidaP1 <= 0 || vidaP2 <= 0) break;

            const atkB = ejecutarAtaque(defensor, atacante);

            if (atacante.id === p1.id) {
                vidaP1 -= atkB.danio;
            } else {
                vidaP2 -= atkB.danio;
            }

            log.push(
                atkB.evento || `${defensor.nombre} hace ${atkB.danio} daño`
            );

            ronda++;
        }

        // Determinar ganador
        let ganador = vidaP1 > vidaP2 ? p1 : p2;

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
                log.join(' | ')
            ]
        );

            // Respuesta
            res.json({
            ganador: ganador.nombre,
            vida_final_p1: Math.max(vidaP1, 0),
            vida_final_p2: Math.max(vidaP2, 0),
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