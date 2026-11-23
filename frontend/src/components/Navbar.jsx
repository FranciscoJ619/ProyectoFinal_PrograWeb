import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, Shield, User, X } from 'lucide-react';
import Logo from './Logo';
import { Avatar, ConfirmModal } from './ui';
import { useAuth } from '../context/AuthContext';
import { notificacionesApi } from '../api/services';
import { hace, ROLES } from '../utils/format';

function useClickFuera(ref, onFuera) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onFuera();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onFuera]);
}

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin, esModerador, puedeOperar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [movil, setMovil] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [noLeidas, setNoLeidas] = useState(0);
  const [notifs, setNotifs] = useState({ loading: false, items: [], error: null });
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  useClickFuera(menuRef, () => setMenu(false));
  useClickFuera(notifRef, () => setNotifAbierto(false));

  // Cierra menús al navegar
  useEffect(() => {
    setMovil(false);
    setMenu(false);
    setNotifAbierto(false);
  }, [location.pathname]);

  // Contador de notificaciones (se refresca cada minuto)
  useEffect(() => {
    const cargar = () => notificacionesApi.noLeidas().then((r) => setNoLeidas(r.noLeidas)).catch(() => {});
    cargar();
    const t = setInterval(cargar, 60000);
    return () => clearInterval(t);
  }, [location.pathname]);

  const abrirNotificaciones = async () => {
    const abrir = !notifAbierto;
    setNotifAbierto(abrir);
    if (!abrir) return;
    setNotifs((n) => ({ ...n, loading: true, error: null }));
    try {
      const r = await notificacionesApi.listar({ size: 8 });
      setNotifs({ loading: false, items: r.content, error: null });
    } catch {
      setNotifs({ loading: false, items: [], error: 'No se pudieron cargar las notificaciones' });
    }
  };

  const abrirNotif = async (n) => {
    if (!n.leida) {
      notificacionesApi.leer(n.id).catch(() => {});
      setNoLeidas((x) => Math.max(0, x - 1));
    }
    setNotifAbierto(false);
    if (n.enlace) navigate(n.enlace);
  };

  const leerTodas = async () => {
    await notificacionesApi.leerTodas().catch(() => {});
    setNoLeidas(0);
    setNotifs((s) => ({ ...s, items: s.items.map((i) => ({ ...i, leida: true })) }));
  };

  const buscar = (e) => {
    e.preventDefault();
    navigate(`/catalogo?q=${encodeURIComponent(busqueda.trim())}`);
  };

  const salir = async () => {
    await cerrarSesion();
    navigate('/login', { replace: true });
  };

  const links = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/comunidad', label: 'Comunidad' },
    ...(puedeOperar ? [{ to: '/prestamos', label: 'Mis préstamos' }, { to: '/publicar', label: 'Publicar videojuego' }] : []),
    ...(esModerador ? [{ to: '/admin/videojuegos', label: 'Moderación' }] : []),
  ];

  const buscador = (
    <form className="search" onSubmit={buscar} role="search">
      <Search size={18} />
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar juegos" aria-label="Buscar juegos" />
    </form>
  );

  return (
    <header className="header">
      <div className="container">
        <Logo />
        <nav className="nav" aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-right">
          {buscador}

          <div style={{ position: 'relative' }} ref={notifRef}>
            <button className="icon-btn bell" onClick={abrirNotificaciones} aria-label={`Notificaciones (${noLeidas} sin leer)`}>
              <Bell size={22} />
              {noLeidas > 0 && <span className="dot">{noLeidas > 9 ? '9+' : noLeidas}</span>}
            </button>
            {notifAbierto && (
              <div className="dropdown" style={{ width: 340 }}>
                <div className="dropdown-head" style={{ justifyContent: 'space-between' }}>
                  <strong>Notificaciones</strong>
                  {noLeidas > 0 && (
                    <button className="link-arrow small" onClick={leerTodas}>
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifs.loading && <div className="state" style={{ padding: 24 }}><div className="spinner" /></div>}
                  {notifs.error && <div className="alert alert-error" style={{ margin: 12 }}>{notifs.error}</div>}
                  {!notifs.loading && !notifs.error && notifs.items.length === 0 && (
                    <div className="state" style={{ padding: 24 }}>No tienes notificaciones</div>
                  )}
                  {notifs.items.map((n) => (
                    <button key={n.id} className={`notif ${n.leida ? '' : 'unread'}`} onClick={() => abrirNotif(n)}>
                      <div>{n.mensaje}</div>
                      <div className="muted small mt-8">{hace(n.fechaCreacion)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} ref={menuRef}>
            <button className="user-btn" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
              <Avatar usuario={usuario} size={40} />
              <ChevronDown size={18} />
            </button>
            {menu && (
              <div className="dropdown" role="menu">
                <div className="dropdown-head">
                  <Avatar usuario={usuario} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block' }}>{usuario.nombre}</strong>
                    <span className="muted small" style={{ wordBreak: 'break-all' }}>{usuario.email}</span>
                    <div className="mt-8">
                      <span className="badge badge-outline" style={{ height: 22, fontSize: 12 }}>{ROLES[usuario.rol]}</span>
                    </div>
                  </div>
                </div>
                <Link to={`/perfil/${usuario.id}`}><User size={18} /> Mi perfil público</Link>
                <Link to="/mi-cuenta"><Settings size={18} /> Editar mi cuenta</Link>
                {(esAdmin || esModerador) && (
                  <Link to={esAdmin ? '/admin' : '/admin/videojuegos'}><Shield size={18} /> {esAdmin ? 'Panel de administración' : 'Moderación'}</Link>
                )}
                <button className="item" onClick={() => setConfirmarSalida(true)} style={{ color: 'var(--danger)', borderTop: '1px solid var(--border)' }}>
                  <LogOut size={18} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <button className="icon-btn hamburger" onClick={() => setMovil((m) => !m)} aria-label="Abrir menú">
            {movil ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {movil && (
        <div className="mobile-menu">
          {buscador}
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
          {esAdmin && <NavLink to="/admin">Panel de administración</NavLink>}
        </div>
      )}

      <ConfirmModal
        abierto={confirmarSalida}
        onClose={() => setConfirmarSalida(false)}
        onConfirm={salir}
        titulo="¿Cerrar sesión?"
        mensaje="Tu sesión se invalidará en este dispositivo. Tendrás que volver a iniciar sesión para continuar."
        textoConfirmar="Cerrar sesión"
      />
    </header>
  );
}
