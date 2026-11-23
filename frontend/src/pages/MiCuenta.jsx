import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, KeyRound, Pencil, Phone, Save, Trash2, UserRound } from 'lucide-react';
import { Avatar, Badge, Button, ConfirmModal, EmptyState, ErrorState, GameCover, Input, Loader, Pagination, PasswordInput, Textarea } from '../components/ui';
import useAsync from '../hooks/useAsync';
import useForm from '../hooks/useForm';
import { generalApi, usuariosApi, videojuegosApi } from '../api/services';
import { erroresCampo, mensajeError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ESTADO_PUBLICACION, ROLES, fecha, precio, tonoPublicacion } from '../utils/format';
import { v } from '../utils/validators';

export default function MiCuenta() {
  const { usuario, actualizarUsuario, puedeOperar } = useAuth();
  const toast = useToast();
  const perfil = useForm(
    { nombre: usuario.nombre, telefono: usuario.telefono || '', ciudad: usuario.ciudad || '', bio: usuario.bio || '', avatarUrl: usuario.avatarUrl || '' },
    {
      nombre: [v.requerido('El nombre es obligatorio'), v.min(3, 'El nombre debe tener entre 3 y 100 caracteres'), v.max(100)],
      telefono: [v.requerido('El teléfono es obligatorio'), v.telefono()],
      ciudad: [v.max(100)],
      bio: [v.max(500)],
    },
  );
  const pass = useForm({ actual: '', nueva: '', confirmar: '' }, {
    actual: [v.requerido('Ingresa tu contraseña actual')],
    nueva: [v.requerido('La nueva contraseña es obligatoria'), v.password()],
    confirmar: [v.requerido('Confirma la nueva contraseña'), v.igualA('nueva', 'Las contraseñas no coinciden')],
  });
  const [guardando, setGuardando] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorAvatar, setErrorAvatar] = useState(null);
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(0);
  const [eliminar, setEliminar] = useState(null);
  const archivo = useRef(null);

  const mios = useAsync(() => (puedeOperar ? videojuegosApi.mios({ estado, page, size: 6 }) : Promise.resolve(null)), [estado, page, puedeOperar]);

  const subirAvatar = async (f) => {
    setErrorAvatar(null);
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return setErrorAvatar('Solo JPG, PNG o WEBP');
    if (f.size > 5 * 1024 * 1024) return setErrorAvatar('La imagen excede 5 MB');
    setSubiendo(true);
    try {
      const r = await generalApi.subirImagen(f);
      perfil.cambiar('avatarUrl', r.url);
    } catch (err) {
      setErrorAvatar(erroresCampo(err).archivo || mensajeError(err));
    } finally {
      setSubiendo(false);
      archivo.current.value = '';
    }
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    if (!perfil.validar()) return;
    setGuardando('perfil');
    try {
      const u = await usuariosApi.actualizar({ ...perfil.valores, nombre: perfil.valores.nombre.trim(), telefono: perfil.valores.telefono.trim() });
      actualizarUsuario(u);
      toast('Perfil actualizado');
    } catch (err) {
      perfil.setErroresServidor(erroresCampo(err));
      toast(mensajeError(err), 'error');
    } finally {
      setGuardando(null);
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    if (!pass.validar()) return;
    setGuardando('pass');
    try {
      const r = await usuariosApi.cambiarPassword({ actual: pass.valores.actual, nueva: pass.valores.nueva });
      toast(r.mensaje);
      pass.setValores({ actual: '', nueva: '', confirmar: '' });
    } catch (err) {
      pass.setErroresServidor(erroresCampo(err));
      toast(mensajeError(err), 'error');
    } finally {
      setGuardando(null);
    }
  };

  const borrarJuego = async () => {
    setGuardando('borrar');
    try {
      await videojuegosApi.eliminar(eliminar.id);
      toast('Publicación eliminada');
      setEliminar(null);
      mios.recargar();
    } catch (err) {
      toast(mensajeError(err), 'error');
      setEliminar(null);
    } finally {
      setGuardando(null);
    }
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Mi cuenta</h1>
          <p>Administra tus datos, tu contraseña y tus publicaciones.</p>
        </div>
        <Link to={`/perfil/${usuario.id}`} className="btn btn-secondary"><UserRound size={18} /> Ver mi perfil público</Link>
      </div>

      <div className="grid grid-2">
        <form className="card stack" onSubmit={guardarPerfil} noValidate>
          <h2 className="card-title" style={{ marginBottom: 4 }}><Pencil size={20} /> Datos del perfil</h2>
          <div className="row" style={{ gap: 20 }}>
            <Avatar usuario={{ ...usuario, nombre: perfil.valores.nombre || usuario.nombre, avatarUrl: perfil.valores.avatarUrl }} size={88} />
            <div className="stack" style={{ gap: 8 }}>
              <div className="row wrap">
                <Button type="button" variant="secondary" size="sm" icon={Camera} loading={subiendo} onClick={() => archivo.current.click()}>Cambiar foto</Button>
                {perfil.valores.avatarUrl && <Button type="button" variant="ghost" size="sm" onClick={() => perfil.cambiar('avatarUrl', '')}>Usar avatar por defecto</Button>}
              </div>
              {errorAvatar ? <span className="field-error">{errorAvatar}</span> : <span className="muted small">{usuario.email} · {ROLES[usuario.rol]}</span>}
            </div>
            <input ref={archivo} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => subirAvatar(e.target.files[0])} />
          </div>
          <Input label="Nombre completo" name="nombre" required value={perfil.valores.nombre} onChange={perfil.onChange} error={perfil.errores.nombre} />
          <div className="form-grid">
            <Input label="Teléfono (SMS y WhatsApp)" name="telefono" required icon={Phone} value={perfil.valores.telefono} onChange={perfil.onChange} error={perfil.errores.telefono} help="Formato +525512345678" />
            <Input label="Ciudad" name="ciudad" value={perfil.valores.ciudad} onChange={perfil.onChange} error={perfil.errores.ciudad} />
          </div>
          <Textarea label="Sobre mí" name="bio" value={perfil.valores.bio} onChange={perfil.onChange} error={perfil.errores.bio} help={`${perfil.valores.bio.length}/500`} />
          <div><Button type="submit" icon={Save} loading={guardando === 'perfil'}>Guardar cambios</Button></div>
        </form>

        <form className="card stack" onSubmit={cambiarPassword} noValidate style={{ alignSelf: 'start' }}>
          <h2 className="card-title" style={{ marginBottom: 4 }}><KeyRound size={20} /> Cambiar contraseña</h2>
          <PasswordInput label="Contraseña actual" name="actual" required value={pass.valores.actual} onChange={pass.onChange} error={pass.errores.actual} autoComplete="current-password" />
          <PasswordInput label="Nueva contraseña" name="nueva" required mostrarReglas value={pass.valores.nueva} onChange={pass.onChange} error={pass.errores.nueva} autoComplete="new-password" />
          <PasswordInput label="Confirmar nueva contraseña" name="confirmar" required value={pass.valores.confirmar} onChange={pass.onChange} error={pass.errores.confirmar} autoComplete="new-password" />
          <div><Button type="submit" variant="dark" loading={guardando === 'pass'}>Actualizar contraseña</Button></div>
        </form>
      </div>

      {puedeOperar && (
        <>
          <div className="section-head">
            <h2>Mis publicaciones</h2>
            <div className="row">
              <select className="select" style={{ width: 200, height: 44 }} value={estado} onChange={(e) => { setEstado(e.target.value); setPage(0); }} aria-label="Filtrar por estado">
                <option value="">Todos los estados</option>
                {Object.entries(ESTADO_PUBLICACION).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <Link to="/publicar" className="btn btn-primary">Publicar</Link>
            </div>
          </div>
          {mios.error ? <ErrorState mensaje={mios.error} onRetry={mios.recargar} /> : mios.loading && !mios.data ? <Loader /> : mios.data?.content.length === 0 ? (
            <EmptyState titulo="Sin publicaciones" texto="Aquí aparecerán tus videojuegos publicados y borradores." />
          ) : mios.data && (
            <>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Videojuego</th><th>Modalidad</th><th>Precio</th><th>Publicado</th><th>Estado</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {mios.data.content.map((j) => (
                      <tr key={j.id}>
                        <td><Link to={`/videojuegos/${j.id}`} className="row" style={{ gap: 12, color: 'inherit' }}><GameCover className="mini" titulo={j.titulo} plataforma={j.plataforma} src={j.portadaUrl} /><span><strong>{j.titulo}</strong><br /><span className="muted small">{j.plataforma}</span></span></Link></td>
                        <td>{{ VENTA: 'Venta', PRESTAMO: 'Préstamo', AMBAS: 'Venta y préstamo' }[j.modalidad]}</td>
                        <td>{j.precioVenta ? precio(j.precioVenta) : '—'}</td>
                        <td>{fecha(j.fechaPublicacion)}</td>
                        <td><Badge tone={tonoPublicacion[j.estadoPublicacion]}>{ESTADO_PUBLICACION[j.estadoPublicacion]}</Badge></td>
                        <td>
                          <div className="row">
                            {j.estadoPublicacion !== 'VENDIDO' && <Link to={`/videojuegos/${j.id}/editar`} className="btn btn-secondary btn-sm">Editar</Link>}
                            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setEliminar(j)} aria-label="Eliminar" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={mios.data.page} totalPages={mios.data.totalPages} onChange={setPage} />
            </>
          )}
        </>
      )}

      <ConfirmModal abierto={!!eliminar} onClose={() => setEliminar(null)} onConfirm={borrarJuego} loading={guardando === 'borrar'} peligro
        titulo="¿Eliminar publicación?" mensaje={`"${eliminar?.titulo}" se eliminará de forma permanente.`} textoConfirmar="Eliminar" />
    </div>
  );
}
