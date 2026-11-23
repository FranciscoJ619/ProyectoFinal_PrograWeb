import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { PrivateLayout, PublicOnly, RequireRole } from './components/Layout';
import { EmptyState } from './components/ui';
import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';
import OlvidePassword from './pages/auth/OlvidePassword';
import RestablecerPassword from './pages/auth/RestablecerPassword';
import Inicio from './pages/Inicio';
import Catalogo from './pages/Catalogo';
import DetalleVideojuego from './pages/DetalleVideojuego';
import Publicar from './pages/Publicar';
import Prestamos from './pages/Prestamos';
import Comunidad from './pages/Comunidad';
import PublicacionDetalle from './pages/PublicacionDetalle';
import Perfil from './pages/Perfil';
import MiCuenta from './pages/MiCuenta';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminVideojuegos from './pages/admin/AdminVideojuegos';
import AdminCatalogos from './pages/admin/AdminCatalogos';
import AdminSolicitudes from './pages/admin/AdminSolicitudes';
import { Gamepad2 } from 'lucide-react';

const OPERAN = ['JUGADOR', 'ADMIN'];

export default function App() {
  const { pathname } = useLocation();
  // Llaves obligatorias: en Chrome reciente scrollTo() devuelve una Promise y React la trataría como cleanup
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/registro" element={<PublicOnly><Registro /></PublicOnly>} />
      <Route path="/olvide-password" element={<OlvidePassword />} />
      <Route path="/restablecer-password" element={<RestablecerPassword />} />

      <Route element={<PrivateLayout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
        <Route path="/publicar" element={<RequireRole roles={OPERAN}><Publicar /></RequireRole>} />
        <Route path="/videojuegos/:id/editar" element={<RequireRole roles={OPERAN}><Publicar /></RequireRole>} />
        <Route path="/prestamos" element={<RequireRole roles={OPERAN}><Prestamos /></RequireRole>} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/comunidad/:id" element={<PublicacionDetalle />} />
        <Route path="/perfil/:id" element={<Perfil />} />
        <Route path="/mi-cuenta" element={<MiCuenta />} />

        <Route path="/admin" element={<RequireRole roles={['ADMIN', 'MODERADOR']}><AdminLayout /></RequireRole>}>
          <Route index element={<RequireRole roles={['ADMIN']}><AdminDashboard /></RequireRole>} />
          <Route path="usuarios" element={<RequireRole roles={['ADMIN']}><AdminUsuarios /></RequireRole>} />
          <Route path="videojuegos" element={<AdminVideojuegos />} />
          <Route path="catalogos" element={<RequireRole roles={['ADMIN']}><AdminCatalogos /></RequireRole>} />
          <Route path="solicitudes" element={<RequireRole roles={['ADMIN']}><AdminSolicitudes /></RequireRole>} />
        </Route>

        <Route
          path="*"
          element={
            <div className="container page">
              <EmptyState icon={Gamepad2} titulo="Página no encontrada" texto="Esta partida no existe o fue movida.">
                <Link to="/" className="btn btn-primary">Volver al inicio</Link>
              </EmptyState>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
