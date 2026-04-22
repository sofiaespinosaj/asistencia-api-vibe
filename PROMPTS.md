## Prompt fase 1

Crea una API REST en Node.js con Express para gestionar asistencia estudiantil.
Elige tú la base de datos que prefieras.

ENDPOINTS REQUERIDOS (los 6):
1. POST   /api/estudiantes
2. GET    /api/estudiantes
3. GET    /api/estudiantes/:id
4. POST   /api/asistencias
5. GET    /api/asistencias/estudiante/:id
6. GET    /api/reportes/ausentismo        → top 5 estudiantes con más ausencias

REGLAS DE NEGOCIO:
- El campo `codigo` debe ser único, formato EST seguido de exactamente 5 dígitos (ej: EST00123)
- El campo `estado` en asistencia solo acepta: "presente", "ausente" o "justificada"
- No se puede registrar dos asistencias para el mismo estudiante en la misma fecha
- La fecha debe ser válida (YYYY-MM-DD) y no puede ser futura

VALIDACIÓN DE RESPUESTAS:
- POST /api/estudiantes y GET /api/estudiantes deben responder con código HTTP 200

Que funcione en local con npm start. Dame el código completo.


## Prompt fase 2

Actúa como un Auditor Senior de Software y realiza una evaluación técnica exhaustiva del código de este proyecto basándote en el archivo AUDITORIA.md que ya se encuentra en el repositorio. Tu misión es analizar el código fuente, la estructura y las dependencias para completar dicho archivo siguiendo un formato estricto. Por cada problema detectado, debes redactar un hallazgo con el formato: "## Hallazgo N — [Título]", seguido de viñetas para Severidad (alta/media/baja), Archivo/línea, Descripción técnica, Evidencia clara y el Impacto potencial. Un ejemplo del formato:

```markdown
## Hallazgo 1 — Validación de código del estudiante
- **Severidad:** media
- **Archivo/línea:** src/routes/estudiantes.js, línea 23
- **Descripción:** El endpoint POST /api/estudiantes no valida el patrón EST\d{5}.
- **Evidencia:** envié POST con codigo "abc" y respondió 201.
- **Impacto:** datos inconsistentes en el sistema real.
```

 Una vez documentados los hallazgos, debes completar la tabla de auditoría de 10 puntos: 
 
**Checklist de auditoría:**

| # | Aspecto | Pregunta |
|---|---------|----------|
| 1 | Validación de entrada | ¿Valida el formato del código del estudiante? ¿Rechaza fechas futuras? ¿Valida el enum del estado? |
| 2 | Manejo de errores | ¿Hay try/catch en las rutas? ¿Devuelve códigos HTTP correctos (400, 404, 409, 500)? |
| 3 | Inyección y seguridad | Si usa base de datos, ¿parametriza consultas? ¿Escapa entradas? ¿Tiene rate limiting? ¿CORS configurado? |
| 4 | Datos sensibles | ¿Expone información de estudiantes sin autenticación? ¿Hay manejo de datos personales según habeas data? |
| 5 | Estructura y mantenibilidad | ¿Separa rutas, controladores y lógica? ¿O todo está en `index.js`? ¿Los nombres son descriptivos? |
| 6 | Dependencias | ¿Qué paquetes agregó? ¿Los necesita? ¿Tienen vulnerabilidades? Ejecuta `npm audit`. |
| 7 | Configuración | ¿Hardcodea puertos o credenciales? ¿Usa variables de entorno? ¿Hay `.env.example`? |
| 8 | Idempotencia y duplicados | ¿Permite registrar dos asistencias iguales para el mismo estudiante y fecha? |
| 9 | Pruebas | ¿Generó alguna prueba automatizada? ¿O cero? |
| 10 | Documentación | ¿El README explica cómo correrlo? ¿Hay comentarios útiles o vacíos? |

  asignando a cada uno el estado de CUMPLE, CUMPLE PARCIALMENTE o NO CUMPLE según tus descubrimientos. Asegúrate de ser sumamente específico con las rutas de los archivos, priorizar fallos de seguridad como severidad alta y mantener la integridad del formato Markdown solicitado para que el reporte sea profesional y técnico.