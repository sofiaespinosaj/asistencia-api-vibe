const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

async function crearEstudiante(codigo = 'EST10001') {
  const res = await request(app)
    .post('/api/estudiantes')
    .send({ codigo, nombre: 'Test', apellido: 'User', email: `${codigo.toLowerCase()}@example.com` });

  return res.body.estudiante;
}

function fechaManana() {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return manana.toISOString().split('T')[0];
}

describe('Pruebas de asistencias y reportes', () => {
  beforeAll(async () => {
    await app.dbReady;
  });

  beforeEach(async () => {
    db.exec(`
      DELETE FROM asistencias;
      DELETE FROM estudiantes;
      DELETE FROM sqlite_sequence WHERE name IN ('asistencias', 'estudiantes');
    `);
  });

  test('Registro de asistencia valida con estado presente', async () => {
    const estudiante = await crearEstudiante('EST20001');

    const res = await request(app)
      .post('/api/asistencias')
      .send({
        estudiante_id: estudiante.id,
        fecha: '2026-01-10',
        estado: 'presente',
        observacion: 'Sin novedades',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('asistencia');
  });

  test('Registro de asistencia valida con estado ausente', async () => {
    const estudiante = await crearEstudiante('EST20002');

    const res = await request(app)
      .post('/api/asistencias')
      .send({
        estudiante_id: estudiante.id,
        fecha: '2026-01-11',
        estado: 'ausente',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('asistencia');
  });

  test('Registro de asistencia valida con estado justificada', async () => {
    const estudiante = await crearEstudiante('EST20003');

    const res = await request(app)
      .post('/api/asistencias')
      .send({
        estudiante_id: estudiante.id,
        fecha: '2026-01-12',
        estado: 'justificada',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('asistencia');
  });

  test('Rechazo de estado no permitido (tardanza)', async () => {
    const estudiante = await crearEstudiante('EST20004');

    const res = await request(app)
      .post('/api/asistencias')
      .send({
        estudiante_id: estudiante.id,
        fecha: '2026-01-13',
        estado: 'tardanza',
      });

    expect(res.statusCode).toBe(400);
  });

  test('Rechazo de fecha futura', async () => {
    const estudiante = await crearEstudiante('EST20005');

    const res = await request(app)
      .post('/api/asistencias')
      .send({
        estudiante_id: estudiante.id,
        fecha: fechaManana(),
        estado: 'presente',
      });

    expect(res.statusCode).toBe(400);
  });

  test('Rechazo de asistencia duplicada mismo estudiante y misma fecha', async () => {
    const estudiante = await crearEstudiante('EST20006');
    const payload = {
      estudiante_id: estudiante.id,
      fecha: '2026-01-14',
      estado: 'presente',
    };

    await request(app).post('/api/asistencias').send(payload);
    const second = await request(app).post('/api/asistencias').send(payload);

    expect(second.statusCode).toBe(409);
  });

  test('Rechazo cuando faltan campos obligatorios en el payload', async () => {
    const estudiante = await crearEstudiante('EST20007');

    const res = await request(app)
      .post('/api/asistencias')
      .send({ estudiante_id: estudiante.id, estado: 'presente' });

    expect(res.statusCode).toBe(400);
  });

  test('Reporte de ausentismo cuando no hay datos', async () => {
    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('estudiantes');
    expect(Array.isArray(res.body.estudiantes)).toBe(true);
    expect(res.body.estudiantes).toHaveLength(0);
  });

  test('Reporte de ausentismo con varios estudiantes registrados', async () => {
    const estudiantes = [];
    for (let i = 0; i < 6; i += 1) {
      const est = await crearEstudiante(`EST${30001 + i}`);
      estudiantes.push(est);
    }

    const cargas = [
      { est: estudiantes[0], ausencias: 5 },
      { est: estudiantes[1], ausencias: 4 },
      { est: estudiantes[2], ausencias: 3 },
      { est: estudiantes[3], ausencias: 2 },
      { est: estudiantes[4], ausencias: 1 },
      { est: estudiantes[5], ausencias: 0 },
    ];

    for (const { est, ausencias } of cargas) {
      for (let i = 1; i <= ausencias; i += 1) {
        const dia = String(i).padStart(2, '0');
        await request(app).post('/api/asistencias').send({
          estudiante_id: est.id,
          fecha: `2026-02-${dia}`,
          estado: 'ausente',
        });
      }

      await request(app).post('/api/asistencias').send({
        estudiante_id: est.id,
        fecha: '2026-03-01',
        estado: 'presente',
      });
    }

    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.estudiantes)).toBe(true);
    expect(res.body.estudiantes.length).toBeLessThanOrEqual(5);

    if (res.body.estudiantes.length > 1) {
      const primero = res.body.estudiantes[0].total_ausencias;
      const ultimo = res.body.estudiantes[res.body.estudiantes.length - 1].total_ausencias;
      expect(primero).toBeGreaterThanOrEqual(ultimo);
    }
  });
});
