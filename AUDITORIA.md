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
