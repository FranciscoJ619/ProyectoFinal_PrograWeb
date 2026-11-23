import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../api/client';
import { authApi, usuariosApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => (storage.token ? storage.usuario : null));

  const iniciarSesion = useCallback((respuesta, recordar) => {
    storage.guardar(respuesta.token, respuesta.usuario, recordar);
    setUsuario(respuesta.usuario);
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await authApi.logout(); // invalida el token en el backend
    } catch {
      // aunque falle la red, se cierra la sesión local
    }
    storage.limpiar();
    setUsuario(null);
  }, []);

  const actualizarUsuario = useCallback((u) => {
    storage.actualizarUsuario(u);
    setUsuario(u);
  }, []);

  // Sincroniza los datos del usuario al abrir la app
  useEffect(() => {
    if (!storage.token) return;
    usuariosApi.yo().then(actualizarUsuario).catch(() => {});
  }, [actualizarUsuario]);

  // El interceptor de Axios avisa cuando el token ya no es válido
  useEffect(() => {
    const onExpirada = () => setUsuario(null);
    window.addEventListener('sesion-expirada', onExpirada);
    return () => window.removeEventListener('sesion-expirada', onExpirada);
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      autenticado: !!usuario,
      rol: usuario?.rol,
      esAdmin: usuario?.rol === 'ADMIN',
      esModerador: usuario?.rol === 'MODERADOR',
      esJugador: usuario?.rol === 'JUGADOR',
      puedeOperar: usuario?.rol === 'JUGADOR' || usuario?.rol === 'ADMIN',
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario,
    }),
    [usuario, iniciarSesion, cerrarSesion, actualizarUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
