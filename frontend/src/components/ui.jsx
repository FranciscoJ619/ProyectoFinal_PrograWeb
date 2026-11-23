import { useEffect, useId, useState } from 'react';
import { AlertCircle, AlertTriangle, Check, Eye, EyeOff, Inbox, RefreshCw, Star, WifiOff, X } from 'lucide-react';
import { urlImagen } from '../api/client';
import { reglasPassword } from '../utils/validators';

/* ------------------------------------------------------------------ Campos */

/** Campo con etiqueta y mensaje de error bajo el input (nunca alert()). */
export function Field({ label, error, help, required, children, className = '', htmlFor }) {
  return (
    <div className={`field ${error ? 'invalid' : ''} ${className}`}>
      {label && (
        <label htmlFor={htmlFor}>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field-error" role="alert">
          <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          {error}
        </span>
      ) : (
        help && <span className="field-help">{help}</span>
      )}
    </div>
  );
}

export function Input({ label, error, help, required, icon: Icono, className = '', ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error} help={help} required={required} className={className} htmlFor={id}>
      <div className="input-wrap">
        <input id={id} className={`input ${Icono ? 'has-icon' : ''}`} aria-invalid={!!error} {...props} />
        {Icono && (
          <span className="input-icon">
            <Icono size={18} />
          </span>
        )}
      </div>
    </Field>
  );
}

export function Select({ label, error, help, required, children, className = '', ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error} help={help} required={required} className={className} htmlFor={id}>
      <select id={id} className="select" aria-invalid={!!error} {...props}>
        {children}
      </select>
    </Field>
  );
}

export function Textarea({ label, error, help, required, className = '', ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error} help={help} required={required} className={className} htmlFor={id}>
      <textarea id={id} className="textarea" aria-invalid={!!error} {...props} />
    </Field>
  );
}

/** Contraseña con mostrar/ocultar y, opcionalmente, checklist de requisitos en tiempo real. */
export function PasswordInput({ label, error, help, required, mostrarReglas, value, className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <Field label={label} error={error} help={!mostrarReglas ? help : null} required={required} htmlFor={id} className={className}>
      <div className="input-wrap">
        <input id={id} className="input has-icon" type={visible ? 'text' : 'password'} value={value} aria-invalid={!!error} {...props} />
        <button type="button" className="input-icon" onClick={() => setVisible((x) => !x)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {mostrarReglas && (
        <ul className="pw-rules">
          {reglasPassword.map((r) => {
            const ok = r.ok(value || '');
            return (
              <li key={r.id} className={ok ? 'ok' : ''}>
                {ok ? <Check size={14} /> : <X size={14} />} {r.texto}
              </li>
            );
          })}
        </ul>
      )}
    </Field>
  );
}

export function StarsInput({ value, onChange }) {
  return (
    <div className="stars-input" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={n <= (value || 0) ? 'on' : ''} onClick={() => onChange(n)} aria-label={`${n} estrellas`}>
          <Star size={26} fill={n <= (value || 0) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Botones */

export function Button({ variant = 'primary', size, loading, children, className = '', icon: Icono, block, ...props }) {
  return (
    <button
      className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${block ? 'btn-block' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="spinner sm" /> : Icono && <Icono size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ Visuales */

export function Avatar({ usuario, size = 40 }) {
  const [fallo, setFallo] = useState(false);
  const nombre = usuario?.nombre || '?';
  const iniciales = nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  const colores = ['#243B67', '#2563EB', '#0F766E', '#7C3AED', '#B45309', '#BE185D'];
  const color = colores[(usuario?.id || nombre.length) % colores.length];
  const src = urlImagen(usuario?.avatarUrl);
  if (src && !fallo) {
    return <img className="avatar" src={src} alt={nombre} width={size} height={size} style={{ width: size, height: size }} onError={() => setFallo(true)} />;
  }
  return (
    <span className="avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.38 }} aria-label={nombre}>
      {iniciales}
    </span>
  );
}

export function Rating({ value, total, sufijo }) {
  return (
    <span className="rating">
      <Star size={16} />
      {value && Number(value) > 0 ? Number(value).toFixed(1) : '—'}
      {sufijo && <span className="muted" style={{ fontWeight: 400 }}>{sufijo}</span>}
      {total !== undefined && <span className="muted" style={{ fontWeight: 400 }}>· {total}</span>}
    </span>
  );
}

export function Badge({ tone = 'neutral', children, icon: Icono }) {
  return (
    <span className={`badge badge-${tone}`}>
      {Icono && <Icono size={14} />}
      {children}
    </span>
  );
}

const PALETA_PLATAFORMA = {
  'PlayStation 5': ['#1f4fa8', '#0b1f45', 'PS5'],
  'PlayStation 4': ['#1d3f8a', '#0b1a3a', 'PS4'],
  'PlayStation 2': ['#29303d', '#0d1117', 'PS2'],
  'Xbox Series X': ['#178a3a', '#0b3d1b', 'XBOX'],
  'Xbox One': ['#1b7a36', '#0a3519', 'XBOX ONE'],
  'Nintendo Switch': ['#e60012', '#7a0010', 'SWITCH'],
  'Nintendo 64': ['#6b7280', '#1f2937', 'N64'],
  'Super Nintendo': ['#6d28d9', '#2e1065', 'SNES'],
  'Game Boy Advance': ['#4338ca', '#1e1b4b', 'GBA'],
  'PC físico': ['#334155', '#0f172a', 'PC'],
};

/**
 * Portada: foto subida por el propietario o, si no hay, una "caja" generada
 * con los colores de la plataforma (evita usar imágenes con derechos de autor).
 */
export function GameCover({ titulo, plataforma, src, className = '' }) {
  const [fallo, setFallo] = useState(false);
  const url = urlImagen(src);
  if (url && !fallo) {
    return (
      <div className={`cover ${className}`}>
        <img src={url} alt={titulo} loading="lazy" onError={() => setFallo(true)} />
      </div>
    );
  }
  const [c1, c2, etiqueta] = PALETA_PLATAFORMA[plataforma] || ['#243B67', '#101827', 'GAME'];
  let h = 0;
  for (const ch of titulo || '') h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <div className={`cover ${className}`} aria-label={`Portada de ${titulo}`} role="img">
      <div className="box" style={{ background: `linear-gradient(170deg, hsl(${h} 55% 52%), hsl(${(h + 40) % 360} 60% 22%))` }}>
        <div className="band" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}>{etiqueta}</div>
        <div className="art">{titulo}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Estados */

export function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="state" aria-busy="true">
      <div className="spinner" />
      <span>{texto}</span>
    </div>
  );
}

export function ErrorState({ mensaje, onRetry }) {
  const sinRed = mensaje?.includes('conexión') || mensaje?.includes('tardó');
  const Icono = sinRed ? WifiOff : AlertTriangle;
  return (
    <div className="state" role="alert">
      <Icono size={40} />
      <strong style={{ color: 'var(--text)' }}>{sinRed ? 'Problema de conexión' : 'Algo salió mal'}</strong>
      <span>{mensaje}</span>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ titulo = 'Sin resultados', texto, children, icon: Icono = Inbox }) {
  return (
    <div className="state">
      <Icono size={40} />
      <strong style={{ color: 'var(--text)' }}>{titulo}</strong>
      {texto && <span>{texto}</span>}
      {children}
    </div>
  );
}

/** Envuelve una sección: muestra loader, error con reintento o el contenido. */
export function AsyncView({ loading, error, onRetry, children, data }) {
  if (loading && !data) return <Loader />;
  if (error) return <ErrorState mensaje={error} onRetry={onRetry} />;
  return children;
}

/* ------------------------------------------------------------------ Paginación (server-side) */

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const paginas = [];
  const add = (p) => paginas.push(p);
  const rango = new Set([0, totalPages - 1, page - 1, page, page + 1].filter((p) => p >= 0 && p < totalPages));
  [...rango].sort((a, b) => a - b).forEach((p, i, arr) => {
    if (i > 0 && p - arr[i - 1] > 1) add('...' + p);
    add(p);
  });
  return (
    <nav className="pagination" aria-label="Paginación">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>Anterior</button>
      {paginas.map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="dots">…</span>
        ) : (
          <button key={p} className={p === page ? 'active' : ''} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
            {p + 1}
          </button>
        ),
      )}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Siguiente</button>
    </nav>
  );
}

/* ------------------------------------------------------------------ Modales */

export function Modal({ abierto, onClose, titulo, subtitulo, children, footer, size, icon }) {
  useEffect(() => {
    if (!abierto) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierto, onClose]);

  if (!abierto) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${size || ''}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-head">
          <div>
            {icon}
            <h2>{titulo}</h2>
            {subtitulo && <p className="muted mt-8">{subtitulo}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/** Modal de confirmación para acciones destructivas o importantes (reemplaza window.confirm). */
export function ConfirmModal({ abierto, onClose, onConfirm, titulo, mensaje, textoConfirmar = 'Confirmar', peligro, loading, children }) {
  return (
    <Modal
      abierto={abierto}
      onClose={onClose}
      titulo={titulo}
      icon={
        <div className="modal-icon" style={{ background: peligro ? 'var(--danger-bg)' : 'var(--retro-soft)', color: peligro ? 'var(--danger)' : 'var(--retro)' }}>
          <AlertTriangle size={24} />
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant={peligro ? 'danger-solid' : 'dark'} onClick={onConfirm} loading={loading}>
            {textoConfirmar}
          </Button>
        </>
      }
    >
      {mensaje && <p className="muted">{mensaje}</p>}
      {children}
    </Modal>
  );
}
