import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, CircleDollarSign, Gamepad2, ImagePlus, Info, ShoppingBag, Trash2, Upload } from 'lucide-react';
import { Button, ErrorState, Field, GameCover, Input, Loader, Modal, Select, Textarea } from '../components/ui';
import useAsync from '../hooks/useAsync';
import useForm from '../hooks/useForm';
import { catalogosApi, generalApi, videojuegosApi } from '../api/services';
import { erroresCampo, mensajeError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { ESTADO_FISICO, MODALIDAD } from '../utils/format';
import { hoyISO, v } from '../utils/validators';

const VACIO = {
  titulo: '',
  plataformaId: '',
  generoIds: [],
  descripcion: '',
  anioLanzamiento: '',
  estadoFisico: '',
  modalidad: 'AMBAS',
  precioVenta: '',
  diasMaxPrestamo: '7',
  condicionesPrestamo: '',
  disponibleDesde: hoyISO(),
  ubicacion: '',
  imagenes: [],
  confirmo: false,
};
const MAX_FOTOS = 6;

const reglas = (f) => {
  const venta = f.modalidad === 'VENTA' || f.modalidad === 'AMBAS';
  const prestamo = f.modalidad === 'PRESTAMO' || f.modalidad === 'AMBAS';
  return {
    titulo: [v.requerido('El nombre del videojuego es obligatorio'), v.min(2), v.max(120)],
    plataformaId: [v.requerido('Selecciona una plataforma')],
    generoIds: [v.requerido('Selecciona al menos un género'), (x) => (x.length > 3 ? 'Máximo 3 géneros' : null)],
    descripcion: [v.requerido('La descripción es obligatoria'), v.min(20, 'Describe el estado real y qué incluye (mínimo 20 caracteres)'), v.max(600)],
    anioLanzamiento: [v.numeroEntre(1970, new Date().getFullYear() + 1, 'Año no válido')],
    estadoFisico: [v.requerido('Selecciona el estado físico')],
    modalidad: [v.requerido('Selecciona una modalidad')],
    ubicacion: [v.requerido('Indica la zona de entrega'), v.max(120)],
    precioVenta: venta ? [v.requerido('El precio es obligatorio para vender'), v.numeroEntre(1, 99999, 'El precio debe estar entre $1 y $99,999')] : [],
    diasMaxPrestamo: prestamo ? [v.requerido('Indica la duración máxima'), v.numeroEntre(1, 30, 'Entre 1 y 30 días')] : [],
    condicionesPrestamo: prestamo ? [v.requerido('Describe las condiciones de entrega y devolución'), v.max(400)] : [],
    disponibleDesde: prestamo ? [v.requerido('Indica desde cuándo está disponible'), v.fechaNoPasada()] : [],
    confirmo: [(x) => (!x ? 'Confirma que el juego es original y las fotos son propias' : null)],
  };
};

export default function Publicar() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const plataformas = useAsync(() => catalogosApi.plataformas(), []);
  const generos = useAsync(() => catalogosApi.generos(), []);
  const existente = useAsync(() => (editando ? videojuegosApi.detalle(id) : Promise.resolve(null)), [id]);
  const form = useForm(VACIO, reglas);
  const [enviando, setEnviando] = useState(null); // 'borrador' | 'publicar'
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState(null);
  const [publicado, setPublicado] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const inputFoto = useRef(null);
  const f = form.valores;

  // Al editar, se cargan los datos existentes
  useEffect(() => {
    const j = existente.data;
    if (!j) return;
    form.setValores({
      titulo: j.titulo,
      plataformaId: String(j.plataforma.id),
      generoIds: j.generos.map((g) => g.id),
      descripcion: j.descripcion,
      anioLanzamiento: j.anioLanzamiento ?? '',
      estadoFisico: j.estadoFisico,
      modalidad: j.modalidad,
      precioVenta: j.precioVenta ?? '',
      diasMaxPrestamo: j.diasMaxPrestamo ?? '7',
      condicionesPrestamo: j.condicionesPrestamo ?? '',
      disponibleDesde: j.disponibleDesde && j.disponibleDesde > hoyISO() ? j.disponibleDesde : hoyISO(),
      ubicacion: j.ubicacion,
      imagenes: j.imagenes,
      confirmo: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existente.data]);

  const venta = f.modalidad === 'VENTA' || f.modalidad === 'AMBAS';
  const prestamo = f.modalidad === 'PRESTAMO' || f.modalidad === 'AMBAS';

  const subirFotos = async (archivos) => {
    setErrorFoto(null);
    const lista = [...archivos].slice(0, MAX_FOTOS - f.imagenes.length);
    for (const a of lista) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(a.type)) return setErrorFoto('Solo se permiten imágenes JPG, PNG o WEBP');
      if (a.size > 5 * 1024 * 1024) return setErrorFoto(`"${a.name}" excede el tamaño máximo de 5 MB`);
    }
    setSubiendo(true);
    try {
      const urls = [];
      for (const a of lista) urls.push((await generalApi.subirImagen(a)).url);
      form.cambiar('imagenes', [...f.imagenes, ...urls]);
    } catch (err) {
      setErrorFoto(erroresCampo(err).archivo || mensajeError(err));
    } finally {
      setSubiendo(false);
      if (inputFoto.current) inputFoto.current.value = '';
    }
  };

  const alternarGenero = (gid) =>
    form.cambiar('generoIds', f.generoIds.includes(gid) ? f.generoIds.filter((x) => x !== gid) : [...f.generoIds, gid]);

  const guardar = async (borrador) => {
    setErrorGeneral(null);
    if (!form.validar()) {
      setErrorGeneral('Revisa los campos marcados en rojo.');
      return;
    }
    setEnviando(borrador ? 'borrador' : 'publicar');
    const body = {
      titulo: f.titulo.trim(),
      plataformaId: Number(f.plataformaId),
      generoIds: f.generoIds,
      descripcion: f.descripcion.trim(),
      anioLanzamiento: f.anioLanzamiento === '' ? null : Number(f.anioLanzamiento),
      estadoFisico: f.estadoFisico,
      modalidad: f.modalidad,
      precioVenta: venta ? Number(f.precioVenta) : null,
      diasMaxPrestamo: prestamo ? Number(f.diasMaxPrestamo) : null,
      condicionesPrestamo: prestamo ? f.condicionesPrestamo.trim() : null,
      disponibleDesde: prestamo ? f.disponibleDesde : null,
      ubicacion: f.ubicacion.trim(),
      imagenes: f.imagenes,
      borrador,
    };
    try {
      const r = editando ? await videojuegosApi.actualizar(id, body) : await videojuegosApi.crear(body);
      if (borrador) {
        toast('Borrador guardado');
        if (!editando) navigate(`/videojuegos/${r.id}/editar`, { replace: true });
      } else {
        setPublicado(r);
      }
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      setErrorGeneral(mensajeError(err));
    } finally {
      setEnviando(null);
    }
  };

  if (editando && existente.loading) return <div className="container page"><Loader /></div>;
  if (editando && existente.error) return <div className="container page"><ErrorState mensaje={existente.error} onRetry={existente.recargar} /></div>;

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>{editando ? 'Editar publicación' : 'Publica tu videojuego'}</h1>
          <p>Dale otra partida a ese juego que ya terminaste. Tú decides cómo compartirlo.</p>
        </div>
        {existente.data?.estadoPublicacion === 'BORRADOR' && <span className="badge badge-outline">Borrador guardado</span>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); guardar(false); }} noValidate>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }} id="publicar-grid">
          <div className="stack" style={{ gap: 24 }}>
            <section className="card">
              <h2 className="card-title"><Gamepad2 size={22} /> Información general</h2>
              <div className="form-grid">
                <Input className="full" label="Nombre del videojuego" name="titulo" required value={f.titulo} onChange={form.onChange} error={form.errores.titulo} placeholder="Metroid Dread" maxLength={120} />
                <Select label="Plataforma" name="plataformaId" required value={f.plataformaId} onChange={form.onChange} error={form.errores.plataformaId}>
                  <option value="">Selecciona...</option>
                  {plataformas.data?.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </Select>
                <Select label="Estado físico" name="estadoFisico" required value={f.estadoFisico} onChange={form.onChange} error={form.errores.estadoFisico}>
                  <option value="">Selecciona...</option>
                  {Object.entries(ESTADO_FISICO).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </Select>
                <Field className="full" label="Género (máximo 3)" required error={form.errores.generoIds}>
                  <div className="row wrap">
                    {generos.data?.map((g) => (
                      <button type="button" key={g.id} onClick={() => alternarGenero(g.id)}
                        className={`btn btn-sm ${f.generoIds.includes(g.id) ? 'btn-dark' : 'btn-secondary'}`}>
                        {g.nombre}
                      </button>
                    ))}
                    {generos.error && <span className="field-error">{generos.error}</span>}
                  </div>
                </Field>
                <Input label="Año de lanzamiento" name="anioLanzamiento" type="number" value={f.anioLanzamiento} onChange={form.onChange} error={form.errores.anioLanzamiento} placeholder="2021" />
                <Input label="Zona de entrega" name="ubicacion" required value={f.ubicacion} onChange={form.onChange} error={form.errores.ubicacion} placeholder="Coyoacán, CDMX" />
                <Textarea className="full" label="Descripción del ejemplar" name="descripcion" required value={f.descripcion} onChange={form.onChange} error={form.errores.descripcion} maxLength={600}
                  placeholder="Edición física en español. Incluye caja original y cartucho..." help={`${f.descripcion.length}/600 caracteres · Describe el estado real y qué incluye.`} />
              </div>
            </section>

            <section className="card">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Fotografías del producto</h2>
                <span className="badge badge-success">{f.imagenes.length} de {MAX_FOTOS} fotos</span>
              </div>
              <div className="grid grid-4" style={{ gap: 16 }}>
                {f.imagenes.length < MAX_FOTOS && (
                  <button type="button" className="card soft" style={{ border: '2px dashed #9fb3d1', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 140 }}
                    onClick={() => inputFoto.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); subirFotos(e.dataTransfer.files); }}
                    disabled={subiendo}>
                    {subiendo ? <span className="spinner" /> : <Upload size={24} color="var(--retro)" />}
                    <strong style={{ color: 'var(--retro)' }}>{subiendo ? 'Subiendo...' : 'Arrastra o selecciona fotos'}</strong>
                    <span className="muted small">JPG, PNG o WEBP · Máx. 5 MB</span>
                  </button>
                )}
                {f.imagenes.map((img, i) => (
                  <div key={img} style={{ position: 'relative' }}>
                    <GameCover titulo={f.titulo} src={img} className="square" />
                    <button type="button" className="icon-btn" style={{ position: 'absolute', top: 6, right: 6, background: '#fff' }}
                      onClick={() => form.cambiar('imagenes', f.imagenes.filter((x) => x !== img))} aria-label="Quitar foto">
                      <Trash2 size={16} color="var(--danger)" />
                    </button>
                    <span className="muted small">{i === 0 ? 'Portada principal' : `Foto ${i + 1}`}</span>
                  </div>
                ))}
              </div>
              <input ref={inputFoto} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => subirFotos(e.target.files)} />
              {errorFoto ? <p className="field-error mt-16">{errorFoto}</p> : <p className="muted small mt-16"><ImagePlus size={14} style={{ verticalAlign: -2 }} /> Usa fotos propias: portada, caja y disco o cartucho. Si no subes fotos, mostraremos una portada ilustrada.</p>}
            </section>
          </div>

          <div className="stack" style={{ gap: 24 }}>
            <section className="card">
              <h2 style={{ marginBottom: 20 }}>¿Cómo quieres compartirlo?</h2>
              <div className="segmented" role="radiogroup">
                {Object.entries(MODALIDAD).map(([k, l]) => (
                  <button type="button" key={k} className={f.modalidad === k ? 'active' : ''} onClick={() => form.cambiar('modalidad', k)} role="radio" aria-checked={f.modalidad === k}>{l}</button>
                ))}
              </div>
              <p className="muted small mt-16">
                {f.modalidad === 'AMBAS' ? 'Tu publicación aparecerá en ambas modalidades.' : f.modalidad === 'VENTA' ? 'Solo recibirás ofertas de compra.' : 'Solo recibirás solicitudes de préstamo.'}
              </p>
            </section>

            {venta && (
              <section className="card">
                <h2 className="card-title"><ShoppingBag size={22} /> Venta</h2>
                <Input label="Precio de venta" name="precioVenta" type="number" min="1" step="1" required icon={CircleDollarSign} value={f.precioVenta} onChange={form.onChange} error={form.errores.precioVenta}
                  help="Pesos mexicanos (MXN). El pago se acuerda entre jugadores." placeholder="850" />
              </section>
            )}

            {prestamo && (
              <section className="card">
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 className="row"><CalendarDays size={22} /> Préstamo</h2>
                  <span className="badge badge-success">Sin costo</span>
                </div>
                <div className="form-grid">
                  <Select label="Duración máxima" name="diasMaxPrestamo" required value={f.diasMaxPrestamo} onChange={form.onChange} error={form.errores.diasMaxPrestamo}>
                    {[3, 5, 7, 10, 14, 21, 30].map((d) => <option key={d} value={d}>{d} días</option>)}
                  </Select>
                  <Input label="Disponible desde" name="disponibleDesde" type="date" required min={hoyISO()} value={f.disponibleDesde} onChange={form.onChange} error={form.errores.disponibleDesde} />
                  <Textarea className="full" label="Entrega y devolución" name="condicionesPrestamo" required maxLength={400} value={f.condicionesPrestamo} onChange={form.onChange} error={form.errores.condicionesPrestamo}
                    placeholder="Entrega en Metro Coyoacán. Devolver caja y cartucho en el mismo estado." />
                </div>
                <div className="alert alert-info mt-16"><Info size={18} /> Recibirás solicitudes. El préstamo solo inicia cuando aceptes y acuerdes la entrega.</div>
              </section>
            )}
          </div>
        </div>

        <div className="field mt-24">
          <label className="checkbox">
            <input type="checkbox" name="confirmo" checked={f.confirmo} onChange={form.onChange} />
            Confirmo que el juego es original y las fotos son propias.
          </label>
          {form.errores.confirmo && <span className="field-error">{form.errores.confirmo}</span>}
        </div>
        {errorGeneral && <div className="alert alert-error mt-16" role="alert">{errorGeneral}</div>}

        <div className="row wrap mt-24" style={{ justifyContent: 'flex-end', gap: 16 }}>
          <Button type="button" variant="secondary" loading={enviando === 'borrador'} disabled={!!enviando || subiendo} onClick={() => guardar(true)}>Guardar borrador</Button>
          <Button type="submit" icon={ArrowRight} loading={enviando === 'publicar'} disabled={!!enviando || subiendo}>
            {editando ? 'Guardar y publicar' : 'Publicar videojuego'}
          </Button>
        </div>
      </form>

      <Modal
        abierto={!!publicado}
        onClose={() => navigate(`/videojuegos/${publicado.id}`)}
        titulo={editando ? '¡Cambios publicados!' : '¡Tu videojuego ya está publicado!'}
        icon={<div className="modal-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><CheckCircle2 size={26} /></div>}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setPublicado(null); form.setValores(VACIO); navigate('/publicar'); }}>Publicar otro</Button>
            <Button onClick={() => navigate(`/videojuegos/${publicado.id}`)}>Ver publicación</Button>
          </>
        }
      >
        <p className="muted">{publicado?.titulo} ya aparece en el catálogo. Te avisaremos por notificación, correo y WhatsApp cuando alguien lo solicite.</p>
      </Modal>
      <style>{`@media (max-width: 1024px){ #publicar-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
