# API RPG - Sistema de Batallas (Black Clover)

API REST desarrollada con Node.js, Express y PostgreSQL para la gestión de personajes y simulación de batallas en un juego de rol (RPG), inspirada en el universo de Black Clover.

---

## Descripción

Este proyecto implementa un sistema backend que permite:

- Gestionar personajes con atributos RPG
- Simular combates entre personajes
- Aplicar lógica de combate basada en estadísticas
- Generar resultados detallados con métricas y narrativa

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

El sistema implementa una lógica basada en atributos:

### Ataque
AT = Fuerza

### Defensa
DEF = |Defensa - Agilidad| + Conocimiento

### Mecánicas avanzadas

- 🌀 **Evasión:** basada en la agilidad del defensor
- ✨ **Ataques críticos:** influenciados por la magia
- 🧠 **Bonus estratégico:** basado en conocimiento
- 🎲 **Variación de daño:** aleatoriedad en cada ataque
- 🔁 **Combate por rondas**
- 💪 **Stamina:** reduce rendimiento según el daño recibido

---

## Resultado de batalla

Ejemplo de respuesta:

```json
{
  "ganador": "Yuno",
  "rondas": 3,
  "personaje1": {
    "nombre": "Asta",
    "vida_final": 0,
    "danio_total": 60,
    "stamina": 70
  },
  "personaje2": {
    "nombre": "Yuno",
    "vida_final": 40,
    "danio_total": 120,
    "stamina": 65
  },
  "historial": [
    "Ronda 1: Asta hace 20 daño a Yuno",
    "Yuno esquivó el ataque",
    "Ronda 2: Yuno lanzó un ataque mágico crítico",
    "Yuno ha vencido a Asta"
  ]
}
```

---

## Características destacadas

- Arquitectura REST
- Persistencia en PostgreSQL
- Lógica de negocio basada en atributos
- Simulación dinámica de combate
- Manejo de errores
- Código modular y escalable

---

## Estado del proyecto

- CRUD completo
- Sistema de batallas funcional
- Mecánicas avanzadas implementadas

---

## Autor

**Daniel Echeverría**  
Estudiante de Ingeniería de Sistemas

---

## Licencia

Uso académico
