const express = require('express');
const path = require('path');
const { initDB } = require('./database');

const estudiantesRouter = require('./routes/estudiantes');
const asistenciasRouter = require('./routes/asistencias');
const reportesRouter = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Rutas ─────────────────────────────────────
app.use('/api/estudiantes', estudiantesRouter);
app.use('/api/asistencias', asistenciasRouter);
app.use('/api/reportes', reportesRouter);

app.get('/', (_req, res) => {
  res.json({
    nombre: 'API de Asistencia Estudiantil',
    version: '1.0.0',
    endpoints: [
      'POST   /api/estudiantes',
      'GET    /api/estudiantes',
      'GET    /api/estudiantes/:id',
      'POST   /api/asistencias',
      'GET    /api/asistencias/estudiante/:id',
      'GET    /api/reportes/ausentismo',
    ],
  });
});

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Arranque: primero inicializar la BD, luego escuchar ───────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log('   Presiona Ctrl+C para detener');
    });
  })
  .catch((err) => {
    console.error('❌ Error al inicializar la base de datos:', err);
    process.exit(1);
  });

module.exports = app;
