import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, Gamepad2, LayoutDashboard, Shapes, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { esAdmin } = useAuth();
  const links = [
    ...(esAdmin ? [{ to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true }, { to: '/admin/usuarios', label: 'Usuarios', icon: Users }] : []),
    { to: '/admin/videojuegos', label: 'Videojuegos', icon: Gamepad2 },
    ...(esAdmin ? [{ to: '/admin/solicitudes', label: 'Solicitudes', icon: ClipboardList }, { to: '/admin/catalogos', label: 'Plataformas y géneros', icon: Shapes }] : []),
  ];
  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>{esAdmin ? 'Panel de administración' : 'Moderación'}</h1>
          <p>{esAdmin ? 'Gestión de usuarios y de todos los módulos de Replay Club.' : 'Revisa y modera las publicaciones del catálogo. La comunidad se modera desde cada publicación.'}</p>
        </div>
      </div>
      <div className="admin-layout">
        <nav className="card admin-nav" aria-label="Administración">
          {links.map(({ to, label, icon: Icono, end }) => (
            <NavLink key={to} to={to} end={end}><Icono size={18} /> {label}</NavLink>
          ))}
        </nav>
        <section style={{ minWidth: 0 }}>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
