const express = require('express');
const router = express.Router();
const db = require('../database');
const { validarFecha, ESTADOS_VALIDOS } = require('../validaciones');

// POST /api/asistencias
router.post('/', (req, res) => {
  const { estudiante_id, fecha, estado, observacion } = req.body;

  if (!estudiante_id || !fecha || !estado) {
    return res.status(400).json({
      error: 'Los campos estudiante_id, fecha y estado son obligatorios',
    });
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({
      error: `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`,
    });
  }

  const resultadoFecha = validarFecha(fecha);
  if (!resultadoFecha.valida) {
    return res.status(400).json({ error: resultadoFecha.mensaje });
  }

  const estudiante = db.get('SELECT id FROM estudiantes WHERE id = ?', [estudiante_id]);
  if (!estudiante) {
    return res.status(404).json({ error: `No se encontró el estudiante con id ${estudiante_id}` });
  }

  const duplicado = db.get(
    'SELECT id FROM asistencias WHERE estudiante_id = ? AND fecha = ?',
    [estudiante_id, fecha]
  );
  if (duplicado) {
    return res.status(409).json({
      error: `Ya existe un registro de asistencia para el estudiante ${estudiante_id} en la fecha ${fecha}`,
    });
  }

  const info = db.run(
    'INSERT INTO asistencias (estudiante_id, fecha, estado, observacion) VALUES (?, ?, ?, ?)',
    [estudiante_id, fecha, estado, observacion ? observacion.trim() : null]
  );

  const asistencia = db.get('SELECT * FROM asistencias WHERE id = ?', [info.lastInsertRowid]);

  return res.status(201).json({ mensaje: 'Asistencia registrada exitosamente', asistencia });
});

// GET /api/asistencias/estudiante/:id
router.get('/estudiante/:id', (req, res) => {
  const { id } = req.params;

  const estudiante = db.get('SELECT * FROM estudiantes WHERE id = ?', [id]);
  if (!estudiante) {
    return res.status(404).json({ error: `No se encontró el estudiante con id ${id}` });
  }

  const asistencias = db.all(
    'SELECT * FROM asistencias WHERE estudiante_id = ? ORDER BY fecha DESC',
    [id]
  );

  const stats = asistencias.reduce(
    (acc, a) => { acc[a.estado] = (acc[a.estado] || 0) + 1; return acc; },
    { presente: 0, ausente: 0, justificada: 0 }
  );

  return res.status(200).json({
    estudiante: { id: estudiante.id, codigo: estudiante.codigo, nombre: `${estudiante.nombre} ${estudiante.apellido}` },
    total_registros: asistencias.length,
    estadisticas: stats,
    asistencias,
  });
});

module.exports = router;
