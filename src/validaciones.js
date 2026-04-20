/**
 * Valida que el código tenga el formato EST seguido de exactamente 5 dígitos.
 * Ej: EST00123 ✅  |  EST1234 ❌  |  est00123 ❌
 */
function validarCodigo(codigo) {
  return /^EST\d{5}$/.test(codigo);
}

/**
 * Valida formato YYYY-MM-DD y que no sea una fecha futura.
 * Compara solo la parte de la fecha (sin hora) para no penalizar el día actual.
 */
function validarFecha(fechaStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    return { valida: false, mensaje: 'La fecha debe tener el formato YYYY-MM-DD' };
  }

  const fecha = new Date(fechaStr + 'T00:00:00');
  if (isNaN(fecha.getTime())) {
    return { valida: false, mensaje: 'La fecha no es válida' };
  }

  // Comparar solo fecha (sin hora) en zona local
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split('T')[0];

  if (fechaStr > hoyStr) {
    return { valida: false, mensaje: 'La fecha no puede ser futura' };
  }

  return { valida: true };
}

const ESTADOS_VALIDOS = ['presente', 'ausente', 'justificada'];

module.exports = { validarCodigo, validarFecha, ESTADOS_VALIDOS };
