export const ESTADO_FISICO = {
  NUEVO: 'Nuevo',
  COMO_NUEVO: 'Como nuevo',
  BUEN_ESTADO: 'Buen estado',
  USADO: 'Usado',
};

export const MODALIDAD = { VENTA: 'Solo venta', PRESTAMO: 'Solo préstamo', AMBAS: 'Venta y préstamo' };

export const ESTADO_PUBLICACION = {
  BORRADOR: 'Borrador',
  PUBLICADO: 'Publicado',
  PRESTADO: 'Prestado',
  VENDIDO: 'Vendido',
  INACTIVO: 'Inactivo',
};

export const ESTADO_SOLICITUD = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  RECHAZADO: 'Rechazado',
  CANCELADO: 'Cancelado',
};

export const TIPO_SOLICITUD = { PRESTAMO: 'Préstamo', COMPRA: 'Compra' };

export const CATEGORIA_FORO = {
  RESENA_VIDEOJUEGO: 'Reseña de videojuego',
  OPINION_USUARIO: 'Opinión sobre usuario',
  DISCUSION: 'Discusión general',
};

export const ROLES = { ADMIN: 'Administrador', MODERADOR: 'Moderador', JUGADOR: 'Jugador' };

export const tonoSolicitud = {
  PENDIENTE: 'warning',
  APROBADO: 'success',
  EN_CURSO: 'info',
  FINALIZADO: 'neutral',
  RECHAZADO: 'danger',
  CANCELADO: 'neutral',
};

export const tonoPublicacion = {
  BORRADOR: 'neutral',
  PUBLICADO: 'success',
  PRESTADO: 'info',
  VENDIDO: 'neutral',
  INACTIVO: 'danger',
};

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
export const precio = (n) => (n === null || n === undefined ? '' : `${mxn.format(n)} MXN`);

const fechaCorta = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
export function fecha(valor) {
  if (!valor) return '—';
  // Las fechas "YYYY-MM-DD" se interpretan como locales para no perder un día
  const d = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor);
  return fechaCorta.format(d).replace('.', '');
}

export function hace(valor) {
  if (!valor) return '';
  const seg = Math.max(0, (Date.now() - new Date(valor).getTime()) / 1000);
  if (seg < 60) return 'Hace un momento';
  const min = Math.floor(seg / 60);
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Ayer';
  if (d < 30) return `Hace ${d} días`;
  return fecha(valor);
}

export function miembroDesde(valor) {
  if (!valor) return '';
  return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(new Date(valor));
}

export const calif = (n) => (n ? Number(n).toFixed(1) : '—');
