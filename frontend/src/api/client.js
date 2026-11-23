import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'replay.token';
const USER_KEY = 'replay.usuario';

export const storage = {
  get token() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  get usuario() {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  guardar(token, usuario, recordar) {
    this.limpiar();
    const s = recordar ? localStorage : sessionStorage;
    s.setItem(TOKEN_KEY, token);
    s.setItem(USER_KEY, JSON.stringify(usuario));
  },
  actualizarUsuario(usuario) {
    const s = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    s.setItem(USER_KEY, JSON.stringify(usuario));
  },
  limpiar() {
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
  },
};

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// Envía el JWT en el header Authorization de cada petición protegida
api.interceptors.request.use((config) => {
  const token = storage.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expiró o fue revocado, se cierra la sesión local
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && storage.token && !url.includes('/auth/')) {
      storage.limpiar();
      window.dispatchEvent(new Event('sesion-expirada'));
    }
    return Promise.reject(error);
  },
);

/** Convierte cualquier error de Axios en un mensaje claro para el usuario. */
export function mensajeError(error) {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder. Intenta de nuevo.';
    return 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.';
  }
  return error.response.data?.message || 'Ocurrió un error inesperado.';
}

/** Errores por campo enviados por el backend (Bean Validation o reglas de negocio). */
export function erroresCampo(error) {
  return error?.response?.data?.errores || {};
}

/** URL absoluta para imágenes subidas al backend. */
export function urlImagen(ruta) {
  if (!ruta) return null;
  if (/^https?:\/\//.test(ruta)) return ruta;
  const base = API_URL.replace(/\/api\/?$/, '');
  return base + ruta;
}

export default api;
