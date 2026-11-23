import { useCallback, useEffect, useRef, useState } from 'react';
import { mensajeError } from '../api/client';

/**
 * Ejecuta una petición cuando cambian las dependencias y expone loading / error / data.
 * Ignora respuestas viejas si el usuario cambió filtros antes de que llegaran.
 */
export default function useAsync(fn, deps = [], { inmediato = true } = {}) {
  const [estado, setEstado] = useState({ data: null, loading: inmediato, error: null });
  const ultimo = useRef(0);

  const ejecutar = useCallback(() => {
    const id = ++ultimo.current;
    setEstado((s) => ({ ...s, loading: true, error: null }));
    return fn()
      .then((data) => {
        if (id === ultimo.current) setEstado({ data, loading: false, error: null });
        return data;
      })
      .catch((err) => {
        if (id === ultimo.current) setEstado((s) => ({ ...s, loading: false, error: mensajeError(err) }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (inmediato) ejecutar();
  }, [ejecutar, inmediato]);

  return { ...estado, recargar: ejecutar, setData: (data) => setEstado((s) => ({ ...s, data })) };
}
