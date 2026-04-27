const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

describe('Pruebas de estudiantes', () => {
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

  test('Creacion exitosa con codigo valido EST00123 y nombre completo', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .send({
        codigo: 'EST00123',
        nombre: 'Ana',
        apellido: 'Gomez',
        email: 'ana.gomez@example.com',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('estudiante');
    expect(res.body.estudiante).toMatchObject({
      codigo: 'EST00123',
      nombre: 'Ana',
      apellido: 'Gomez',
      email: 'ana.gomez@example.com',
    });
  });

  test('Rechazo cuando el codigo tiene formato invalido (abc)', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .send({ codigo: 'abc', nombre: 'Luis', apellido: 'Perez' });

    expect(res.statusCode).toBe(400);
  });

  test('Rechazo cuando el codigo no empieza por EST (ALU00123)', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .send({ codigo: 'ALU00123', nombre: 'Luis', apellido: 'Perez' });

    expect(res.statusCode).toBe(400);
  });

  test('Rechazo cuando el codigo EST tiene menos de 5 digitos (EST99)', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .send({ codigo: 'EST99', nombre: 'Carla', apellido: 'Mora' });

    expect(res.statusCode).toBe(400);
  });

  test('Rechazo de estudiante duplicado enviando el mismo codigo dos veces', async () => {
    const payload = {
      codigo: 'EST00999',
      nombre: 'Pablo',
      apellido: 'Diaz',
      email: 'pablo@example.com',
    };

    const first = await request(app).post('/api/estudiantes').send(payload);
    const second = await request(app).post('/api/estudiantes').send(payload);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(409);
  });

  test('Listado cuando no existe ningun estudiante registrado', async () => {
    const res = await request(app).get('/api/estudiantes');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('estudiantes');
    expect(Array.isArray(res.body.estudiantes)).toBe(true);
    expect(res.body.estudiantes).toHaveLength(0);
  });

  test('Listado despues de crear un estudiante', async () => {
    await request(app).post('/api/estudiantes').send({
      codigo: 'EST00111',
      nombre: 'Maria',
      apellido: 'Lopez',
      email: 'maria@example.com',
    });

    const res = await request(app).get('/api/estudiantes');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.estudiantes)).toBe(true);
    expect(res.body.estudiantes.length).toBeGreaterThanOrEqual(1);
  });

  test('Consulta por ID de un estudiante que si existe', async () => {
    const crear = await request(app).post('/api/estudiantes').send({
      codigo: 'EST00112',
      nombre: 'Julia',
      apellido: 'Ruiz',
      email: 'julia@example.com',
    });

    const id = crear.body.estudiante.id;
    const res = await request(app).get(`/api/estudiantes/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('estudiante');
    expect(res.body.estudiante.id).toBe(id);
    expect(res.body.estudiante.codigo).toBe('EST00112');
  });

  test('Consulta por ID de un estudiante que no existe', async () => {
    const res = await request(app).get('/api/estudiantes/99999');

    expect(res.statusCode).toBe(404);
  });

  test('Creacion con payload vacio (sin enviar ningun campo)', async () => {
    const res = await request(app).post('/api/estudiantes').send({});

    expect(res.statusCode).toBe(400);
  });
});
