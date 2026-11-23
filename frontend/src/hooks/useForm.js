import { useCallback, useState } from 'react';

/**
 * Formulario con validación en tiempo real y al enviar.
 * reglas: { campo: [validador, ...] } donde validador(valor, valores) => mensaje | null
 * reglas también puede ser una función (valores) => reglas, para reglas condicionales.
 */
export default function useForm(inicial, reglas = {}) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});

  const obtenerReglas = useCallback((vals) => (typeof reglas === 'function' ? reglas(vals) : reglas), [reglas]);

  const validarCampo = useCallback(
    (campo, vals) => {
      for (const regla of obtenerReglas(vals)[campo] || []) {
        const msg = regla(vals[campo], vals);
        if (msg) return msg;
      }
      return null;
    },
    [obtenerReglas],
  );

  const cambiar = useCallback(
    (campo, valor) => {
      setValores((prev) => {
        const nuevos = { ...prev, [campo]: valor };
        // Valida en tiempo real el campo editado (y revalida los ya tocados)
        setErrores((errs) => {
          const r = { ...errs, [campo]: validarCampo(campo, nuevos) };
          Object.keys(tocados).forEach((c) => {
            if (c !== campo) r[c] = validarCampo(c, nuevos);
          });
          return r;
        });
        return nuevos;
      });
      setTocados((t) => (t[campo] ? t : { ...t, [campo]: true }));
    },
    [validarCampo, tocados],
  );

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    cambiar(name, type === 'checkbox' ? checked : value);
  };

  /** Valida todo antes de enviar. Devuelve true si no hay errores. */
  const validar = useCallback(() => {
    const todos = {};
    Object.keys(obtenerReglas(valores)).forEach((c) => {
      todos[c] = validarCampo(c, valores);
    });
    setErrores(todos);
    setTocados(Object.fromEntries(Object.keys(todos).map((c) => [c, true])));
    return Object.values(todos).every((e) => !e);
  }, [valores, obtenerReglas, validarCampo]);

  /** Coloca bajo cada input los errores que devolvió el backend. */
  const setErroresServidor = useCallback((errs) => setErrores((e) => ({ ...e, ...errs })), []);

  return { valores, setValores, errores, cambiar, onChange, validar, setErroresServidor };
}
