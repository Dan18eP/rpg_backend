const pool = require('../db');

// Funciones base
const calcularAtaque = (p) => p.fuerza;

const calcularDefensa = (p) => {
    return Math.abs(p.defensa - p.agilidad) + p.conocimiento;
};

const ejecutarAtaque = (atacante, defensor) => {
    let logExtra = null;

    // EVASIÓN (AGILIDAD)
    const probEvasion = (defensor.agilidad / 100) * 0.30; // Máximo 30% de evasión
    if (Math.random() < probEvasion) {
        return { 
            danio: 0, 
            evento: `${defensor.nombre} esquivó el ataque de ${atacante.nombre}` 
        };
    }

    // BASE 
    let ataque = atacante.fuerza;
    let defensa = (defensor.defensa * 0.7) + (defensor.agilidad * 0.3) + (defensor.conocimiento * 0.3);

    let danio = ataque * (100 / (100 + defensa))

    let danioBase = danio;

    // VARIACIÓN RANDOM
    danio *= (0.85 + Math.random() * 0.3);

    // CRÍTICO POR MAGIA
    if ((atacante.magia + atacante.agilidad) > 140 && Math.random() < 0.25) {
        danio *= 1.3;
        logExtra = `${atacante.nombre} lanzó un ataque mágico crítico`;
    }

    // BONUS POR CONOCIMIENTO
    danio *= (1 + (atacante.conocimiento / 100) * 0.2);

    return {
        danio: Math.floor(danio),
        danioBase: Math.floor(danioBase),
        critico: logExtra !== null,
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

        let vidaP1 = 200;
        let vidaP2 = 200;

        let log = [];

        // Combate por rondas
        let ronda = 1;

        let atacante = p1.agilidad >= p2.agilidad ? p1 : p2;
        let defensor = atacante === p1 ? p2 : p1;

        let staminaP1 = 100;
        let staminaP2 = 100;

        let danioTotalP1 = 0;
        let danioTotalP2 = 0;

        while (vidaP1 > 0 && vidaP2 > 0) {

            const atkA = ejecutarAtaque(atacante, defensor);

            // atacante hace daño
            // defensor recibe daño

            if (defensor.id === p1.id) {
                vidaP1 -= atkA.danio;

                danioTotalP2 += atkA.danio;
                staminaP2 -= atkA.danio * 0.1;

            } else {
                vidaP2 -= atkA.danio;

                danioTotalP1 += atkA.danio;
                staminaP1 -= atkA.danio * 0.1;
            }

            log.push(`--- Ronda ${ronda} ---`);
            log.push(`${atacante.nombre} ataca a ${defensor.nombre}`);
            if (atkA.evento) {
                log.push(atkA.evento);
            }

            if (atkA.danio > 0) {
                if (atkA.critico) {
                    log.push(`${defensor.nombre} recibe ${atkA.danio} de daño (crítico, base: ${atkA.danioBase})`);
                } else {
                    log.push(`${defensor.nombre} recibe ${atkA.danio} de daño`);
                }
            }


            if (vidaP1 <= 0 || vidaP2 <= 0) break;

            const atkB = ejecutarAtaque(defensor, atacante);

            // atacante recibe daño
            // defensor hace daño

            if (atacante.id === p1.id) {
                vidaP1 -= atkB.danio;

                danioTotalP2 += atkB.danio;
                staminaP2 -= atkB.danio * 0.1;
                
            } else {
                vidaP2 -= atkB.danio;

                danioTotalP1 += atkB.danio;
                staminaP1 -= atkB.danio * 0.1;
            }

            log.push(`${defensor.nombre} ataca a ${atacante.nombre}`);

            if (atkB.evento) {
                log.push(atkB.evento);
            }

            if (atkB.danio > 0) {
                if (atkB.critico) {
                    log.push(`${atacante.nombre} recibe ${atkB.danio} de daño (crítico, base: ${atkB.danioBase})`);
                } else {
                    log.push(`${atacante.nombre} recibe ${atkB.danio} de daño`);
                }
            }

            ronda++;
        }

        staminaP1 = Math.max(staminaP1, 0);
        staminaP2 = Math.max(staminaP2, 0);

        // Determinar ganador
        let ganador = vidaP1 > vidaP2 ? p1 : p2;

        log.push(`${ganador.nombre} ha vencido a ${
            ganador.id === p1.id ? p2.nombre : p1.nombre
        }`);

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