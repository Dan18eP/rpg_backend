const pool = require('../db');

const poderes = {
    Asta: ["Black Slash", "Anti-Magic Slash"],
    Yuno: ["Spirit Storm", "Wind Blade"],
    Noelle: ["Sea Dragon Roar", "Valkyrie Armor"],
    Yami: ["Dark Cloaked Slash", "Dimension Slash"],
    Luck: ["Lightning Strike", "Thunder God Boots"],
    Magna: ["Fireball", "Explosive Flame"],
    Julius: ["Time Stop", "Chrono Blast"],
    Mereoleona: ["Calidos Brachium", "Hellfire Incarnate"],
    Fuegoleon: ["Fire Lion Roar", "Crimson Flame"],
    Finral: ["Spatial Portal", "Fallen Angel Gate"]
};

const verResultados = async () => {
    const result = await pool.query(`
        SELECT 
            b.id,
            p1.nombre AS personaje1,
            p2.nombre AS personaje2,
            g.nombre AS ganador,
            b.vida_p1,
            b.vida_p2,
            b.resumen,
            b.created_at
        FROM batallas b
        JOIN personajes p1 ON b.personaje1_id = p1.id
        JOIN personajes p2 ON b.personaje2_id = p2.id
        JOIN personajes g ON b.ganador_id = g.id
        ORDER BY b.id DESC
    `);

    return result.rows;
};

const verResultadosPorId = async (id) => {
    const result = await pool.query(`
        SELECT 
            b.id,
            p1.nombre AS personaje1,
            p2.nombre AS personaje2,
            g.nombre AS ganador,
            b.vida_p1,
            b.vida_p2,
            b.resumen,
            b.created_at
        FROM batallas b
        JOIN personajes p1 ON b.personaje1_id = p1.id
        JOIN personajes p2 ON b.personaje2_id = p2.id
        JOIN personajes g ON b.ganador_id = g.id
        WHERE b.id = $1
    `, [id]);

    return result.rows[0];
};

const calcularAtaque = (p) => p.fuerza;

const calcularDefensa = (p) => {
    return Math.abs(p.defensa - p.agilidad) + p.conocimiento;
};

const ejecutarAtaque = (atacante, defensor, stamina) => {
    let logExtra = null;

    const probEvasion = (defensor.agilidad / 100) * 0.30;
    if (Math.random() < probEvasion) {
        return { 
            danio: 0,
            danioBase: atacante.fuerza, 
            critico: false,
            evento: `${defensor.nombre} esquivó el ataque de ${atacante.nombre}` 
        };
    }

    let ataque = atacante.fuerza;
    let defensa = 
(defensor.defensa * 0.7) + (defensor.agilidad * 0.3) + (defensor.conocimiento * 0.3);
    let danio = ataque * (100 / (100 + defensa));
    let danioBase = danio;

    danio = Math.max(5, danio);

    danio *= (0.85 + Math.random() * 0.2);

    let probCritico = 0.15 + (atacante.conocimiento / 100) * 0.3;

    probCritico *= (stamina / 100);

    if (Math.random() < probCritico) {
        danio *= 1.3;
        logExtra = `💥 ${atacante.nombre} lanzó un ataque crítico`;
    }

    danio *= (1 + (atacante.conocimiento / 100) * 0.2);

    const factorStamina = Math.max(0.2, stamina / 100);
    danio *= factorStamina;

    danio = Math.max(5, danio);
    

    return {
        danio: Math.floor(danio),
        danioBase: Math.floor(danioBase),
        critico: logExtra !== null,
        evento: logExtra
    };
};

const simularBatallaService = (p1, p2) => {

    let vidaP1 = 200;
    let vidaP2 = 200;

    let log = [];
    let ronda = 1;

    let atacante = p1.agilidad >= p2.agilidad ? p1 : p2;
    let defensor = atacante === p1 ? p2 : p1;

    let staminaP1 = 100;
    let staminaP2 = 100;

    let danioTotalP1 = 0;
    let danioTotalP2 = 0;

    const obtenerPoderRandom = (nombre) => {
    const lista = poderes[nombre] || ["Ataque básico"];
    return lista[Math.floor(Math.random() * lista.length)];
    };

    

    while (vidaP1 > 0 && vidaP2 > 0) {

        log.push(`--- Ronda ${ronda} ---`);


        // 1. Obtener stamina del atacante actual
        let staminaActual = atacante.id === p1.id ? staminaP1 : staminaP2;
        let curacion = Math.floor(Math.random() * 10) + 5;

        // 2. Decidir si descansa
        if (staminaActual < 70 && Math.random() < 0.5) {
            // DESCANSO
            if (atacante.id === p1.id) {
                staminaP1 = Math.min(100, staminaP1 + 10);
                vidaP1 = Math.min(200, vidaP1 + curacion);
            } else {
                staminaP2 = Math.min(100, staminaP2 + 10);
                vidaP2 = Math.min(200, vidaP2 + curacion);
            }


            log.push(`${atacante.nombre} descansa ⚡ y recupera +10 de stamina y ${curacion} de vida ❤️`);
        } else {
            // ATAQUE
            const atkA = ejecutarAtaque(atacante, defensor, staminaActual);

            if (defensor.id === p1.id) {
                vidaP1 -= atkA.danio;
                danioTotalP2 += atkA.danio;
            } else {
                vidaP2 -= atkA.danio;
                danioTotalP1 += atkA.danio;
            }

            const costoStaminaA = 5 + atkA.danioBase * 0.08;

            if (atacante.id === p1.id) {
                staminaP1 -= costoStaminaA;
            } else {
                staminaP2 -= costoStaminaA;
            }

            staminaP1 = Math.max(0, staminaP1);
            staminaP2 = Math.max(0, staminaP2);

            const poderA = obtenerPoderRandom(atacante.nombre);
            log.push(`${atacante.nombre} usa ${poderA} contra ${defensor.nombre}`);

            if (atkA.evento) {
                log.push(atkA.evento);
            }

            let textoA = `${defensor.nombre} recibe ${atkA.danio} de daño`;

            if (atkA.critico) {
                textoA += ` 💥 CRÍTICO (base: ${atkA.danioBase})`;
            }

            log.push(textoA);
        }

        if (vidaP1 <= 0 || vidaP2 <= 0) break;

        // ===== TURNO DEFENSOR =====
        let staminaDefensor = defensor.id === p1.id ? staminaP1 : staminaP2;

        if (staminaDefensor < 70 && Math.random() < 0.5) {
            // DESCANSO
            if (defensor.id === p1.id) {
                staminaP1 = Math.min(100, staminaP1 + 10);
                vidaP1 = Math.min(200, vidaP1 + curacion);
            } else {
                staminaP2 = Math.min(100, staminaP2 + 10);
                vidaP2 = Math.min(200, vidaP2 + curacion);
            }

            log.push(`${defensor.nombre} descansa⚡ y recupera +10 stamina y ${curacion} de vida ❤️`);
        } else {
            // ATAQUE
            const atkB = ejecutarAtaque(defensor, atacante, staminaDefensor);

            if (atacante.id === p1.id) {
                vidaP1 -= atkB.danio;
                danioTotalP2 += atkB.danio;
            } else {
                vidaP2 -= atkB.danio;
                danioTotalP1 += atkB.danio;
        
            }

            const costoStaminaB = 5 + atkB.danioBase * 0.08;

            if (defensor.id === p1.id) {
                staminaP1 -= costoStaminaB;
            } else {
                staminaP2 -= costoStaminaB;
            }

            staminaP1 = Math.max(0, staminaP1);
            staminaP2 = Math.max(0, staminaP2);

            const poderB = obtenerPoderRandom(defensor.nombre);
            log.push(`${defensor.nombre} usa ${poderB} contra ${atacante.nombre}`);

            if (atkB.evento) {
                log.push(atkB.evento);
            }

            let textoB = `${atacante.nombre} recibe ${atkB.danio} de daño`;

            if (atkB.critico) {
                textoB += ` 💥 CRÍTICO (base: ${atkB.danioBase})`;
            }

            log.push(textoB);
        }

        // Intercambiar roles
        [atacante, defensor] = [defensor, atacante];

        // AVANZA LA RONDA
        ronda++;

        // recuperación pasiva
        staminaP1 = Math.min(100, staminaP1 + 2);
        staminaP2 = Math.min(100, staminaP2 + 2);
    }

    let ganador = vidaP1 > vidaP2 ? p1 : p2;

    log.push(`${ganador.nombre} ha vencido a ${
        ganador.id === p1.id ? p2.nombre : p1.nombre
    }`);



    return {
        ganador,
        vidaP1,
        vidaP2,
        log,
        ronda,
        staminaP1: Math.max(staminaP1, 0),
        staminaP2: Math.max(staminaP2, 0),
        danioTotalP1,
        danioTotalP2
    };
};





module.exports = {
    simularBatallaService,
    verResultados,
    verResultadosPorId
};