import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, CheckCircle2, MessageCircle, Pencil, Star } from 'lucide-react';
import GameCard, { GameCardSkeleton } from '../components/GameCard';
import { AsyncView, Avatar, Button, EmptyState, ErrorState, Loader, Modal, Pagination, Rating, Textarea } from '../components/ui';
import { PostCard } from './Comunidad';
import useAsync from '../hooks/useAsync';
import useForm from '../hooks/useForm';
import { foroApi, usuariosApi, videojuegosApi } from '../api/services';
import { erroresCampo, mensajeError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TIPO_SOLICITUD, fecha, miembroDesde, ROLES } from '../utils/format';
import { v } from '../utils/validators';

export default function Perfil() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('juegos');
  const [pagina, setPagina] = useState(0);
  const [contacto, setContacto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const esYo = Number(id) === usuario.id;

  const perfil = useAsync(() => usuariosApi.perfil(id), [id]);
  const juegos = useAsync(() => videojuegosApi.catalogo({ propietarioId: id, incluirPrestados: true, orden: 'recientes', size: 8, page: tab === 'juegos' ? pagina : 0 }), [id, tab === 'juegos' ? pagina : 0]);
  const opiniones = useAsync(() => foroApi.publicaciones({ categoria: 'OPINION_USUARIO', usuarioValoradoId: id, size: 6, page: tab === 'opiniones' ? pagina : 0 }), [id, tab === 'opiniones' ? pagina : 0]);
  const actividad = useAsync(() => (tab === 'actividad' ? foroApi.publicaciones({ autorId: id, size: 5, page: pagina }) : Promise.resolve(null)), [id, tab, pagina]);
  const form = useForm({ mensaje: '' }, { mensaje: [v.requerido('Escribe un mensaje'), v.min(10, 'El mensaje debe tener entre 10 y 500 caracteres'), v.max(500)] });

  const cambiarTab = (t) => { setTab(t); setPagina(0); };

  const contactar = async () => {
    if (!form.validar()) return;
    setEnviando(true);
    try {
      const r = await usuariosApi.contactar(id, { mensaje: form.valores.mensaje.trim() });
      toast(r.mensaje);
      setContacto(false);
      form.setValores({ mensaje: '' });
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      toast(mensajeError(err), 'error');
    } finally {
      setEnviando(false);
    }
  };

  if (perfil.loading) return <div className="container page"><Loader /></div>;
  if (perfil.error) return <div className="container page"><ErrorState mensaje={perfil.error} onRetry={perfil.recargar} /></div>;
  const p = perfil.data;
  const nombreCorto = p.nombre.split(' ')[0];

  return (
    <div className="container page">
      <section className="profile-head">
        <Avatar usuario={p} size={150} />
        <div className="grow" style={{ minWidth: 260 }}>
          <h1 className="row" style={{ fontSize: 34 }}>{p.nombre} {p.transaccionesCompletadas > 0 && <BadgeCheck size={26} color="#F5C542" aria-label="Usuario verificado" />}</h1>
          <p className="mt-8">{p.ciudad ? `${p.ciudad} · ` : ''}Miembro desde {miembroDesde(p.fechaRegistro)}{p.rol !== 'JUGADOR' ? ` · ${ROLES[p.rol]}` : ''}</p>
          {p.bio && <p className="mt-8" style={{ color: '#fff', fontSize: 16, maxWidth: 720 }}>{p.bio}</p>}
          <div className="row wrap mt-16" style={{ gap: 24 }}>
            <span className="rating" style={{ color: '#fff' }}><Star size={18} color="#F5C542" /> {p.calificacionPromedio > 0 ? Number(p.calificacionPromedio).toFixed(1) : '—'} como usuario · {p.totalOpiniones} opiniones</span>
            <span>{p.transaccionesCompletadas} transacciones completadas</span>
          </div>
        </div>
        {esYo ? (
          <Link to="/mi-cuenta" className="btn btn-primary"><Pencil size={18} /> Editar perfil</Link>
        ) : (
          <Button icon={MessageCircle} onClick={() => setContacto(true)}>Contactar usuario</Button>
        )}
      </section>

      <div className="tabs mt-24">
        <button className={tab === 'juegos' ? 'active' : ''} onClick={() => cambiarTab('juegos')}>Videojuegos publicados ({juegos.data?.totalElements ?? '…'})</button>
        <button className={tab === 'opiniones' ? 'active' : ''} onClick={() => cambiarTab('opiniones')}>Reseñas recibidas ({p.totalOpiniones})</button>
        <button className={tab === 'actividad' ? 'active' : ''} onClick={() => cambiarTab('actividad')}>Actividad en comunidad</button>
      </div>

      {tab === 'juegos' && (
        <>
          <div className="section-head" style={{ marginTop: 0 }}><h2>La colección de {nombreCorto}</h2></div>
          {juegos.error ? <ErrorState mensaje={juegos.error} onRetry={juegos.recargar} /> : juegos.loading ? (
            <div className="grid grid-4">{Array.from({ length: 4 }, (_, i) => <GameCardSkeleton key={i} />)}</div>
          ) : juegos.data.content.length === 0 ? (
            <EmptyState titulo="Sin videojuegos publicados" texto={esYo ? 'Publica tu primer juego para compartirlo.' : `${nombreCorto} aún no publica juegos.`}>
              {esYo && <Link to="/publicar" className="btn btn-primary">Publicar videojuego</Link>}
            </EmptyState>
          ) : (
            <>
              <div className="grid grid-4">{juegos.data.content.map((j) => <GameCard key={j.id} juego={j} mostrarPropietario={false} mostrarEstado={false} />)}</div>
              <Pagination page={juegos.data.page} totalPages={juegos.data.totalPages} onChange={setPagina} />
            </>
          )}
        </>
      )}

      {(tab === 'juegos' || tab === 'opiniones') && (
        <>
          <div className="section-head"><h2>Opiniones de otros jugadores</h2></div>
          <AsyncView loading={opiniones.loading} error={opiniones.error} onRetry={opiniones.recargar} data={opiniones.data}>
            {opiniones.data?.content.length === 0 ? (
              <EmptyState icon={Star} titulo="Sin opiniones todavía" texto="Las opiniones aparecen después de completar transacciones." />
            ) : (
              <>
                <div className="grid grid-2">
                  {opiniones.data?.content.slice(0, tab === 'juegos' ? 2 : 6).map((o) => (
                    <Link key={o.id} to={`/comunidad/${o.id}`} className="card" style={{ color: 'inherit', textDecoration: 'none' }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="row"><Avatar usuario={o.autor} size={32} /> <strong>{o.autor.nombre}</strong> <span className="muted">{fecha(o.fechaCreacion)}</span></span>
                        <Rating value={o.calificacion} sufijo=" al usuario" />
                      </div>
                      <p className="muted mt-16">{o.contenido}</p>
                      {o.solicitud && <p className="row mt-16" style={{ color: 'var(--retro)' }}><CheckCircle2 size={16} color="var(--success)" /> {TIPO_SOLICITUD[o.solicitud.tipo]} {o.solicitud.folio} · {o.solicitud.videojuego} · Completada</p>}
                    </Link>
                  ))}
                </div>
                {tab === 'opiniones' && <Pagination page={opiniones.data.page} totalPages={opiniones.data.totalPages} onChange={setPagina} />}
              </>
            )}
          </AsyncView>
          <p className="muted small mt-16">La reputación de {nombreCorto} se basa en transacciones completadas, no en las calificaciones de sus videojuegos.</p>
        </>
      )}

      {tab === 'actividad' && (
        <AsyncView loading={actividad.loading} error={actividad.error} onRetry={actividad.recargar} data={actividad.data}>
          {actividad.data?.content.length === 0 ? (
            <EmptyState titulo="Sin actividad" texto={`${nombreCorto} aún no publica en la comunidad.`} />
          ) : (
            <div className="stack">
              {actividad.data?.content.map((post) => <PostCard key={post.id} p={post} />)}
              {actividad.data && <Pagination page={actividad.data.page} totalPages={actividad.data.totalPages} onChange={setPagina} />}
            </div>
          )}
        </AsyncView>
      )}

      <Modal abierto={contacto} onClose={() => setContacto(false)} titulo={`Contactar a ${p.nombre}`} subtitulo="Le llegará como notificación, correo electrónico y WhatsApp."
        footer={<><Button variant="secondary" onClick={() => setContacto(false)}>Cancelar</Button><Button variant="dark" loading={enviando} onClick={contactar}>Enviar mensaje</Button></>}>
        <Textarea label="Mensaje" name="mensaje" required value={form.valores.mensaje} onChange={form.onChange} error={form.errores.mensaje} help={`${form.valores.mensaje.length}/500`} />
      </Modal>
    </div>
  );
}
