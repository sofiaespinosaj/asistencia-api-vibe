## Hallazgo 1 — Exposicion de datos personales sin autenticacion
- **Severidad:** alta
- **Archivo/línea:** src/routes/estudiantes.js, lineas 45-68; src/routes/reportes.js, lineas 6-39; src/routes/asistencias.js, lineas 50-75
- **Descripcion tecnica:** Los endpoints de lectura devuelven datos personales (incluye email) sin ningun mecanismo de autenticacion o autorizacion. No existe middleware de seguridad que restrinja el acceso a datos de estudiantes.
- **Evidencia:** Las rutas GET retornan objetos completos de estudiantes (incluye email) y no hay verificacion de usuario en los handlers.
- **Impacto:** Exposicion de datos sensibles y posible incumplimiento de habeas data/privacidad.

## Hallazgo 2 — Ausencia de controles basicos de seguridad en la API
- **Severidad:** media
- **Archivo/línea:** src/app.js, lineas 12-24
- **Descripcion tecnica:** No se implementa rate limiting ni politicas CORS, lo que permite abuso de recursos y acceso desde cualquier origen no controlado.
- **Evidencia:** En el arranque de la app no se configura ningun middleware de limitacion de peticiones ni CORS.
- **Impacto:** Riesgo de abuso (DoS logico), scraping masivo y consumo no autorizado de la API.

## Hallazgo 3 — Validacion de fechas con comparacion en UTC puede rechazar fechas validas
- **Severidad:** media
- **Archivo/línea:** src/validaciones.js, lineas 23-28
- **Descripcion tecnica:** La funcion `validarFecha` compara la fecha recibida contra `hoyStr` usando `toISOString()` (UTC). En zonas horarias positivas puede marcar como futura una fecha local valida (mismo dia).
- **Evidencia:** Se usa `const hoyStr = hoy.toISOString().split('T')[0];` y se compara `fechaStr > hoyStr`.
- **Impacto:** Rechazo incorrecto de asistencias validas y datos incompletos en el sistema.

## Hallazgo 4 — Falta de validacion de formato en email
- **Severidad:** baja
- **Archivo/línea:** src/routes/estudiantes.js, lineas 7-35
- **Descripcion tecnica:** El endpoint de creacion de estudiantes acepta cualquier valor en `email` sin validar formato ni longitud, lo que puede introducir datos inconsistentes.
- **Evidencia:** No existe validacion de `email` antes de la insercion en BD.
- **Impacto:** Datos incorrectos y dificultad para contacto o reportes posteriores.

## Hallazgo 5 — Ausencia de pruebas automatizadas
- **Severidad:** baja
- **Archivo/línea:** package.json, lineas 1-16
- **Descripcion tecnica:** No se identifican scripts ni dependencias para pruebas automatizadas.
- **Evidencia:** No hay script `test` ni framework de testing en dependencias.
- **Impacto:** Mayor riesgo de regresiones y errores no detectados.

## Checklist de auditoria

| # | Aspecto | Pregunta | Estado |
|---|---------|----------|--------|
| 1 | Validacion de entrada | Valida el formato del codigo del estudiante? Rechaza fechas futuras? Valida el enum del estado? | CUMPLE PARCIALMENTE |
| 2 | Manejo de errores | Hay try/catch en las rutas? Devuelve codigos HTTP correctos (400, 404, 409, 500)? | CUMPLE PARCIALMENTE |
| 3 | Inyeccion y seguridad | Si usa base de datos, parametriza consultas? Escapa entradas? Tiene rate limiting? CORS configurado? | CUMPLE PARCIALMENTE |
| 4 | Datos sensibles | Expone informacion de estudiantes sin autenticacion? Hay manejo de datos personales segun habeas data? | NO CUMPLE |
| 5 | Estructura y mantenibilidad | Separa rutas, controladores y logica? O todo esta en `index.js`? Los nombres son descriptivos? | CUMPLE |
| 6 | Dependencias | Que paquetes agrego? Los necesita? Tienen vulnerabilidades? Ejecuta `npm audit`. | CUMPLE |
| 7 | Configuracion | Hardcodea puertos o credenciales? Usa variables de entorno? Hay `.env.example`? | CUMPLE PARCIALMENTE |
| 8 | Idempotencia y duplicados | Permite registrar dos asistencias iguales para el mismo estudiante y fecha? | CUMPLE |
| 9 | Pruebas | Genero alguna prueba automatizada? O cero? | NO CUMPLE |
| 10 | Documentacion | El README explica como correrlo? Hay comentarios utiles o vacios? | CUMPLE |

---

## Bugs confirmados por pruebas

| # | Prueba | Resultado | Bug revelado |
|---|--------|-----------|--------------|
| 1 | Creacion exitosa con codigo valido EST00123 y nombre completo | ✅ PASA | Comportamiento correcto |
| 2 | Rechazo cuando el codigo tiene formato invalido (abc) | ✅ PASA | Comportamiento correcto |
| 3 | Rechazo cuando el codigo no empieza por EST (ALU00123) | ✅ PASA | Comportamiento correcto |
| 4 | Rechazo cuando el codigo EST tiene menos de 5 digitos (EST99) | ✅ PASA | Comportamiento correcto |
| 5 | Rechazo de estudiante duplicado enviando el mismo codigo dos veces | ✅ PASA | Comportamiento correcto |
| 6 | Listado cuando no existe ningun estudiante registrado | ✅ PASA | Comportamiento correcto |
| 7 | Listado despues de crear un estudiante | ✅ PASA | Comportamiento correcto |
| 8 | Consulta por ID de un estudiante que si existe | ✅ PASA | Comportamiento correcto |
| 9 | Consulta por ID de un estudiante que no existe | ✅ PASA | Comportamiento correcto |
| 10 | Creacion con payload vacio (sin enviar ningun campo) | ✅ PASA | Comportamiento correcto |
| 11 | Registro de asistencia valida con estado presente | ❌ FALLA | La API responde 201 en lugar de 200 en POST /api/asistencias |
| 12 | Registro de asistencia valida con estado ausente | ❌ FALLA | La API responde 201 en lugar de 200 en POST /api/asistencias |
| 13 | Registro de asistencia valida con estado justificada | ❌ FALLA | La API responde 201 en lugar de 200 en POST /api/asistencias |
| 14 | Rechazo de estado no permitido (tardanza, falta) | ✅ PASA | Comportamiento correcto |
| 15 | Rechazo de fecha futura | ✅ PASA | Comportamiento correcto |
| 16 | Rechazo de asistencia duplicada: mismo estudiante, misma fecha | ✅ PASA | Comportamiento correcto |
| 17 | Rechazo cuando faltan campos obligatorios en el payload | ✅ PASA | Comportamiento correcto |
| 18 | Reporte de ausentismo cuando no hay datos | ✅ PASA | Comportamiento correcto |
| 19 | Reporte de ausentismo con varios estudiantes registrados | ✅ PASA | Comportamiento correcto |

### Resumen de cobertura
- Total de pruebas escritas: 19
- Pruebas que pasan: 16
- Pruebas que fallan: 3
- Porcentaje de exito: 84.21%
- Conclusion: El codigo generado por IA muestra una base funcional razonable en validaciones y reglas de negocio, pero presenta una inconsistencia de contrato HTTP en el alta de asistencias (201 vs 200) que rompe expectativas de clientes y pruebas. El area mas problematica detectada por las pruebas fue la estandarizacion de respuestas para operaciones de creacion.

---
