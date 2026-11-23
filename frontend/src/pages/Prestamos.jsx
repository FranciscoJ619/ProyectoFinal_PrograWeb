import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, Inbox, Repeat } from 'lucide-react';
import { Avatar, Badge, Button, ConfirmModal, EmptyState, ErrorState, GameCover, Loader, Modal, Pagination, Textarea } from '../components/ui';
import useAsync from '../hooks/useAsync';
import { solicitudesApi } from '../api/services';
import { mensajeError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ESTADO_SOLICITUD, TIPO_SOLICITUD, fecha, precio, tonoSolicitud } from '../utils/format';

const TABS = [
  ['TODOS', 'Todos'],
  ['SOLICITANTE', 'Como solicitante'],
  ['PROPIETARIO', 'Como propietario'],
];

/** Configuración de cada acción: texto del modal, estilo y mensaje de éxito. */
const ACCIONES = {
  aprobar: { titulo: 'Aprobar solicitud', boton: 'Aprobar', exito: 'Solicitud aprobada. Avisamos al jugador por correo y SMS.', respuesta: true },
  rechazar: { titulo: 'Rechazar solicitud', boton: 'Rechazar', exito: 'Solicitud rechazada.', respuesta: true, peligro: true },
  cancelar: { titulo: 'Cancelar solicitud', boton: 'Cancelar solicitud', exito: 'Solicitud cancelada.', peligro: true },
  entregar: { titulo: 'Confirmar entrega', boton: 'Confirmar entrega', exito: 'Entrega registrada.' },
  'confirmar-devolucion': { titulo: 'Confirmar devolución', boton: 'Confirmar devolución', exito: 'Devolución confirmada. ¡Transacción completada!' },
};

export default function Prestamos() {
  const { usuario } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('TODOS');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(0);
  const [accion, setAccion] = useState(null); // { tipo, solicitud }
  const [respuesta, setRespuesta] = useState('');
  const [errorRespuesta, setErrorRespuesta] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [detalle, setDetalle] = useState(null);

  const resumen = useAsync(() => solicitudesApi.resumen(), []);
  const lista = useAsync(() => solicitudesApi.mias({ rol: tab, estado, page, size: 8 }), [tab, estado, page]);

  const cambiarTab = (t) => { setTab(t); setPage(0); };

  const ejecutar = async () => {
    if (respuesta.length > 400) return setErrorRespuesta('La respuesta no puede exceder 400 caracteres');
    setProcesando(true);
    try {
      const conf = ACCIONES[accion.tipo];
      await solicitudesApi.accion(accion.solicitud.id, accion.tipo, conf.respuesta ? { respuesta: respuesta.trim() || null } : undefined);
      toast(accion.tipo === 'entregar' && accion.solicitud.tipo === 'COMPRA' ? 'Venta completada. ¡Gracias por usar Replay Club!' : conf.exito);
      setAccion(null);
      lista.recargar();
      resumen.recargar();
    } catch (err) {
      toast(mensajeError(err), 'error');
    } finally {
      setProcesando(false);
    }
  };

  const abrirAccion = (tipo, solicitud) => {
    setRespuesta('');
    setErrorRespuesta(null);
    setAccion({ tipo, solicitud });
  };

  const r = resumen.data;
  const tarjetas = [
    { titulo: 'Solicitudes pendientes', icon: Clock3, valor: r ? r.pendientesEnviadas + r.pendientesRecibidas : '—', detalle: r ? `${r.pendientesEnviadas} enviadas · ${r.pendientesRecibidas} recibidas` : '' },
    { titulo: 'Préstamos activos', icon: Repeat, valor: r ? r.aprobados + r.enCurso : '—', detalle: r ? `${r.aprobados} aprobados · ${r.enCurso} en curso` : '' },
    { titulo: 'Transacciones finalizadas', icon: CheckCircle2, valor: r?.finalizados ?? '—', detalle: 'Devueltas o entregadas' },
    { titulo: 'Solicitudes recibidas', icon: Inbox, valor: r?.recibidasTotales ?? '—', detalle: r ? `${r.pendientesRecibidas} por responder` : '' },
  ];

  const proxima = lista.data?.content.find((s) => s.estado === 'EN_CURSO' && s.solicitante.id === usuario.id);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Mis préstamos</h1>
          <p>Lleva el control de los juegos que compartes y de tus próximas aventuras.</p>
        </div>
        <Link to="/catalogo" className="btn btn-secondary"><ArrowRight size={18} /> Explorar catálogo</Link>
      </div>

      {resumen.error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{resumen.error}</div>}
      <div className="grid grid-4">
        {tarjetas.map(({ titulo, icon: Icono, valor, detalle: d }) => (
          <div key={titulo} className="card">
            <div className="row muted" style={{ justifyContent: 'space-between' }}>{titulo} <Icono size={20} /></div>
            <div className="row mt-16" style={{ gap: 14 }}>
              {resumen.loading ? <div className="skeleton" style={{ width: 40, height: 32 }} /> : <strong style={{ fontSize: 30 }}>{valor}</strong>}
              <span className="muted">{d}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs mt-24">
        {TABS.map(([k, l]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => cambiarTab(k)}>
            {l}{r && k !== 'TODOS' ? ` (${k === 'SOLICITANTE' ? r.totalComoSolicitante : r.totalComoPropietario})` : ''}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <label className="row">
          <span className="muted">Estado</span>
          <select className="select" style={{ width: 220, height: 44 }} value={estado} onChange={(e) => { setEstado(e.target.value); setPage(0); }}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_SOLICITUD).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        {lista.data && <span className="muted">{lista.data.totalElements} registros</span>}
      </div>

      {lista.error ? (
        <ErrorState mensaje={lista.error} onRetry={lista.recargar} />
      ) : lista.loading && !lista.data ? (
        <Loader />
      ) : lista.data.content.length === 0 ? (
        <EmptyState titulo="Sin solicitudes" texto="Cuando rentes o prestes un videojuego aparecerá aquí.">
          <Link to="/catalogo" className="btn btn-primary">Buscar un juego</Link>
        </EmptyState>
      ) : (
        <>
          <div className="table-wrap" style={{ opacity: lista.loading ? 0.6 : 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Videojuego</th>
                  <th>Usuario relacionado</th>
                  <th>Tipo</th>
                  <th>Fecha inicio</th>
                  <th>Fecha devolución</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.data.content.map((s) => {
                  const soyDueno = s.propietario.id === usuario.id;
                  const otro = soyDueno ? s.solicitante : s.propietario;
                  const rel = soyDueno ? (s.estado === 'FINALIZADO' ? 'Prestaste a' : 'Te solicita') : (s.estado === 'EN_CURSO' || s.estado === 'APROBADO' ? 'Recibes de' : 'Solicitaste a');
                  return (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/videojuegos/${s.videojuego.id}`} className="row" style={{ gap: 14, color: 'inherit' }}>
                          <GameCover className="mini" titulo={s.videojuego.titulo} plataforma={s.videojuego.plataforma} src={s.videojuego.portadaUrl} />
                          <span><strong style={{ fontSize: 15 }}>{s.videojuego.titulo}</strong><br /><span className="muted small">{s.folio}</span></span>
                        </Link>
                      </td>
                      <td>
                        <Link to={`/perfil/${otro.id}`} className="cell-user" style={{ color: 'inherit' }}>
                          <Avatar usuario={otro} size={40} />
                          <span>{otro.nombre}<small>{soyDueno ? rel : rel}</small></span>
                        </Link>
                      </td>
                      <td>{TIPO_SOLICITUD[s.tipo]}</td>
                      <td>{s.tipo === 'PRESTAMO' ? fecha(s.fechaInicio) : '—'}</td>
                      <td>{s.tipo === 'PRESTAMO' ? fecha(s.fechaDevolucion) : '—'}</td>
                      <td><Badge tone={tonoSolicitud[s.estado]}>{ESTADO_SOLICITUD[s.estado]}</Badge></td>
                      <td>
                        <div className="row wrap">
                          {soyDueno && s.estado === 'PENDIENTE' && (
                            <>
                              <Button variant="dark" size="sm" onClick={() => abrirAccion('aprobar', s)}>Aprobar</Button>
                              <Button variant="danger" size="sm" onClick={() => abrirAccion('rechazar', s)}>Rechazar</Button>
                            </>
                          )}
                          {soyDueno && s.estado === 'APROBADO' && <Button variant="dark" size="sm" onClick={() => abrirAccion('entregar', s)}>{s.tipo === 'COMPRA' ? 'Confirmar venta' : 'Marcar entregado'}</Button>}
                          {soyDueno && s.estado === 'EN_CURSO' && <Button variant="secondary" size="sm" onClick={() => abrirAccion('confirmar-devolucion', s)}>Confirmar devolución</Button>}
                          {!soyDueno && (s.estado === 'PENDIENTE' || s.estado === 'APROBADO') && <Button variant="danger" size="sm" onClick={() => abrirAccion('cancelar', s)}>Cancelar</Button>}
                          <Button variant="secondary" size="sm" onClick={() => setDetalle(s)}>Ver solicitud</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={lista.data.page} totalPages={lista.data.totalPages} onChange={setPage} />
        </>
      )}

      {proxima && (
        <div className="card soft row wrap mt-24" style={{ gap: 16 }}>
          <CalendarClock size={26} color="var(--retro)" />
          <div className="grow">
            <strong style={{ color: 'var(--retro)', fontSize: 16 }}>Tu próxima devolución es el {fecha(proxima.fechaDevolucion)}</strong>
            <p className="muted">{proxima.videojuego.titulo} · Coordina el horario con {proxima.propietario.nombre} y entrégalo en el mismo estado.</p>
          </div>
          <Link to={`/perfil/${proxima.propietario.id}`} className="btn btn-secondary">Contactar a {proxima.propietario.nombre.split(' ')[0]}</Link>
        </div>
      )}

      {/* Confirmación de acción */}
      {accion && (
        <ConfirmModal
          abierto
          onClose={() => setAccion(null)}
          onConfirm={ejecutar}
          loading={procesando}
          peligro={ACCIONES[accion.tipo].peligro}
          titulo={ACCIONES[accion.tipo].titulo}
          textoConfirmar={ACCIONES[accion.tipo].boton}
          mensaje={textoAccion(accion)}
        >
          {ACCIONES[accion.tipo].respuesta && (
            <div className="mt-16">
              <Textarea label="Mensaje para el solicitante (opcional)" value={respuesta} onChange={(e) => { setRespuesta(e.target.value); setErrorRespuesta(e.target.value.length > 400 ? 'La respuesta no puede exceder 400 caracteres' : null); }}
                error={errorRespuesta} help={`${respuesta.length}/400`} placeholder="Ej. Nos vemos el sábado en Metro Coyoacán" />
            </div>
          )}
        </ConfirmModal>
      )}

      {/* Detalle */}
      <Modal abierto={!!detalle} onClose={() => setDetalle(null)} titulo={`Solicitud ${detalle?.folio || ''}`} footer={<Button variant="secondary" onClick={() => setDetalle(null)}>Cerrar</Button>}>
        {detalle && (
          <div className="stack" style={{ gap: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 16 }}>{detalle.videojuego.titulo}</strong>
              <Badge tone={tonoSolicitud[detalle.estado]}>{ESTADO_SOLICITUD[detalle.estado]}</Badge>
            </div>
            <p><span className="muted">Tipo:</span> {TIPO_SOLICITUD[detalle.tipo]}{detalle.tipo === 'COMPRA' && ` · ${precio(detalle.videojuego.precioVenta)}`}</p>
            {detalle.tipo === 'PRESTAMO' && <p><span className="muted">Fechas:</span> {fecha(detalle.fechaInicio)} → {fecha(detalle.fechaDevolucion)}</p>}
            <p><span className="muted">Solicitante:</span> {detalle.solicitante.nombre}</p>
            <p><span className="muted">Propietario:</span> {detalle.propietario.nombre}</p>
            <p><span className="muted">Enviada:</span> {fecha(detalle.fechaSolicitud)}</p>
            {detalle.mensaje && <div className="card soft tight"><span className="muted small">Mensaje del solicitante</span><p>{detalle.mensaje}</p></div>}
            {detalle.respuesta && <div className="card tight" style={{ boxShadow: 'none' }}><span className="muted small">Respuesta del propietario</span><p>{detalle.respuesta}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function textoAccion({ tipo, solicitud: s }) {
  const juego = s.videojuego.titulo;
  switch (tipo) {
    case 'aprobar':
      return `${s.solicitante.nombre} recibirá un correo y un SMS confirmando que aprobaste ${s.tipo === 'COMPRA' ? 'la compra' : 'el préstamo'} de ${juego}.`;
    case 'rechazar':
      return `Se notificará a ${s.solicitante.nombre} que rechazaste su solicitud de ${juego}.`;
    case 'cancelar':
      return `Tu solicitud de ${juego} se cancelará y ${s.propietario.nombre} será notificado.`;
    case 'entregar':
      return s.tipo === 'COMPRA'
        ? `Confirma que entregaste ${juego} y recibiste el pago. La venta se marcará como completada y el juego saldrá del catálogo.`
        : `Confirma que entregaste ${juego}. El préstamo pasará a "En curso" hasta el ${fecha(s.fechaDevolucion)}.`;
    case 'confirmar-devolucion':
      return `Confirma que ${s.solicitante.nombre} te devolvió ${juego} en buen estado. Volverá a estar disponible en el catálogo.`;
    default:
      return '';
  }
}
