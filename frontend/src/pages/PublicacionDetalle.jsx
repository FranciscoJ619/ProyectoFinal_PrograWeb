import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Send, Trash2, UserCheck } from 'lucide-react';
import { AsyncView, Avatar, Badge, Button, ConfirmModal, EmptyState, Pagination, Rating, Textarea } from '../components/ui';
import useAsync from '../hooks/useAsync';
import useForm from '../hooks/useForm';
import { foroApi } from '../api/services';
import { erroresCampo, mensajeError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIA_FORO, TIPO_SOLICITUD, hace } from '../utils/format';
import { v } from '../utils/validators';

const TONO = { RESENA_VIDEOJUEGO: 'info', OPINION_USUARIO: 'success', DISCUSION: 'neutral' };

export default function PublicacionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario, esAdmin, esModerador } = useAuth();
  const [page, setPage] = useState(0);
  const [borrar, setBorrar] = useState(null); // { tipo: 'post'|'comentario', id }
  const [procesando, setProcesando] = useState(false);
  const post = useAsync(() => foroApi.publicacion(id), [id]);
  const comentarios = useAsync(() => foroApi.comentarios(id, { page, size: 10 }), [id, page]);
  const form = useForm({ contenido: '' }, { contenido: [v.requerido('El comentario no puede estar vacío'), v.min(2), v.max(800)] });
  const moderador = esAdmin || esModerador;

  const comentar = async (e) => {
    e.preventDefault();
    if (!form.validar()) return;
    setProcesando(true);
    try {
      await foroApi.comentar(id, { contenido: form.valores.contenido.trim() });
      form.setValores({ contenido: '' });
      comentarios.recargar();
      post.recargar();
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      toast(mensajeError(err), 'error');
    } finally {
      setProcesando(false);
    }
  };

  const eliminar = async () => {
    setProcesando(true);
    try {
      if (borrar.tipo === 'post') {
        await foroApi.eliminar(id);
        toast('Publicación eliminada');
        navigate('/comunidad', { replace: true });
      } else {
        await foroApi.eliminarComentario(borrar.id);
        toast('Comentario eliminado');
        comentarios.recargar();
        post.recargar();
      }
      setBorrar(null);
    } catch (err) {
      toast(mensajeError(err), 'error');
    } finally {
      setProcesando(false);
    }
  };

  const p = post.data;
  return (
    <div className="container page" style={{ maxWidth: 920 }}>
      <Link to="/comunidad" className="link-arrow" style={{ marginBottom: 20 }}><ArrowLeft size={16} /> Volver a la comunidad</Link>
      <AsyncView loading={post.loading} error={post.error} onRetry={post.recargar} data={p}>
        {p && (
          <>
            <article className="card mt-16">
              <div className="post-head row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Link to={`/perfil/${p.autor.id}`} className="row" style={{ gap: 12, color: 'inherit' }}>
                  <Avatar usuario={p.autor} size={48} />
                  <span><strong style={{ display: 'block' }}>{p.autor.nombre}</strong><span className="muted">{hace(p.fechaCreacion)}</span></span>
                </Link>
                <div className="row">
                  <Badge tone={TONO[p.categoria]}>{CATEGORIA_FORO[p.categoria]}</Badge>
                  {(p.autor.id === usuario.id || moderador) && (
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => setBorrar({ tipo: 'post' })}>{p.autor.id === usuario.id ? 'Eliminar' : 'Retirar'}</Button>
                  )}
                </div>
              </div>
              <h1 className="mt-24" style={{ fontSize: 26 }}>{p.titulo}</h1>
              <p className="mt-16" style={{ fontSize: 16, whiteSpace: 'pre-line' }}>{p.contenido}</p>
              <div className="post-foot mt-24">
                {p.videojuego && <Link to={`/videojuegos/${p.videojuego.id}`} className="row"><Gamepad2 size={16} /> {p.videojuego.titulo} · {p.videojuego.plataforma}</Link>}
                {p.solicitud && <span className="row"><UserCheck size={16} /> {TIPO_SOLICITUD[p.solicitud.tipo]} {p.solicitud.folio} · {p.solicitud.videojuego} · Completada</span>}
                {p.calificacion && <Rating value={p.calificacion} sufijo={p.usuarioValorado ? ` a ${p.usuarioValorado.nombre}` : ' al videojuego'} />}
              </div>
            </article>

            <section className="card mt-24">
              <h2>{p.totalComentarios} comentarios</h2>
              <form onSubmit={comentar} className="stack mt-16" noValidate>
                <Textarea name="contenido" placeholder="Escribe un comentario..." value={form.valores.contenido} onChange={form.onChange} error={form.errores.contenido} style={{ minHeight: 80 }} aria-label="Comentario" />
                <div className="row" style={{ justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="dark" icon={Send} loading={procesando && !borrar}>Comentar</Button>
                </div>
              </form>
              <AsyncView loading={comentarios.loading} error={comentarios.error} onRetry={comentarios.recargar} data={comentarios.data}>
                {comentarios.data?.content.length === 0 ? (
                  <EmptyState titulo="Sin comentarios" texto="Abre la conversación." />
                ) : (
                  comentarios.data?.content.map((c) => (
                    <div key={c.id} className="comment">
                      <Avatar usuario={c.autor} size={36} />
                      <div className="grow">
                        <div className="row" style={{ justifyContent: 'space-between' }}>
                          <span><strong>{c.autor.nombre}</strong> <span className="muted small">· {hace(c.fechaCreacion)}</span></span>
                          {(c.autor.id === usuario.id || moderador) && (
                            <button className="icon-btn" onClick={() => setBorrar({ tipo: 'comentario', id: c.id })} aria-label="Eliminar comentario"><Trash2 size={16} color="var(--danger)" /></button>
                          )}
                        </div>
                        <p className="mt-8">{c.contenido}</p>
                      </div>
                    </div>
                  ))
                )}
                {comentarios.data && <Pagination page={comentarios.data.page} totalPages={comentarios.data.totalPages} onChange={setPage} />}
              </AsyncView>
            </section>
          </>
        )}
      </AsyncView>

      <ConfirmModal
        abierto={!!borrar}
        onClose={() => setBorrar(null)}
        onConfirm={eliminar}
        loading={procesando}
        peligro
        titulo={borrar?.tipo === 'post' ? '¿Eliminar esta publicación?' : '¿Eliminar este comentario?'}
        mensaje={borrar?.tipo === 'post' ? 'Se eliminará junto con todos sus comentarios. Esta acción no se puede deshacer.' : 'El comentario se eliminará permanentemente.'}
        textoConfirmar="Eliminar"
      />
    </div>
  );
}
