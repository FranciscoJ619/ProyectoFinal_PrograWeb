import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { Avatar, Badge, Button, ConfirmModal, EmptyState, ErrorState, Loader, Pagination } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { adminApi } from '../../api/services';
import { mensajeError } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { ESTADO_SOLICITUD, TIPO_SOLICITUD, fecha, tonoSolicitud } from '../../utils/format';

export default function AdminSolicitudes() {
  const toast = useToast();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [page, setPage] = useState(0);
  const [borrar, setBorrar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const lista = useAsync(() => adminApi.solicitudes({ q, estado, tipo, page, size: 8 }), [q, estado, tipo, page]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(texto.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [texto]);

  const eliminar = async () => {
    setProcesando(true);
    try {
      await adminApi.eliminarSolicitud(borrar.id);
      toast('Solicitud eliminada');
      setBorrar(null);
      lista.recargar();
    } catch (err) {
      toast(mensajeError(err), 'error');
      setBorrar(null);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="row wrap">
          <div className="input-wrap" style={{ width: 280 }}>
            <input className="input has-icon" placeholder="Folio, videojuego o solicitante" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar" />
            <span className="input-icon"><Search size={18} /></span>
          </div>
          <select className="select" style={{ width: 170 }} value={estado} onChange={(e) => { setEstado(e.target.value); setPage(0); }} aria-label="Estado">
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_SOLICITUD).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select className="select" style={{ width: 150 }} value={tipo} onChange={(e) => { setTipo(e.target.value); setPage(0); }} aria-label="Tipo">
            <option value="">Todos los tipos</option>
            {Object.entries(TIPO_SOLICITUD).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {lista.data && <span className="muted">{lista.data.totalElements} solicitudes</span>}
      </div>
      {lista.error ? <ErrorState mensaje={lista.error} onRetry={lista.recargar} /> : lista.loading && !lista.data ? <Loader /> : lista.data.content.length === 0 ? (
        <EmptyState titulo="Sin solicitudes" />
      ) : (
        <>
          <div className="table-wrap" style={{ opacity: lista.loading ? 0.6 : 1 }}>
            <table className="table">
              <thead><tr><th>Folio</th><th>Videojuego</th><th>Solicitante</th><th>Propietario</th><th>Tipo</th><th>Fechas</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {lista.data.content.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.folio}</strong></td>
                    <td><Link to={`/videojuegos/${s.videojuego.id}`}>{s.videojuego.titulo}</Link></td>
                    <td><span className="cell-user"><Avatar usuario={s.solicitante} size={30} />{s.solicitante.nombre}</span></td>
                    <td>{s.propietario.nombre}</td>
                    <td>{TIPO_SOLICITUD[s.tipo]}</td>
                    <td className="small">{s.tipo === 'PRESTAMO' ? `${fecha(s.fechaInicio)} → ${fecha(s.fechaDevolucion)}` : fecha(s.fechaSolicitud)}</td>
                    <td><Badge tone={tonoSolicitud[s.estado]}>{ESTADO_SOLICITUD[s.estado]}</Badge></td>
                    <td><Button variant="danger" size="sm" icon={Trash2} onClick={() => setBorrar(s)} aria-label="Eliminar" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={lista.data.page} totalPages={lista.data.totalPages} onChange={setPage} />
        </>
      )}
      <ConfirmModal abierto={!!borrar} onClose={() => setBorrar(null)} onConfirm={eliminar} loading={procesando} peligro
        titulo="¿Eliminar solicitud?" mensaje={`La solicitud ${borrar?.folio} de ${borrar?.videojuego.titulo} se eliminará permanentemente.`} textoConfirmar="Eliminar" />
    </>
  );
}
