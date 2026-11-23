// Mismas reglas que el backend (Bean Validation), para mostrar errores bajo cada input.

export const reglasPassword = [
  { id: 'len', texto: 'Al menos 8 caracteres', ok: (v) => v.length >= 8 },
  { id: 'may', texto: 'Una letra mayúscula', ok: (v) => /[A-Z]/.test(v) },
  { id: 'num', texto: 'Un número', ok: (v) => /\d/.test(v) },
  { id: 'esp', texto: 'Un carácter especial (!@#$...)', ok: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^\+[1-9]\d{9,14}$/;

export const v = {
  requerido: (msg = 'Este campo es obligatorio') => (val) =>
    val === undefined || val === null || String(val).trim() === '' || (Array.isArray(val) && val.length === 0)
      ? msg
      : null,
  email: () => (val) => (val && !EMAIL.test(val.trim()) ? 'Ingresa un correo válido' : null),
  min: (n, msg) => (val) => (val && String(val).trim().length < n ? msg || `Mínimo ${n} caracteres` : null),
  max: (n, msg) => (val) => (val && String(val).length > n ? msg || `Máximo ${n} caracteres` : null),
  password: () => (val) =>
    val && !reglasPassword.every((r) => r.ok(val))
      ? 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial'
      : null,
  telefono: () => (val) => (val && !TELEFONO.test(val.trim()) ? 'Usa formato internacional, por ejemplo +525512345678' : null),
  numeroEntre: (a, b, msg) => (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = Number(val);
    return Number.isNaN(n) || n < a || n > b ? msg || `Debe estar entre ${a} y ${b}` : null;
  },
  igualA: (campo, msg) => (val, valores) => (val !== valores[campo] ? msg : null),
  fechaNoPasada: (msg = 'La fecha no puede estar en el pasado') => (val) => {
    if (!val) return null;
    return val < hoyISO() ? msg : null;
  },
};

export function hoyISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
