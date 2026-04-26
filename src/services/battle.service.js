const calcularAtaque = (p) => p.fuerza;

const calcularDefensa = (p) => {
    return Math.abs(p.defensa - p.agilidad) + p.conocimiento;
};

const ejecutarAtaque = (atacante, defensor) => {
    let logExtra = null;

    const probEvasion = (defensor.agilidad / 100) * 0.30;
    if (Math.random() < probEvasion) {
        return { 
            danio: 0, 
            evento: `${defensor.nombre} esquivó el ataque de ${atacante.nombre}` 
        };
    }

    let ataque = atacante.fuerza;
    let defensa = (defensor.defensa * 0.7) + (defensor.agilidad * 0.3) + (defensor.conocimiento * 0.3);

    let danio = ataque * (100 / (100 + defensa));
    let danioBase = danio;

    danio *= (0.85 + Math.random() * 0.2);

    const probCritico = 0.15 + (atacante.conocimiento / 100) * 0.3;

    if (Math.random() < probCritico) {
        danio *= 1.3;
        logExtra = `💥 ${atacante.nombre} lanzó un ataque crítico`;
    }

    danio *= (1 + (atacante.conocimiento / 100) * 0.2);

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

    while (vidaP1 > 0 && vidaP2 > 0) {

        const atkA = ejecutarAtaque(atacante, defensor);

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

        let texto = `${defensor.nombre} recibe ${atkA.danio} de daño`;

        if (atkA.critico) {
            texto += ` 💥 CRÍTICO (base: ${atkA.danioBase})`;
        }

        log.push(texto);

        if (vidaP1 <= 0 || vidaP2 <= 0) break;

        const atkB = ejecutarAtaque(defensor, atacante);

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

        if (atkB.evento) log.push(atkB.evento);

        if (atkB.danio === 0 && !atkB.evento) {
            log.push("El ataque no hizo daño");
        }

        if (atkB.danio > 0) {
            log.push(
                atkB.critico
                ? `💥 ${atacante.nombre} recibe ${atkB.danio} de daño (crítico, base: ${atkB.danioBase})`
                : `${atacante.nombre} recibe ${atkB.danio} de daño`
            );
        }

        ronda++;
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
    simularBatallaService
};