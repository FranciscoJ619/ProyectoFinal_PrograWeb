import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from './ui';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Parte interna de la app: requiere sesión y siempre muestra el navbar. */
export function PrivateLayout() {
  const { autenticado } = useAuth();
  const location = useLocation();
  if (!autenticado) return <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />;
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

/** Ruta protegida por rol: si el rol no coincide se muestra "acceso denegado". */
export function RequireRole({ roles, children }) {
  const { rol } = useAuth();
  if (!roles.includes(rol)) {
    return (
      <div className="container page">
        <EmptyState icon={ShieldAlert} titulo="Acceso denegado" texto="Tu tipo de cuenta no tiene permiso para ver esta sección.">
          <Link to="/" className="btn btn-secondary">Volver al inicio</Link>
        </EmptyState>
      </div>
    );
  }
  return children;
}

/** Login / registro: si ya hay sesión se redirige al inicio. */
export function PublicOnly({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? <Navigate to="/" replace /> : children;
}
