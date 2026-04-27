# PROMPTS.md — Registro de prompts utilizados

## Fase 1 — Vibe coding
Crea una API REST en Node.js con Express para gestionar asistencia estudiantil.
Elige tu la base de datos que prefieras.

ENDPOINTS REQUERIDOS (los 6):
1. POST   /api/estudiantes
2. GET    /api/estudiantes
3. GET    /api/estudiantes/:id
4. POST   /api/asistencias
5. GET    /api/asistencias/estudiante/:id
6. GET    /api/reportes/ausentismo        -> top 5 estudiantes con mas ausencias

REGLAS DE NEGOCIO:
- El campo codigo debe ser unico, formato EST seguido de exactamente 5 digitos (ej: EST00123)
- El campo estado en asistencia solo acepta: "presente", "ausente" o "justificada"
- No se puede registrar dos asistencias para el mismo estudiante en la misma fecha
- La fecha debe ser valida (YYYY-MM-DD) y no puede ser futura

VALIDACION DE RESPUESTAS:
- POST /api/estudiantes y GET /api/estudiantes deben responder con codigo HTTP 200

Que funcione en local con npm start. Dame el codigo completo.

## Fase 2 — Auditoría
Actua como un Auditor Senior de Software y realiza una evaluacion tecnica exhaustiva del codigo de este proyecto basandote en el archivo AUDITORIA.md que ya se encuentra en el repositorio. Tu mision es analizar el codigo fuente, la estructura y las dependencias para completar dicho archivo siguiendo un formato estricto. Por cada problema detectado, debes redactar un hallazgo con el formato: "## Hallazgo N — [Titulo]", seguido de viñetas para Severidad (alta/media/baja), Archivo/línea, Descripcion tecnica, Evidencia clara y el Impacto potencial. Un ejemplo del formato:

```markdown
## Hallazgo 1 — Validacion de codigo del estudiante
- **Severidad:** media
- **Archivo/línea:** src/routes/estudiantes.js, línea 23
- **Descripcion:** El endpoint POST /api/estudiantes no valida el patron EST\d{5}.
- **Evidencia:** envie POST con codigo "abc" y respondio 201.
- **Impacto:** datos inconsistentes en el sistema real.
```

Una vez documentados los hallazgos, debes completar la tabla de auditoria de 10 puntos:

Checklist de auditoria:

| # | Aspecto | Pregunta |
|---|---------|----------|
| 1 | Validacion de entrada | ¿Valida el formato del codigo del estudiante? ¿Rechaza fechas futuras? ¿Valida el enum del estado? |
| 2 | Manejo de errores | ¿Hay try/catch en las rutas? ¿Devuelve codigos HTTP correctos (400, 404, 409, 500)? |
| 3 | Inyeccion y seguridad | Si usa base de datos, ¿parametriza consultas? ¿Escapa entradas? ¿Tiene rate limiting? ¿CORS configurado? |
| 4 | Datos sensibles | ¿Expone informacion de estudiantes sin autenticacion? ¿Hay manejo de datos personales segun habeas data? |
| 5 | Estructura y mantenibilidad | ¿Separa rutas, controladores y logica? ¿O todo esta en index.js? ¿Los nombres son descriptivos? |
| 6 | Dependencias | ¿Que paquetes agrego? ¿Los necesita? ¿Tienen vulnerabilidades? Ejecuta npm audit. |
| 7 | Configuracion | ¿Hardcodea puertos o credenciales? ¿Usa variables de entorno? ¿Hay .env.example? |
| 8 | Idempotencia y duplicados | ¿Permite registrar dos asistencias iguales para el mismo estudiante y fecha? |
| 9 | Pruebas | ¿Genero alguna prueba automatizada? ¿O cero? |
| 10 | Documentacion | ¿El README explica como correrlo? ¿Hay comentarios utiles o vacios? |

asignando a cada uno el estado de CUMPLE, CUMPLE PARCIALMENTE o NO CUMPLE segun tus descubrimientos. Asegurate de ser sumamente especifico con las rutas de los archivos, priorizar fallos de seguridad como severidad alta y mantener la integridad del formato Markdown solicitado para que el reporte sea profesional y tecnico.

## Fase 3 — Pruebas retroactivas
Eres un ingeniero de software senior escribiendo pruebas retroactivas sobre una API REST en Node.js generada por IA. Tu mision es revelar bugs que el vibe coding dejo pasar.

ANTES DE ESCRIBIR CUALQUIER PRUEBA:
- Lee toda la estructura del proyecto
- Identifica como esta exportada la app (module.exports = app)
- Si app.listen() esta en el mismo archivo que las rutas, separalo:
  crea app.js que exporta la app y un server.js que hace el listen()
- Sin esta separacion, Supertest no puede levantar el servidor correctamente

CONFIGURACION:
1. Ejecuta: npm install --save-dev jest supertest
2. En package.json agrega: "scripts": { "test": "jest --verbose" }
3. Crea la carpeta tests/ con dos archivos:
   - tests/estudiantes.test.js
   - tests/asistencias.test.js

REGLA CRITICA PARA TODAS LAS PRUEBAS:
Cada prueba debe ser completamente independiente. Usa beforeEach para limpiar la base de datos antes de cada caso. Una prueba no puede depender de que otra haya corrido primero.

CASOS DE PRUEBA REQUERIDOS (minimo 15):

— Estudiantes (en estudiantes.test.js) —

1.  Creacion exitosa con codigo valido EST00123 y nombre completo
    -> espera status 200 y que la respuesta contenga el estudiante creado

2.  Rechazo cuando el codigo tiene formato invalido (ej: "abc")
    -> espera status 400

3.  Rechazo cuando el codigo no empieza por EST (ej: "ALU00123")
    -> espera status 400

4.  Rechazo cuando el codigo EST tiene menos de 5 digitos (ej: "EST99")
    -> espera status 400

5.  Rechazo de estudiante duplicado enviando el mismo codigo dos veces
    -> espera status 409 en la segunda peticion

6.  Listado cuando no existe ningun estudiante registrado
    -> espera status 200 y un array vacio

7.  Listado despues de crear un estudiante
    -> espera status 200 y un array con al menos un elemento

8.  Consulta por ID de un estudiante que si existe
    -> espera status 200 y los datos del estudiante

9.  Consulta por ID de un estudiante que no existe
    -> espera status 404

10. Creacion con payload vacio (sin enviar ningun campo)
    -> espera status 400

— Asistencias (en asistencias.test.js) —

11. Registro de asistencia valida con estado "presente"
    -> espera status 200

12. Registro de asistencia valida con estado "ausente"
    -> espera status 200

13. Registro de asistencia valida con estado "justificada"
    -> espera status 200

14. Rechazo de estado no permitido (ej: "tardanza", "falta")
    -> espera status 400

15. Rechazo de fecha futura
    -> espera status 400

16. Rechazo de asistencia duplicada: mismo estudiante, misma fecha
    -> espera status 409 en la segunda peticion

17. Rechazo cuando faltan campos obligatorios en el payload
    -> espera status 400

— Reportes —

18. Reporte de ausentismo cuando no hay datos
    -> espera status 200 y array vacio

19. Reporte de ausentismo con varios estudiantes registrados
    -> espera status 200, maximo 5 resultados, y que el primero
    tenga mas o igual ausencias que el ultimo

ESTRUCTURA BASE PARA LOS ARCHIVOS DE PRUEBA:

const request = require('supertest');
const app = require('../ruta/correcta/a/app');

describe('[nombre del grupo de pruebas]', () => {

  beforeEach(async () => {
    // limpia todas las tablas o colecciones antes de cada prueba
    // adaptalo segun la base de datos que usa el proyecto
  });

  test('[descripcion clara en español de que se esta probando]', async () => {
    const res = await request(app)
      .post('/api/...')
      .send({ ... });
    expect(res.statusCode).toBe(...);
    expect(res.body).toHaveProperty('...');
  });

});

DESPUES DE EJECUTAR npm test, agrega esta seccion al final de AUDITORIA.md:

---

## Bugs confirmados por pruebas

| # | Prueba | Resultado | Bug revelado |
|---|--------|-----------|--------------|
| 1 | nombre del test | ✅ PASA / ❌ FALLA | descripcion del bug o "comportamiento correcto" |
[una fila por cada caso de prueba]

### Resumen de cobertura
- Total de pruebas escritas: N
- Pruebas que pasan: N
- Pruebas que fallan: N
- Porcentaje de exito: N%
- Conclusion: [que tan confiable resulto el codigo generado por IA
  y que areas fueron mas problematicas]

---

Genera todos los archivos de prueba completos y listos para ejecutar con npm test.

---
