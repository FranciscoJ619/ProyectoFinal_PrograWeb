import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, ChevronRight, Disc3, MapPin, MessageCircle, Package, Pencil, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { AsyncView, Avatar, Badge, Button, ConfirmModal, EmptyState, GameCover, Input, Modal, Rating, StarsInput, Textarea } from '../components/ui';
import useAsync from '../hooks/useAsync';
import useForm from '../hooks/useForm';
import { foroApi, solicitudesApi, usuariosApi, videojuegosApi } from '../api/services';
import { erroresCampo, mensajeError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ESTADO_FISICO, ESTADO_PUBLICACION, fecha, precio, tonoPublicacion } from '../utils/format';
import { hoyISO, v } from '../utils/validators';

function sumarDias(iso, dias) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + dias);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function DetalleVideojuego() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario, puedeOperar, esAdmin } = useAuth();
  const juego = useAsync(() => videojuegosApi.detalle(id), [id]);
  const resenas = useAsync(() => foroApi.publicaciones({ categoria: 'RESENA_VIDEOJUEGO', videojuegoId: id, size: 4 }), [id]);
  const [foto, setFoto] = useState(0);
  const [modal, setModal] = useState(null); // 'compra' | 'prestamo' | 'contacto' | 'resena' | 'eliminar'
  const [enviando, setEnviando] = useState(false);

  const j = juego.data;
  const esMio = j && j.propietario.id === usuario.id;
  const disponible = j?.estadoPublicacion === 'PUBLICADO';
  const permiteVenta = j && (j.modalidad === 'VENTA' || j.modalidad === 'AMBAS');
  const permitePrestamo = j && (j.modalidad === 'PRESTAMO' || j.modalidad === 'AMBAS');
  const inicioMin = j?.disponibleDesde && j.disponibleDesde > hoyISO() ? j.disponibleDesde : hoyISO();

  const prestamo = useForm({ fechaInicio: '', fechaDevolucion: '', mensaje: '' }, (vals) => ({
    fechaInicio: [v.requerido('Elige la fecha de inicio'), v.fechaNoPasada(), (x) => (x && x < inicioMin ? `Disponible a partir del ${fecha(inicioMin)}` : null)],
    fechaDevolucion: [
      v.requerido('Elige la fecha de devolución'),
      (x) => (x && vals.fechaInicio && x <= vals.fechaInicio ? 'Debe ser posterior a la fecha de inicio' : null),
      (x) => (x && vals.fechaInicio && j?.diasMaxPrestamo && x > sumarDias(vals.fechaInicio, j.diasMaxPrestamo) ? `Máximo ${j.diasMaxPrestamo} días de préstamo` : null),
    ],
    mensaje: [v.max(400)],
  }));
  const compra = useForm({ mensaje: '' }, { mensaje: [v.max(400)] });
  const contacto = useForm({ mensaje: '' }, { mensaje: [v.requerido('Escribe un mensaje'), v.min(10, 'El mensaje debe tener entre 10 y 500 caracteres'), v.max(500)] });
  const resena = useForm({ titulo: '', contenido: '', calificacion: 0 }, {
    titulo: [v.requerido('El título es obligatorio'), v.min(5, 'El título debe tener entre 5 y 150 caracteres'), v.max(150)],
    contenido: [v.requerido('Cuéntanos tu opinión'), v.min(20, 'Escribe al menos 20 caracteres'), v.max(3000)],
    calificacion: [(x) => (!x ? 'Califica el videojuego de 1 a 5 estrellas' : null)],
  });

  const enviar = async (form, accion, exito) => {
    if (!form.validar()) return false;
    setEnviando(true);
    try {
      await accion();
      setModal(null);
      toast(exito);
      return true;
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      toast(mensajeError(err), 'error');
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const solicitarPrestamo = () =>
    enviar(prestamo, () => solicitudesApi.crear({ videojuegoId: j.id, tipo: 'PRESTAMO', ...prestamo.valores }),
      `Solicitud enviada a ${j.propietario.nombre}. Le avisamos por correo y WhatsApp.`).then((ok) => ok && prestamo.setValores({ fechaInicio: '', fechaDevolucion: '', mensaje: '' }));

  const comprar = () =>
    enviar(compra, () => solicitudesApi.crear({ videojuegoId: j.id, tipo: 'COMPRA', mensaje: compra.valores.mensaje }),
      'Solicitud de compra enviada. El pago se acuerda en persona al recibir el juego.');

  const contactar = () =>
    enviar(contacto, () => usuariosApi.contactar(j.propietario.id, { mensaje: contacto.valores.mensaje, videojuegoId: j.id }),
      `Mensaje enviado a ${j.propietario.nombre}.`).then((ok) => ok && contacto.setValores({ mensaje: '' }));

  const publicarResena = () =>
    enviar(resena, async () => {
      await foroApi.crear({ categoria: 'RESENA_VIDEOJUEGO', videojuegoId: j.id, ...resena.valores });
      resenas.recargar();
      juego.recargar();
    }, '¡Gracias! Tu reseña ya aparece en la comunidad.').then((ok) => ok && resena.setValores({ titulo: '', contenido: '', calificacion: 0 }));

  const eliminar = async () => {
    setEnviando(true);
    try {
      await videojuegosApi.eliminar(j.id);
      toast('Publicación eliminada');
      navigate('/catalogo', { replace: true });
    } catch (err) {
      toast(mensajeError(err), 'error');
      setModal(null);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container page">
      <AsyncView loading={juego.loading} error={juego.error} onRetry={juego.recargar} data={j}>
        {j && (
          <>
            <nav className="breadcrumb" aria-label="Ruta">
              <Link to="/catalogo">Catálogo</Link> <ChevronRight size={16} />
              <Link to={`/catalogo?plataformaIds=${j.plataforma.id}`}>{j.plataforma.nombre}</Link> <ChevronRight size={16} />
              <span style={{ color: 'var(--text)' }}>{j.titulo}</span>
            </nav>

            <div className="detail">
              <div>
                <div className="card gallery-main">
                  <GameCover titulo={j.titulo} plataforma={j.plataforma.nombre} src={j.imagenes[foto]} />
                </div>
                {j.imagenes.length > 1 && (
                  <div className="thumbs">
                    {j.imagenes.map((img, i) => (
                      <button key={img} className={i === foto ? 'active' : ''} onClick={() => setFoto(i)} aria-label={`Foto ${i + 1}`}>
                        <GameCover titulo={j.titulo} plataforma={j.plataforma.nombre} src={img} />
                      </button>
                    ))}
                  </div>
                )}
                <div className="card soft mt-16 row" style={{ gap: 14 }}>
                  <Package size={24} color="var(--retro)" />
                  <div>
                    <strong style={{ color: 'var(--retro)' }}>Recibes el juego, no un código.</strong>
                    <p className="muted">Ejemplar físico · {j.imagenes.length > 0 ? 'Fotografías del propietario' : 'El propietario aún no sube fotos'}</p>
                  </div>
                </div>
              </div>

              <div className="stack">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="badge badge-outline">{j.plataforma.nombre}</span>
                  {disponible ? <Badge tone="success">Disponible</Badge> : <Badge tone={tonoPublicacion[j.estadoPublicacion]}>{ESTADO_PUBLICACION[j.estadoPublicacion]}</Badge>}
                </div>
                <h1 style={{ fontSize: 34 }}>{j.titulo}</h1>
                <div className="row wrap muted" style={{ gap: 16 }}>
                  <Rating value={j.calificacionPromedio} sufijo={` del videojuego · ${j.totalResenas} reseñas`} />
                  <span>{j.generos.map((g) => g.nombre).join(' · ')}{j.anioLanzamiento ? ` · ${j.anioLanzamiento}` : ''}</span>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <Disc3 size={20} color="var(--retro)" />
                  <strong style={{ color: 'var(--retro)' }}>{ESTADO_FISICO[j.estadoFisico]}</strong>
                </div>
                <p style={{ fontSize: 16 }} className="muted">{j.descripcion}</p>

                <div className="grid grid-2" style={{ gap: 16 }}>
                  {permiteVenta && (
                    <div className="card price-box">
                      <span className="overline">Precio de venta</span>
                      <div className="big">{precio(j.precioVenta)}</div>
                      <span className="muted">Entrega a acordar en {j.ubicacion}</span>
                    </div>
                  )}
                  {permitePrestamo && (
                    <div className="card soft price-box">
                      <span className="overline" style={{ color: 'var(--retro)' }}>{permiteVenta ? 'También disponible para préstamo' : 'Disponible para préstamo'}</span>
                      <h3 style={{ fontSize: 20, margin: '8px 0' }}>Hasta {j.diasMaxPrestamo} días · Sin costo</h3>
                      <p className="muted">{j.condicionesPrestamo}</p>
                      {j.disponibleDesde && <p className="small muted mt-8">Disponible desde el {fecha(j.disponibleDesde)}</p>}
                    </div>
                  )}
                </div>

                <div className="card row" style={{ gap: 16 }}>
                  <Avatar usuario={j.propietario} size={64} />
                  <div className="grow">
                    <h3 style={{ fontSize: 18 }}>{j.propietario.nombre}</h3>
                    <div className="row wrap muted" style={{ gap: 14 }}>
                      <Rating value={j.propietario.calificacionPromedio} sufijo=" como usuario" />
                      <span>{j.propietario.transaccionesCompletadas} transacciones completadas</span>
                    </div>
                  </div>
                  <Link to={`/perfil/${j.propietario.id}`} className="link-arrow">Ver perfil <ArrowRight size={16} /></Link>
                </div>

                {esMio || esAdmin ? (
                  <div className="grid grid-2" style={{ gap: 16 }}>
                    <Link to={`/videojuegos/${j.id}/editar`} className="btn btn-secondary"><Pencil size={18} /> Editar publicación</Link>
                    <Button variant="danger" icon={Trash2} onClick={() => setModal('eliminar')}>Eliminar</Button>
                  </div>
                ) : puedeOperar ? (
                  <div className="grid grid-2" style={{ gap: 16 }}>
                    {permiteVenta && <Button icon={ShoppingBag} disabled={!disponible} onClick={() => setModal('compra')}>Comprar ahora</Button>}
                    {permitePrestamo && <Button variant="secondary" icon={CalendarDays} disabled={!disponible} onClick={() => setModal('prestamo')}>Solicitar préstamo</Button>}
                  </div>
                ) : null}
                {!disponible && !esMio && <div className="alert alert-info">Este ejemplar no está disponible por ahora. Puedes contactar al propietario.</div>}

                <div className="row" style={{ justifyContent: 'space-between' }}>
                  {!esMio ? (
                    <button className="link-arrow" onClick={() => setModal('contacto')}><MessageCircle size={18} /> Contactar propietario</button>
                  ) : <span />}
                  <span className="row muted"><MapPin size={16} /> {j.ubicacion}</span>
                </div>
              </div>
            </div>

            <div className="section-head">
              <h2>Lo que la comunidad opina del videojuego</h2>
              <div className="row" style={{ gap: 16 }}>
                {!esMio && <Button variant="secondary" size="sm" icon={Star} onClick={() => setModal('resena')}>Escribir reseña</Button>}
                <Link to={`/comunidad?categoria=RESENA_VIDEOJUEGO`} className="link-arrow">Ver reseñas <ArrowRight size={16} /></Link>
              </div>
            </div>
            <AsyncView loading={resenas.loading} error={resenas.error} onRetry={resenas.recargar} data={resenas.data}>
              {resenas.data?.content.length === 0 ? (
                <EmptyState icon={Star} titulo="Aún no hay reseñas" texto="Sé el primero en opinar sobre este videojuego." />
              ) : (
                <div className="grid grid-2">
                  {resenas.data?.content.map((r) => (
                    <Link key={r.id} to={`/comunidad/${r.id}`} className="card" style={{ color: 'inherit', textDecoration: 'none' }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <span className="row"><Avatar usuario={r.autor} size={32} /> <strong>{r.autor.nombre}</strong> <span className="muted">{fecha(r.fechaCreacion)}</span></span>
                        <Rating value={r.calificacion} sufijo=" juego" />
                      </div>
                      <h3 className="mt-16">{r.titulo}</h3>
                      <p className="muted mt-8">{r.contenido}</p>
                    </Link>
                  ))}
                </div>
              )}
            </AsyncView>
            <p className="muted small mt-16">Estas reseñas valoran el videojuego, no al propietario ni el estado de este ejemplar.</p>

            {/* ---------------- Modales ---------------- */}
            <Modal
              abierto={modal === 'prestamo'}
              onClose={() => setModal(null)}
              titulo="Solicitar préstamo"
              subtitulo={`${j.titulo} · hasta ${j.diasMaxPrestamo} días sin costo`}
              icon={<div className="modal-icon" style={{ background: 'var(--retro-soft)', color: 'var(--retro)' }}><CalendarDays size={24} /></div>}
              footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="dark" loading={enviando} onClick={solicitarPrestamo}>Enviar solicitud</Button></>}
            >
              <div className="stack">
                <div className="form-grid">
                  <Input type="date" label="Fecha de inicio" name="fechaInicio" required min={inicioMin} value={prestamo.valores.fechaInicio} onChange={prestamo.onChange} error={prestamo.errores.fechaInicio} />
                  <Input type="date" label="Fecha de devolución" name="fechaDevolucion" required min={prestamo.valores.fechaInicio || inicioMin} value={prestamo.valores.fechaDevolucion} onChange={prestamo.onChange} error={prestamo.errores.fechaDevolucion} />
                </div>
                <Textarea label="Mensaje para el propietario" name="mensaje" placeholder="Preséntate y propón dónde recogerlo" value={prestamo.valores.mensaje} onChange={prestamo.onChange} error={prestamo.errores.mensaje} help={`${prestamo.valores.mensaje.length}/400`} />
                <div className="alert alert-info">Condiciones: {j.condicionesPrestamo}</div>
              </div>
            </Modal>

            <Modal
              abierto={modal === 'compra'}
              onClose={() => setModal(null)}
              titulo="Confirmar solicitud de compra"
              subtitulo="No se realiza ningún pago en línea: el pago y la entrega se acuerdan en persona."
              icon={<div className="modal-icon" style={{ background: '#fff8e1', color: 'var(--warning)' }}><ShoppingBag size={24} /></div>}
              footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button loading={enviando} onClick={comprar}>Confirmar compra</Button></>}
            >
              <div className="card tight row" style={{ gap: 14, boxShadow: 'none' }}>
                <GameCover className="mini" titulo={j.titulo} plataforma={j.plataforma.nombre} src={j.imagenes[0]} />
                <div className="grow"><strong>{j.titulo}</strong><p className="muted">{j.plataforma.nombre} · {ESTADO_FISICO[j.estadoFisico]}</p></div>
                <strong style={{ fontSize: 18 }}>{precio(j.precioVenta)}</strong>
              </div>
              <div className="mt-16">
                <Textarea label="Mensaje para el vendedor (opcional)" name="mensaje" value={compra.valores.mensaje} onChange={compra.onChange} error={compra.errores.mensaje} />
              </div>
            </Modal>

            <Modal
              abierto={modal === 'contacto'}
              onClose={() => setModal(null)}
              titulo={`Contactar a ${j.propietario.nombre}`}
              subtitulo="Le llegará como notificación, correo electrónico y WhatsApp."
              footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="dark" loading={enviando} onClick={contactar}>Enviar mensaje</Button></>}
            >
              <Textarea label="Mensaje" name="mensaje" required placeholder={`Hola, me interesa ${j.titulo}...`} value={contacto.valores.mensaje} onChange={contacto.onChange} error={contacto.errores.mensaje} help={`${contacto.valores.mensaje.length}/500`} />
            </Modal>

            <Modal
              abierto={modal === 'resena'}
              onClose={() => setModal(null)}
              titulo="Reseñar videojuego"
              subtitulo={`Califica ${j.titulo} como juego (no al propietario).`}
              footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button loading={enviando} onClick={publicarResena}>Publicar reseña</Button></>}
            >
              <div className="stack">
                <div className="field">
                  <span className="label">Calificación<span className="req">*</span></span>
                  <StarsInput value={resena.valores.calificacion} onChange={(n) => resena.cambiar('calificacion', n)} />
                  {resena.errores.calificacion && <span className="field-error">{resena.errores.calificacion}</span>}
                </div>
                <Input label="Título" name="titulo" required value={resena.valores.titulo} onChange={resena.onChange} error={resena.errores.titulo} />
                <Textarea label="Tu reseña" name="contenido" required value={resena.valores.contenido} onChange={resena.onChange} error={resena.errores.contenido} />
              </div>
            </Modal>

            <ConfirmModal
              abierto={modal === 'eliminar'}
              onClose={() => setModal(null)}
              onConfirm={eliminar}
              loading={enviando}
              peligro
              titulo="¿Eliminar esta publicación?"
              mensaje={`"${j.titulo}" se eliminará del catálogo de forma permanente. Si tiene historial de solicitudes, te sugeriremos pasarla a borrador.`}
              textoConfirmar="Sí, eliminar"
            />
          </>
        )}
      </AsyncView>
    </div>
  );
}
