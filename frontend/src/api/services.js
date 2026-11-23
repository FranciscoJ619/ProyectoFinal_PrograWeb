import api from './client';

/** Serializa arreglos como ?a=1&a=2 (formato que entiende Spring). */
function params(obj = {}) {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, x));
    else p.append(k, v);
  });
  return p;
}

const data = (r) => r.data;

export const authApi = {
  login: (body) => api.post('/auth/login', body).then(data),
  registro: (body) => api.post('/auth/registro', body).then(data),
  logout: () => api.post('/auth/logout').then(data),
  olvide: (body) => api.post('/auth/olvide-password', body).then(data),
  restablecer: (body) => api.post('/auth/restablecer-password', body).then(data),
};

export const usuariosApi = {
  yo: () => api.get('/usuarios/me').then(data),
  actualizar: (body) => api.put('/usuarios/me', body).then(data),
  cambiarPassword: (body) => api.put('/usuarios/me/password', body).then(data),
  perfil: (id) => api.get(`/usuarios/${id}`).then(data),
  contactar: (id, body) => api.post(`/usuarios/${id}/contactar`, body).then(data),
};

export const catalogosApi = {
  plataformas: () => api.get('/plataformas/todas').then(data),
  generos: () => api.get('/generos/todos').then(data),
  paginaPlataformas: (f) => api.get('/plataformas', { params: params(f) }).then(data),
  paginaGeneros: (f) => api.get('/generos', { params: params(f) }).then(data),
  guardarPlataforma: (id, body) => (id ? api.put(`/plataformas/${id}`, body) : api.post('/plataformas', body)).then(data),
  guardarGenero: (id, body) => (id ? api.put(`/generos/${id}`, body) : api.post('/generos', body)).then(data),
  eliminarPlataforma: (id) => api.delete(`/plataformas/${id}`),
  eliminarGenero: (id) => api.delete(`/generos/${id}`),
};

export const videojuegosApi = {
  catalogo: (f) => api.get('/videojuegos', { params: params(f) }).then(data),
  mios: (f) => api.get('/videojuegos/mios', { params: params(f) }).then(data),
  detalle: (id) => api.get(`/videojuegos/${id}`).then(data),
  crear: (body) => api.post('/videojuegos', body).then(data),
  actualizar: (id, body) => api.put(`/videojuegos/${id}`, body).then(data),
  eliminar: (id) => api.delete(`/videojuegos/${id}`),
};

export const solicitudesApi = {
  mias: (f) => api.get('/solicitudes', { params: params(f) }).then(data),
  resumen: () => api.get('/solicitudes/resumen').then(data),
  opinables: () => api.get('/solicitudes/opinables').then(data),
  crear: (body) => api.post('/solicitudes', body).then(data),
  accion: (id, accion, body) => api.patch(`/solicitudes/${id}/${accion}`, body).then(data),
};

export const foroApi = {
  publicaciones: (f) => api.get('/foro/publicaciones', { params: params(f) }).then(data),
  publicacion: (id) => api.get(`/foro/publicaciones/${id}`).then(data),
  crear: (body) => api.post('/foro/publicaciones', body).then(data),
  eliminar: (id) => api.delete(`/foro/publicaciones/${id}`),
  comentarios: (id, f) => api.get(`/foro/publicaciones/${id}/comentarios`, { params: params(f) }).then(data),
  comentar: (id, body) => api.post(`/foro/publicaciones/${id}/comentarios`, body).then(data),
  eliminarComentario: (id) => api.delete(`/foro/comentarios/${id}`),
  temas: () => api.get('/foro/temas-populares').then(data),
};

export const notificacionesApi = {
  listar: (f) => api.get('/notificaciones', { params: params(f) }).then(data),
  noLeidas: () => api.get('/notificaciones/no-leidas').then(data),
  leer: (id) => api.patch(`/notificaciones/${id}/leida`).then(data),
  leerTodas: () => api.patch('/notificaciones/leer-todas').then(data),
};

export const generalApi = {
  estadisticas: () => api.get('/estadisticas').then(data),
  subirImagen: (archivo) => {
    const form = new FormData();
    form.append('archivo', archivo);
    return api.post('/archivos', form, { timeout: 60000 }).then(data);
  },
};

export const adminApi = {
  estadisticas: () => api.get('/admin/estadisticas').then(data),
  usuarios: (f) => api.get('/admin/usuarios', { params: params(f) }).then(data),
  crearUsuario: (body) => api.post('/admin/usuarios', body).then(data),
  actualizarUsuario: (id, body) => api.put(`/admin/usuarios/${id}`, body).then(data),
  activoUsuario: (id, activo) => api.patch(`/admin/usuarios/${id}/activo`, { activo }).then(data),
  eliminarUsuario: (id) => api.delete(`/admin/usuarios/${id}`),
  videojuegos: (f) => api.get('/admin/videojuegos', { params: params(f) }).then(data),
  moderarVideojuego: (id, estado) => api.patch(`/admin/videojuegos/${id}/estado`, { estado }).then(data),
  solicitudes: (f) => api.get('/admin/solicitudes', { params: params(f) }).then(data),
  eliminarSolicitud: (id) => api.delete(`/admin/solicitudes/${id}`),
};
