import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Search } from 'lucide-react';
import { Badge, Button, ConfirmModal, EmptyState, ErrorState, GameCover, Loader, Pagination } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { adminApi, catalogosApi } from '../../api/services';
import { mensajeError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ESTADO_PUBLICACION, MODALIDAD, fecha, precio, tonoPublicacion } from '../../utils/format';

export default function AdminVideojuegos() {
  const { esAdmin } = useAuth();
  const toast = useToast();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [plataformaId, setPlataformaId] = useState('');
  const [page, setPage] = useState(0);
  const [moderar, setModerar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const plataformas = useAsync(() => catalogosApi.plataformas(), []);
  const lista = useAsync(() => adminApi.videojuegos({ q, estado, plataformaId, page, size: 8 }), [q, estado, plataformaId, page]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(texto.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [texto]);

  const ejecutar = async () => {
    setProcesando(true);
    const nuevo = moderar.estadoPublicacion === 'INACTIVO' ? 'PUBLICADO' : 'INACTIVO';
    try {
      await adminApi.moderarVideojuego(moderar.id, nuevo);
      toast(nuevo === 'INACTIVO' ? 'Publicación ocultada del catálogo' : 'Publicación reactivada');
      setModerar(null);
      lista.recargar();
    } catch (err) {
      toast(mensajeError(err), 'error');
      setModerar(null);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="row wrap">
          <div className="input-wrap" style={{ width: 260 }}>
            <input className="input has-icon" placeholder="Buscar por título" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar" />
            <span className="input-icon"><Search size={18} /></span>
          </div>
          <select className="select" style={{ width: 170 }} value={estado} onChange={(e) => { setEstado(e.target.value); setPage(0); }} aria-label="Estado">
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_PUBLICACION).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select className="select" style={{ width: 200 }} value={plataformaId} onChange={(e) => { setPlataformaId(e.target.value); setPage(0); }} aria-label="Plataforma">
            <option value="">Todas las plataformas</option>
            {plataformas.data?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        {lista.data && <span className="muted">{lista.data.totalElements} publicaciones</span>}
      </div>

      {lista.error ? <ErrorState mensaje={lista.error} onRetry={lista.recargar} /> : lista.loading && !lista.data ? <Loader /> : lista.data.content.length === 0 ? (
        <EmptyState titulo="Sin publicaciones" texto="Prueba con otros filtros." />
      ) : (
        <>
          <div className="table-wrap" style={{ opacity: lista.loading ? 0.6 : 1 }}>
            <table className="table">
              <thead><tr><th>Videojuego</th><th>Propietario</th><th>Modalidad</th><th>Precio</th><th>Publicado</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {lista.data.content.map((j) => (
                  <tr key={j.id}>
                    <td><Link to={`/videojuegos/${j.id}`} className="row" style={{ gap: 12, color: 'inherit' }}><GameCover className="mini" titulo={j.titulo} plataforma={j.plataforma} src={j.portadaUrl} /><span><strong>{j.titulo}</strong><br /><span className="muted small">{j.plataforma}</span></span></Link></td>
                    <td><Link to={`/perfil/${j.propietario.id}`}>{j.propietario.nombre}</Link></td>
                    <td>{MODALIDAD[j.modalidad]}</td>
                    <td>{j.precioVenta ? precio(j.precioVenta) : '—'}</td>
                    <td>{fecha(j.fechaPublicacion)}</td>
                    <td><Badge tone={tonoPublicacion[j.estadoPublicacion]}>{ESTADO_PUBLICACION[j.estadoPublicacion]}</Badge></td>
                    <td>
                      <div className="row">
                        {(j.estadoPublicacion === 'PUBLICADO' || j.estadoPublicacion === 'INACTIVO') && (
                          <Button variant={j.estadoPublicacion === 'INACTIVO' ? 'dark' : 'danger'} size="sm" icon={j.estadoPublicacion === 'INACTIVO' ? Eye : EyeOff} onClick={() => setModerar(j)}>
                            {j.estadoPublicacion === 'INACTIVO' ? 'Reactivar' : 'Ocultar'}
                          </Button>
                        )}
                        {esAdmin && j.estadoPublicacion !== 'VENDIDO' && <Link to={`/videojuegos/${j.id}/editar`} className="btn btn-secondary btn-sm"><Pencil size={14} /></Link>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={lista.data.page} totalPages={lista.data.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmModal
        abierto={!!moderar}
        onClose={() => setModerar(null)}
        onConfirm={ejecutar}
        loading={procesando}
        peligro={moderar?.estadoPublicacion !== 'INACTIVO'}
        titulo={moderar?.estadoPublicacion === 'INACTIVO' ? '¿Reactivar publicación?' : '¿Ocultar publicación?'}
        mensaje={moderar?.estadoPublicacion === 'INACTIVO'
          ? `"${moderar?.titulo}" volverá a aparecer en el catálogo.`
          : `"${moderar?.titulo}" dejará de aparecer en el catálogo hasta que se reactive.`}
        textoConfirmar={moderar?.estadoPublicacion === 'INACTIVO' ? 'Reactivar' : 'Ocultar'}
      />
    </>
  );
}
