# API RPG - Sistema de Batallas (Black Clover)

API REST desarrollada con Node.js, Express y PostgreSQL para la gestión de personajes y simulación de batallas en un juego de rol (RPG), inspirada en el universo de Black Clover.

---

## Descripción

Este proyecto implementa un sistema backend que permite:

- Gestionar personajes con atributos RPG
- Simular combates entre personajes
- Aplicar lógica de combate basada en estadísticas
- Generar resultados detallados con historial de batalla

---

## Tecnologías utilizadas

- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)
- dotenv

---

## Estructura del proyecto

```text
rpg_backend/
│
├── src/
│   ├── routes/
│   │   ├── personajes.routes.js
│   │   └── batallas.routes.js
│   │
│   ├── controllers/
│   │   ├── personajes.controller.js
│   │   └── batallas.controller.js
│   │
│   ├── services/
|   |   |── battle.service.js
|   |   └── personajes.service.js
│   │
│   ├── db.js
│   └── app.js
│
├── .env
├── package.json
└── README.md
```

---

## Configuración

### 1. Clonar el repositorio

```bash
git clone <https://github.com/Dan18eP/rpg_backend>
cd rpg_backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env`:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password
DB_DATABASE=rpg_db
DB_PORT=5432
PORT=3000
```

### 4. Ejecutar el servidor

```bash
node src/app.js
```

---

## Base de Datos

### Tabla: `personajes`

```sql
CREATE TABLE personajes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    color_piel VARCHAR(50),
    raza VARCHAR(50),
    fuerza INT,
    agilidad INT,
    defensa INT,
    conocimiento INT,
    magia INT
);
```

### Tabla: `batallas`

```sql
CREATE TABLE batallas (
    id SERIAL PRIMARY KEY,
    personaje1_id INT,
    personaje2_id INT,
    ganador_id INT,
    vida_p1 INT,
    vida_p2 INT,
    resumen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Endpoints

### Personajes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/personajes` |  Crear personaje |
| `GET` | `/personajes` |  Listar personajes |
| `GET` | `/personajes/:id` |  Obtener por ID |
| `PUT` | `/personajes/:id` |  Actualizar personaje |
| `DELETE` | `/personajes/:id` |  Eliminar personaje |

### Batallas

Historial de Batallas

#### Obtener todas las batallas

```http
GET /batallas/resultados
```

Retorna todas las batallas registradas, ordenadas de la más reciente a la más antigua.

**Ejemplo de respuesta:**

```json
[
    {
        "id": 141,
        "personaje1": "Asta",
        "personaje2": "Yami",
        "ganador": "Yami",
        "vida_p1": 0,
        "vida_p2": 1,
        "resumen": "...",
        "created_at": "2026-04-26T05:28:22.189Z"
    },
    {
        "id": 140,
        "personaje1": "Asta",
        "personaje2": "Yuno",
        "ganador": "Asta",
        "vida_p1": 79,
        "vida_p2": 0,
        "resumen": "...",
        "created_at": "2026-04-26T05:27:54.089Z"
    },
    .
    .
    .
```

#### Obtener batalla por ID

```http
GET /batallas/resultados/:id
```

Retorna el detalle de una batalla específica.

**Ejemplo de respuesta:**

```json
{
  "id": 5,
  "personaje1": "Yuno",
  "personaje2": "Noelle",
  "ganador": "Yuno",
  "vida_p1": 73,
  "vida_p2": 0,
  "resumen": "...",
  "created_at": "2026-04-26T20:10:00.000Z"
}
```

#### Simular batalla

```http
POST /batallas
```

**Body:**

```json
{
  "personaje1_id": 1,
  "personaje2_id": 2
}
```

---

## Lógica de combate

El sistema implementa una simulación por rondas donde ambos personajes actúan antes de avanzar de ronda.

### Ataque

AT = FUERZA * (100 / (100 + DEF))

El daño base depende de la fuerza del atacante y la defensa del oponente:

La defensa combina:
- Defensa
- Agilidad
- Conocimiento

### Defensa
(defensor.defensa * 0.7) + (defensor.agilidad * 0.3) + (defensor.conocimiento * 0.3);

### Mecánicas avanzadas

-  **Evasión:** Probabilidad basada en la agilidad del defensor
→ Si esquiva, el daño es 0 pero el atacante pierde stamina.
-  **Ataques críticos:** Probabilidad influenciada por el conocimiento y la stamina
→ Aumentan el daño total.
-  **Bonus estratégico:** basado en conocimiento
-  **Variación de daño:** Factor aleatorio para evitar resultados predecibles.
-  **Combate por rondas**: Cada ronda incluye acción de ambos personajes
Solo avanza la ronda cuando ambos han actuado.
-  **Stamina:** 
  - Cada ataque consume stamina (aunque falle o sea esquivado).
  - A menor stamina → menor daño.
  - Recuperación pasiva por ronda.

---

## Resultado de batalla

Ejemplo de respuesta:

```json
{
  "ganador": "Yuno",
  "rondas": 7,
  "personaje1": {
    "nombre": "Yuno",
    "vida_final": 73,
    "danio_total": 213,
    "stamina": 79
  },
  "personaje2": {
    "nombre": "Noelle",
    "vida_final": 0,
    "danio_total": 138,
    "stamina": 70
  },
  "historial": [
    "--- Ronda 1 ---",
    "Yuno ataca a Noelle",
    "Noelle recibe 42 de daño",
    "Noelle ataca a Yuno",
    "Yuno esquivó el ataque",
    "...",
    "Yuno ha vencido a Noelle"
  ]
}
```

---

## Características destacadas

- Arquitectura REST limpia.
- Separación por capas (routes, controllers, services).
- Persistencia en PostgreSQL.
- Sistema de combate dinámico.
- Uso de lógica probabilística (críticos, evasión).
- Simulación con historial detallado.

---

## Estado del proyecto

- CRUD de personajes
- Sistema de batallas funcional
- Mecánicas avanzadas implementadas
- Mejoras futuras (pendiente):
  - Poderes especiales por personaje
  - Animaciones o visualización frontend
  - Balanceo de combate

---

## Autor

**Daniel Echeverría**  
Estudiante de Ingeniería de Sistemas

---

## Licencia

Uso académico
