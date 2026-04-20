const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// En producción (Fly.io) DATA_DIR apunta al volumen montado en /data
// En local usa la raíz del proyecto
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const DB_PATH  = path.join(DATA_DIR, 'asistencia.db');

let db; // instancia sql.js (operaciones síncronas via wrapper)

// ── Inicialización asíncrona ────────────────────────────────────────────────
async function initDB() {
  const SQL = await initSqlJs();

  // Cargar BD existente o crear una nueva
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Base de datos cargada desde:', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ Base de datos nueva creada en:', DB_PATH);
  }

  // Activar foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  // Crear esquema
  db.run(`
    CREATE TABLE IF NOT EXISTS estudiantes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo    TEXT    NOT NULL UNIQUE,
      nombre    TEXT    NOT NULL,
      apellido  TEXT    NOT NULL,
      email     TEXT,
      creado_en TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS asistencias (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      estudiante_id INTEGER NOT NULL,
      fecha         TEXT    NOT NULL,
      estado        TEXT    NOT NULL,
      observacion   TEXT,
      creado_en     TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
      UNIQUE (estudiante_id, fecha)
    );

    CREATE INDEX IF NOT EXISTS idx_asistencias_estudiante ON asistencias(estudiante_id);
    CREATE INDEX IF NOT EXISTS idx_asistencias_fecha      ON asistencias(fecha);
  `);

  // Guardar la BD en disco tras cada escritura (cada 500ms si hubo cambios)
  persistirPeriodicamente();

  return db;
}

// ── Persistencia periódica ──────────────────────────────────────────────────
function persistir() {
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (err) {
    console.error('Error al guardar la BD:', err.message);
  }
}

function persistirPeriodicamente() {
  setInterval(persistir, 2000); // Guarda cada 2 segundos si hay cambios
}

// ── Helpers que imitan la API síncrona de better-sqlite3 ───────────────────
//   Esto permite que los routers usen la misma API sin cambios.

/**
 * Convierte los resultados de sql.js al formato [{col: val, ...}, ...]
 */
function filas(resultado) {
  if (!resultado || resultado.length === 0) return [];
  const [{ columns, values }] = resultado;
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

/**
 * Ejecuta una sentencia de escritura (INSERT / UPDATE / DELETE).
 * Devuelve { lastInsertRowid, changes }.
 */
function run(sql, params = []) {
  db.run(sql, params);
  const [{ values: [[lastId]] }] = db.exec('SELECT last_insert_rowid()');
  const [{ values: [[changes]] }] = db.exec('SELECT changes()');
  persistir(); // Guardar después de cada escritura
  return { lastInsertRowid: lastId, changes };
}

/**
 * Devuelve todas las filas que coincidan con la consulta.
 */
function all(sql, params = []) {
  const result = db.exec(sql, params);
  return filas(result);
}

/**
 * Devuelve la primera fila o undefined.
 */
function get(sql, params = []) {
  const rows = all(sql, params);
  return rows[0];
}

/**
 * Ejecuta sentencias DDL / múltiples sentencias.
 */
function exec(sql) {
  db.exec(sql);
  persistir();
}

module.exports = { initDB, run, all, get, exec };
