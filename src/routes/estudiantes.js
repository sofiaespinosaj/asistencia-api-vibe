const express = require('express');
const router = express.Router();
const db = require('../database');
const { validarCodigo } = require('../validaciones');

// POST /api/estudiantes  → HTTP 200
router.post('/', (req, res) => {
  const { codigo, nombre, apellido, email } = req.body;

  if (!codigo || !nombre || !apellido) {
    return res.status(400).json({
      error: 'Los campos codigo, nombre y apellido son obligatorios',
    });
  }

  if (!validarCodigo(codigo)) {
    return res.status(400).json({
      error: 'El código debe tener el formato EST seguido de exactamente 5 dígitos (ej: EST00123)',
    });
  }

  const existe = db.get(
    'SELECT id FROM estudiantes WHERE codigo = ?',
    [codigo]
  );
  if (existe) {
    return res.status(409).json({
      error: `Ya existe un estudiante con el código ${codigo}`,
    });
  }

  const info = db.run(
    'INSERT INTO estudiantes (codigo, nombre, apellido, email) VALUES (?, ?, ?, ?)',
    [codigo, nombre.trim(), apellido.trim(), email ? email.trim() : null]
  );

  const estudiante = db.get(
    'SELECT * FROM estudiantes WHERE id = ?',
    [info.lastInsertRowid]
  );

  return res.status(200).json({ mensaje: 'Estudiante creado exitosamente', estudiante });
});

// GET /api/estudiantes  → HTTP 200
router.get('/', (_req, res) => {
  const estudiantes = db.all(
    'SELECT * FROM estudiantes ORDER BY apellido, nombre'
  );
  return res.status(200).json({ total: estudiantes.length, estudiantes });
});

// GET /api/estudiantes/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const estudiante = db.get('SELECT * FROM estudiantes WHERE id = ?', [id]);
  if (!estudiante) {
    return res.status(404).json({ error: `No se encontró el estudiante con id ${id}` });
  }

  const resumen = db.all(
    'SELECT estado, COUNT(*) AS total FROM asistencias WHERE estudiante_id = ? GROUP BY estado',
    [id]
  );

  return res.status(200).json({ estudiante, resumen_asistencia: resumen });
});

module.exports = router;
