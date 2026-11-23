import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2, UserCheck, UserX } from 'lucide-react';
import { Avatar, Badge, Button, ConfirmModal, EmptyState, ErrorState, Input, Loader, Modal, Pagination, PasswordInput, Select } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import useForm from '../../hooks/useForm';
import { adminApi } from '../../api/services';
import { erroresCampo, mensajeError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES, fecha } from '../../utils/format';
import { v } from '../../utils/validators';

export default function AdminUsuarios() {
  const { usuario: yo } = useAuth();
  const toast = useToast();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  const [rol, setRol] = useState('');
  const [activo, setActivo] = useState('');
  const [page, setPage] = useState(0);
  const [editar, setEditar] = useState(null); // null | {} nuevo | usuario
  const [confirmar, setConfirmar] = useState(null); // { tipo: 'eliminar'|'activo', u }
  const [procesando, setProcesando] = useState(false);
  const lista = useAsync(() => adminApi.usuarios({ q, rol, activo, page, size: 8 }), [q, rol, activo, page]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(texto.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [texto]);

  const ejecutar = async () => {
    setProcesando(true);
    const { tipo, u } = confirmar;
    try {
      if (tipo === 'eliminar') {
        await adminApi.eliminarUsuario(u.id);
        toast('Usuario eliminado');
      } else {
        await adminApi.activoUsuario(u.id, !u.activo);
        toast(u.activo ? 'Usuario desactivado' : 'Usuario activado');
      }
      setConfirmar(null);
      lista.recargar();
    } catch (err) {
      toast(mensajeError(err), 'error');
      setConfirmar(null);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="row wrap">
          <div className="input-wrap" style={{ width: 280 }}>
            <input className="input has-icon" placeholder="Buscar por nombre o correo" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar usuarios" />
            <span className="input-icon"><Search size={18} /></span>
          </div>
          <select className="select" style={{ width: 170 }} value={rol} onChange={(e) => { setRol(e.target.value); setPage(0); }} aria-label="Rol">
            <option value="">Todos los roles</option>
            {Object.entries(ROLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select className="select" style={{ width: 150 }} value={activo} onChange={(e) => { setActivo(e.target.value); setPage(0); }} aria-label="Estado">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
        <Button icon={Plus} onClick={() => setEditar({})}>Nuevo usuario</Button>
      </div>

      {lista.error ? <ErrorState mensaje={lista.error} onRetry={lista.recargar} /> : lista.loading && !lista.data ? <Loader /> : lista.data.content.length === 0 ? (
        <EmptyState titulo="Sin usuarios" texto="No hay usuarios que coincidan con los filtros." />
      ) : (
        <>
          <div className="table-wrap" style={{ opacity: lista.loading ? 0.6 : 1 }}>
            <table className="table">
              <thead><tr><th>Usuario</th><th>Rol</th><th>Teléfono</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {lista.data.content.map((u) => (
                  <tr key={u.id}>
                    <td><Link to={`/perfil/${u.id}`} className="cell-user" style={{ color: 'inherit' }}><Avatar usuario={u} size={40} /><span><strong>{u.nombre}</strong><small>{u.email}</small></span></Link></td>
                    <td><Badge tone={u.rol === 'ADMIN' ? 'warning' : u.rol === 'MODERADOR' ? 'info' : 'neutral'}>{ROLES[u.rol]}</Badge></td>
                    <td>{u.telefono || '—'}</td>
                    <td>{fecha(u.fechaRegistro)}</td>
                    <td><Badge tone={u.activo ? 'success' : 'danger'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td>
                      <div className="row">
                        <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditar(u)} aria-label="Editar" />
                        {u.id !== yo.id && (
                          <>
                            <Button variant="secondary" size="sm" icon={u.activo ? UserX : UserCheck} onClick={() => setConfirmar({ tipo: 'activo', u })} aria-label={u.activo ? 'Desactivar' : 'Activar'} />
                            <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmar({ tipo: 'eliminar', u })} aria-label="Eliminar" />
                          </>
                        )}
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

      {editar && <FormUsuario usuario={editar} esYo={editar.id === yo.id} onClose={() => setEditar(null)} onGuardado={() => { setEditar(null); lista.recargar(); }} />}

      <ConfirmModal
        abierto={!!confirmar}
        onClose={() => setConfirmar(null)}
        onConfirm={ejecutar}
        loading={procesando}
        peligro={confirmar?.tipo === 'eliminar' || confirmar?.u.activo}
        titulo={confirmar?.tipo === 'eliminar' ? '¿Eliminar usuario?' : confirmar?.u.activo ? '¿Desactivar usuario?' : '¿Activar usuario?'}
        mensaje={
          confirmar?.tipo === 'eliminar'
            ? `${confirmar.u.nombre} se eliminará permanentemente. Si tiene historial, el sistema te pedirá desactivarlo.`
            : confirmar?.u.activo
              ? `${confirmar.u.nombre} no podrá iniciar sesión hasta que lo actives de nuevo.`
              : `${confirmar?.u.nombre} podrá volver a iniciar sesión.`
        }
        textoConfirmar={confirmar?.tipo === 'eliminar' ? 'Eliminar' : confirmar?.u.activo ? 'Desactivar' : 'Activar'}
      />
    </>
  );
}

function FormUsuario({ usuario, esYo, onClose, onGuardado }) {
  const toast = useToast();
  const nuevo = !usuario.id;
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const form = useForm(
    { nombre: usuario.nombre || '', email: usuario.email || '', telefono: usuario.telefono || '', ciudad: usuario.ciudad || '', rol: usuario.rol || 'JUGADOR', activo: usuario.activo ?? true, password: '' },
    {
      nombre: [v.requerido('El nombre es obligatorio'), v.min(3, 'El nombre debe tener entre 3 y 100 caracteres'), v.max(100)],
      email: [v.requerido('El correo es obligatorio'), v.email()],
      telefono: [v.telefono()],
      ciudad: [v.max(100)],
      rol: [v.requerido('Selecciona un rol')],
      ...(nuevo && { password: [v.requerido('La contraseña es obligatoria'), v.password()] }),
    },
  );
  const f = form.valores;

  const guardar = async () => {
    setError(null);
    if (!form.validar()) return;
    setEnviando(true);
    const base = { nombre: f.nombre.trim(), email: f.email.trim(), telefono: f.telefono.trim() || null, ciudad: f.ciudad || null, rol: f.rol };
    try {
      if (nuevo) await adminApi.crearUsuario({ ...base, password: f.password });
      else await adminApi.actualizarUsuario(usuario.id, { ...base, activo: f.activo });
      toast(nuevo ? 'Usuario creado' : 'Usuario actualizado');
      onGuardado();
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal abierto onClose={onClose} titulo={nuevo ? 'Nuevo usuario' : `Editar ${usuario.nombre}`} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button loading={enviando} onClick={guardar}>Guardar</Button></>}>
      <div className="stack">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <Input label="Nombre" name="nombre" required value={f.nombre} onChange={form.onChange} error={form.errores.nombre} />
          <Input label="Correo" name="email" type="email" required value={f.email} onChange={form.onChange} error={form.errores.email} />
          <Input label="Teléfono" name="telefono" value={f.telefono} onChange={form.onChange} error={form.errores.telefono} help="+525512345678" />
          <Input label="Ciudad" name="ciudad" value={f.ciudad} onChange={form.onChange} error={form.errores.ciudad} />
          <Select label="Rol" name="rol" required value={f.rol} onChange={form.onChange} error={form.errores.rol} disabled={esYo}>
            {Object.entries(ROLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </Select>
          {!nuevo && (
            <div className="field" style={{ justifyContent: 'flex-end' }}>
              <label className="checkbox"><input type="checkbox" name="activo" checked={f.activo} onChange={form.onChange} disabled={esYo} /> Cuenta activa</label>
            </div>
          )}
          {nuevo && <PasswordInput className="full" label="Contraseña" name="password" required mostrarReglas value={f.password} onChange={form.onChange} error={form.errores.password} autoComplete="new-password" />}
        </div>
      </div>
    </Modal>
  );
}
