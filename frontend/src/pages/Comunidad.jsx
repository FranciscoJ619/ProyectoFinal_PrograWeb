import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Gamepad2, MessageCircle, MessagesSquare, Plus, Search, ShieldCheck, TrendingUp, UserCheck } from 'lucide-react';
import { Avatar, Badge, Button, EmptyState, ErrorState, Input, Loader, Modal, Pagination, Rating, Select, StarsInput, Textarea } from '../components/ui';
import useAsync from '../hooks/useAsync';
import useForm from '../hooks/useForm';
import { foroApi, generalApi, solicitudesApi, videojuegosApi } from '../api/services';
import { erroresCampo, mensajeError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIA_FORO, TIPO_SOLICITUD, fecha, hace } from '../utils/format';
import { v } from '../utils/validators';

const TABS = [
  ['', 'Todos'],
  ['RESENA_VIDEOJUEGO', 'Reseñas de videojuegos'],
  ['OPINION_USUARIO', 'Opiniones sobre usuarios'],
  ['DISCUSION', 'Discusiones generales'],
];
const TONO = { RESENA_VIDEOJUEGO: 'info', OPINION_USUARIO: 'success', DISCUSION: 'neutral' };

export function PostCard({ p }) {
  return (
    <article className="card post-card">
      <div className="post-head">
        <Link to={`/perfil/${p.autor.id}`} className="row" style={{ gap: 12, color: 'inherit' }}>
          <Avatar usuario={p.autor} size={44} />
          <span><strong style={{ display: 'block' }}>{p.autor.nombre}</strong><span className="muted">{hace(p.fechaCreacion)}</span></span>
        </Link>
        <Badge tone={TONO[p.categoria]}>{CATEGORIA_FORO[p.categoria]}</Badge>
      </div>
      <h3>{p.titulo}</h3>
      <p className="preview">{p.contenido}</p>
      <div className="post-foot">
        <span className="row">
          {p.categoria === 'RESENA_VIDEOJUEGO' && p.videojuego && <><Gamepad2 size={16} /> {p.videojuego.plataforma} · {p.videojuego.titulo}</>}
          {p.categoria === 'OPINION_USUARIO' && p.solicitud && <><UserCheck size={16} /> {TIPO_SOLICITUD[p.solicitud.tipo]} completada {p.solicitud.folio} · {p.solicitud.videojuego}</>}
          {p.categoria === 'DISCUSION' && p.etiqueta && <><MessagesSquare size={16} /> {p.etiqueta}</>}
        </span>
        {p.calificacion && (
          <Rating value={p.calificacion} sufijo={p.categoria === 'OPINION_USUARIO' ? ` a ${p.usuarioValorado?.nombre}` : ' al videojuego'} />
        )}
      </div>
      <div className="post-foot">
        <span className="row"><MessageCircle size={16} /> {p.totalComentarios} comentarios</span>
        <Link to={`/comunidad/${p.id}`} className="link-arrow">Abrir discusión <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}

export default function Comunidad() {
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') || '';
  const q = params.get('q') || '';
  const page = Number(params.get('page') || 0);
  const [texto, setTexto] = useState(q);
  const [nueva, setNueva] = useState(false);
  const [normas, setNormas] = useState(false);

  const posts = useAsync(() => foroApi.publicaciones({ categoria, q, page, size: 6 }), [categoria, q, page]);
  const temas = useAsync(() => foroApi.temas(), []);
  const recientes = useAsync(() => foroApi.publicaciones({ size: 3 }), []);
  const stats = useAsync(() => generalApi.estadisticas(), []);

  const set = (cambios) => {
    const p = new URLSearchParams(params);
    Object.entries(cambios).forEach(([k, val]) => (val === '' || val === null ? p.delete(k) : p.set(k, val)));
    if (!('page' in cambios)) p.delete('page');
    setParams(p);
  };

  useEffect(() => {
    const t = setTimeout(() => texto !== q && set({ q: texto.trim() }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Comunidad Replay</h1>
          <p>Comparte experiencias, descubre recomendaciones y conoce a otros jugadores</p>
        </div>
        <Button icon={Plus} onClick={() => setNueva(true)}>Nueva publicación</Button>
      </div>

      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={categoria === k ? 'active' : ''} onClick={() => set({ categoria: k })}>{l}</button>
        ))}
      </div>

      <div className="forum">
        <section className="stack">
          <div className="input-wrap" style={{ maxWidth: 420 }}>
            <input className="input has-icon" placeholder="Buscar en la comunidad" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar en la comunidad" />
            <span className="input-icon"><Search size={18} /></span>
          </div>
          {posts.error ? (
            <ErrorState mensaje={posts.error} onRetry={posts.recargar} />
          ) : posts.loading && !posts.data ? (
            <Loader />
          ) : posts.data.content.length === 0 ? (
            <EmptyState icon={MessagesSquare} titulo="No hay publicaciones" texto="Sé el primero en iniciar la conversación." />
          ) : (
            <div className="stack" style={{ opacity: posts.loading ? 0.6 : 1 }}>
              {posts.data.content.map((p) => <PostCard key={p.id} p={p} />)}
              <Pagination page={posts.data.page} totalPages={posts.data.totalPages} onChange={(n) => set({ page: n })} />
            </div>
          )}
        </section>

        <aside className="stack">
          <div className="card side-dark">
            <h2 style={{ fontSize: 22 }}>Más que una colección.</h2>
            <p className="mt-16" style={{ fontSize: 15 }}>Un espacio para compartir lo que nos gusta jugar, cuidar y volver a descubrir.</p>
            <p className="mt-16" style={{ color: 'var(--arcade)' }}>{stats.data ? `${stats.data.jugadores} jugadores · ${stats.data.publicacionesComunidad} publicaciones` : ' '}</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 18 }}>Temas populares</h3>
            {temas.loading && <div className="skeleton mt-16" style={{ height: 100 }} />}
            {temas.error && <p className="field-error mt-8">{temas.error}</p>}
            {temas.data?.map((t) => (
              <div key={t.nombre} className="topic">
                <div>
                  <button className="link-arrow" onClick={() => setTexto(t.nombre)} style={{ fontWeight: 500, fontSize: 15 }}># {t.nombre}</button>
                  <div className="muted">{t.total} conversaciones</div>
                </div>
                <TrendingUp size={18} className="muted" />
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Publicaciones recientes</h3>
            {recientes.data?.content.map((p) => (
              <Link key={p.id} to={`/comunidad/${p.id}`} style={{ display: 'block', padding: '10px 0', color: 'inherit' }}>
                <strong style={{ fontWeight: 500 }}>{p.titulo}</strong>
                <div className="muted small mt-8">{p.autor.nombre} · {hace(p.fechaCreacion)}</div>
              </Link>
            ))}
          </div>
          <div className="card soft row" style={{ alignItems: 'flex-start', gap: 12 }}>
            <ShieldCheck size={22} color="var(--retro)" />
            <div>
              <strong style={{ color: 'var(--retro)' }}>Normas de la comunidad</strong>
              <p className="muted mt-8">Respeta, evita spoilers y opina sobre usuarios solo tras una transacción real.</p>
              <button className="link-arrow mt-8" onClick={() => setNormas(true)}>Leer normas <ArrowRight size={14} /></button>
            </div>
          </div>
        </aside>
      </div>

      {nueva && <NuevaPublicacion onClose={() => setNueva(false)} onCreada={() => { setNueva(false); posts.recargar(); temas.recargar(); recientes.recargar(); }} categoriaInicial={categoria || 'DISCUSION'} />}

      <Modal abierto={normas} onClose={() => setNormas(false)} titulo="Normas de la comunidad" footer={<Button onClick={() => setNormas(false)}>Entendido</Button>}>
        <ol className="stack" style={{ paddingLeft: 18, gap: 10 }}>
          <li>Trata a todos con respeto. No se permiten insultos ni discriminación.</li>
          <li>Marca los spoilers en el título de tu publicación.</li>
          <li>Las reseñas de videojuegos califican el juego, no al propietario del ejemplar.</li>
          <li>Solo puedes opinar sobre un usuario después de completar una transacción real con él.</li>
          <li>No publiques datos personales (dirección, teléfono) en el foro.</li>
          <li>Los moderadores pueden retirar publicaciones que no cumplan estas normas.</li>
        </ol>
      </Modal>
    </div>
  );
}

function NuevaPublicacion({ onClose, onCreada, categoriaInicial }) {
  const toast = useToast();
  const { puedeOperar } = useAuth();
  const [buscarJuego, setBuscarJuego] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const form = useForm({ categoria: categoriaInicial, titulo: '', contenido: '', etiqueta: '', calificacion: 0, videojuegoId: '', solicitudId: '' }, (f) => ({
    categoria: [v.requerido('Selecciona una categoría')],
    titulo: [v.requerido('El título es obligatorio'), v.min(5, 'El título debe tener entre 5 y 150 caracteres'), v.max(150)],
    contenido: [v.requerido('El contenido es obligatorio'), v.min(20, 'Escribe al menos 20 caracteres'), v.max(3000)],
    etiqueta: [v.max(60)],
    ...(f.categoria !== 'DISCUSION' && { calificacion: [(x) => (!x ? 'Elige una calificación de 1 a 5 estrellas' : null)] }),
    ...(f.categoria === 'RESENA_VIDEOJUEGO' && { videojuegoId: [v.requerido('Selecciona el videojuego que reseñas')] }),
    ...(f.categoria === 'OPINION_USUARIO' && { solicitudId: [v.requerido('Selecciona la transacción completada')] }),
  }));
  const f = form.valores;
  const juegos = useAsync(() => videojuegosApi.catalogo({ q: buscarJuego, size: 10, incluirPrestados: true, orden: 'titulo' }), [buscarJuego]);
  const opinables = useAsync(() => (puedeOperar ? solicitudesApi.opinables() : Promise.resolve([])), []);

  const enviar = async () => {
    setError(null);
    if (!form.validar()) return;
    setEnviando(true);
    try {
      await foroApi.crear({
        categoria: f.categoria,
        titulo: f.titulo.trim(),
        contenido: f.contenido.trim(),
        etiqueta: f.etiqueta.trim() || null,
        calificacion: f.categoria === 'DISCUSION' ? null : f.calificacion,
        videojuegoId: f.categoria === 'RESENA_VIDEOJUEGO' ? Number(f.videojuegoId) : null,
        solicitudId: f.categoria === 'OPINION_USUARIO' ? Number(f.solicitudId) : null,
      });
      toast('¡Publicación creada!');
      onCreada();
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal abierto onClose={onClose} size="lg" titulo="Nueva publicación" subtitulo="Comparte con la comunidad Replay."
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button loading={enviando} onClick={enviar}>Publicar</Button></>}>
      <div className="stack">
        {error && <div className="alert alert-error">{error}</div>}
        <Select label="Categoría" name="categoria" required value={f.categoria} onChange={form.onChange} error={form.errores.categoria}>
          {Object.entries(CATEGORIA_FORO).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </Select>

        {f.categoria === 'RESENA_VIDEOJUEGO' && (
          <div className="form-grid">
            <Input label="Buscar videojuego" value={buscarJuego} onChange={(e) => setBuscarJuego(e.target.value)} placeholder="Escribe el nombre..." icon={Search} />
            <Select label="Videojuego" name="videojuegoId" required value={f.videojuegoId} onChange={form.onChange} error={form.errores.videojuegoId}>
              <option value="">{juegos.loading ? 'Cargando...' : 'Selecciona...'}</option>
              {juegos.data?.content.map((j) => <option key={j.id} value={j.id}>{j.titulo} ({j.plataforma})</option>)}
            </Select>
          </div>
        )}

        {f.categoria === 'OPINION_USUARIO' && (
          opinables.data?.length === 0 ? (
            <div className="alert alert-info">Solo puedes opinar sobre un usuario después de completar una transacción con él. Aún no tienes transacciones pendientes de valorar.</div>
          ) : (
            <Select label="Transacción completada" name="solicitudId" required value={f.solicitudId} onChange={form.onChange} error={form.errores.solicitudId}>
              <option value="">{opinables.loading ? 'Cargando...' : 'Selecciona...'}</option>
              {opinables.data?.map((o) => <option key={o.solicitudId} value={o.solicitudId}>{o.folio} · {TIPO_SOLICITUD[o.tipo]} de {o.videojuego} con {o.contraparte.nombre}</option>)}
            </Select>
          )
        )}

        {f.categoria !== 'DISCUSION' && (
          <div className="field">
            <span className="label">{f.categoria === 'OPINION_USUARIO' ? 'Calificación al usuario' : 'Calificación al videojuego'}<span className="req">*</span></span>
            <StarsInput value={f.calificacion} onChange={(n) => form.cambiar('calificacion', n)} />
            {form.errores.calificacion && <span className="field-error">{form.errores.calificacion}</span>}
          </div>
        )}

        <Input label="Título" name="titulo" required value={f.titulo} onChange={form.onChange} error={form.errores.titulo} maxLength={150} />
        <Textarea label="Contenido" name="contenido" required value={f.contenido} onChange={form.onChange} error={form.errores.contenido} help={`${f.contenido.length}/3000`} />
        {f.categoria === 'DISCUSION' && <Input label="Tema (opcional)" name="etiqueta" value={f.etiqueta} onChange={form.onChange} error={form.errores.etiqueta} placeholder="Coleccionismo físico, Recomendaciones..." />}
        <p className="muted small">Publicado el {fecha(new Date().toISOString())}. Recuerda respetar las normas de la comunidad.</p>
      </div>
    </Modal>
  );
}
