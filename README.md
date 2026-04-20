# API de Asistencia Estudiantil

API REST en **Node.js + Express** con base de datos **SQLite** (via `sql.js`) para gestionar asistencia estudiantil.

## Requisitos

- Node.js ≥ 16
- npm

## Instalación y arranque

```bash
npm install
npm start
```

El servidor queda en **http://localhost:3000**

---

## Endpoints

### 1. `POST /api/estudiantes` → HTTP 200
Crea un nuevo estudiante.

**Body:**
```json
{
  "codigo":   "EST00123",
  "nombre":   "Ana",
  "apellido": "García",
  "email":    "ana@ejemplo.com"
}
```

---

### 2. `GET /api/estudiantes` → HTTP 200
Lista todos los estudiantes.

---

### 3. `GET /api/estudiantes/:id` → HTTP 200
Devuelve un estudiante por ID con resumen de asistencia.

---

### 4. `POST /api/asistencias` → HTTP 201
Registra la asistencia de un estudiante.

**Body:**
```json
{
  "estudiante_id": 1,
  "fecha":         "2026-04-20",
  "estado":        "presente",
  "observacion":   "Opcional"
}
```

---

### 5. `GET /api/asistencias/estudiante/:id` → HTTP 200
Lista todas las asistencias de un estudiante con estadísticas.

---

### 6. `GET /api/reportes/ausentismo` → HTTP 200
Top 5 estudiantes con más ausencias y su porcentaje de ausentismo.

---

## Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Código único | Formato `EST` + 5 dígitos exactos (ej: `EST00123`) |
| Estado válido | Solo `"presente"`, `"ausente"` o `"justificada"` |
| Sin duplicados | No se puede registrar dos asistencias al mismo estudiante en la misma fecha |
| Fecha válida | Formato `YYYY-MM-DD`, no puede ser futura |

## Estructura del proyecto

```
vibecoding/
├── src/
│   ├── app.js              # Punto de entrada
│   ├── database.js         # SQLite via sql.js (sin compilación nativa)
│   ├── validaciones.js     # Validaciones reutilizables
│   └── routes/
│       ├── estudiantes.js
│       ├── asistencias.js
│       └── reportes.js
├── asistencia.db           # Generado automáticamente al arrancar
└── package.json
```
