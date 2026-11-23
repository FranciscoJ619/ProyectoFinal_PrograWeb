import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
const ICONOS = { exito: CheckCircle2, error: AlertCircle, info: Info };

/** Avisos flotantes propios (nunca alert() del navegador). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const cerrar = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const mostrar = useCallback(
    (mensaje, tipo = 'exito') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, mensaje, tipo }]);
      setTimeout(() => cerrar(id), 4500);
    },
    [cerrar],
  );

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icono = ICONOS[t.tipo] || Info;
          return (
            <div key={t.id} className={`toast toast-${t.tipo}`}>
              <Icono size={18} />
              <span>{t.mensaje}</span>
              <button className="icon-btn" onClick={() => cerrar(t.id)} aria-label="Cerrar aviso">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
