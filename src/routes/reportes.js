const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/reportes/ausentismo  → top 5 estudiantes con más ausencias
router.get('/ausentismo', (_req, res) => {
  const top5 = db.all(`
    SELECT
      e.id,
      e.codigo,
      e.nombre,
      e.apellido,
      e.email,
      COUNT(a.id)  AS total_ausencias,
      (SELECT COUNT(*) FROM asistencias WHERE estudiante_id = e.id AND estado = 'justificada') AS total_justificadas,
      (SELECT COUNT(*) FROM asistencias WHERE estudiante_id = e.id AND estado = 'presente')    AS total_presentes,
      (SELECT COUNT(*) FROM asistencias WHERE estudiante_id = e.id)                            AS total_registros
    FROM estudiantes e
    JOIN asistencias a ON a.estudiante_id = e.id
    WHERE a.estado = 'ausente'
    GROUP BY e.id
    ORDER BY total_ausencias DESC
    LIMIT 5
  `);

  const resultado = top5.map((row, index) => ({
    posicion: index + 1,
    ...row,
    porcentaje_ausentismo: row.total_registros > 0
      ? parseFloat(((row.total_ausencias / row.total_registros) * 100).toFixed(2))
      : 0,
  }));

  return res.status(200).json({
    reporte: 'Top 5 estudiantes con más ausencias',
    generado_en: new Date().toISOString(),
    total_en_reporte: resultado.length,
    estudiantes: resultado,
  });
});

module.exports = router;
