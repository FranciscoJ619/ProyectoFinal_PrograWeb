import { useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button, ConfirmModal, EmptyState, ErrorState, Input, Loader, Modal, Pagination } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import useForm from '../../hooks/useForm';
import { catalogosApi } from '../../api/services';
import { erroresCampo, mensajeError } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { v } from '../../utils/validators';

const CONFIG = {
  plataformas: {
    titulo: 'Plataformas',
    singular: 'plataforma',
    listar: catalogosApi.paginaPlataformas,
    guardar: catalogosApi.guardarPlataforma,
    eliminar: catalogosApi.eliminarPlataforma,
    campos: [['nombre', 'Nombre'], ['fabricante', 'Fabricante']],
  },
  generos: {
    titulo: 'Géneros',
    singular: 'género',
    listar: catalogosApi.paginaGeneros,
    guardar: catalogosApi.guardarGenero,
    eliminar: catalogosApi.eliminarGenero,
    campos: [['nombre', 'Nombre']],
  },
};

export default function AdminCatalogos() {
  const [tipo, setTipo] = useState('plataformas');
  return (
    <>
      <div className="tabs" style={{ marginTop: -8 }}>
        {Object.entries(CONFIG).map(([k, c]) => (
          <button key={k} className={tipo === k ? 'active' : ''} onClick={() => setTipo(k)}>{c.titulo}</button>
        ))}
      </div>
      <TablaCatalogo key={tipo} config={CONFIG[tipo]} />
    </>
  );
}

function TablaCatalogo({ config }) {
  const toast = useToast();
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [editar, setEditar] = useState(null);
  const [borrar, setBorrar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const lista = useAsync(() => config.listar({ q, page, size: 8 }), [q, page]);

  useEffect(() => {
    const t = setTimeout(() => { setQ(texto.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [texto]);

  const eliminar = async () => {
    setProcesando(true);
    try {
      await config.eliminar(borrar.id);
      toast(`${config.singular[0].toUpperCase() + config.singular.slice(1)} eliminado`);
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
        <div className="input-wrap" style={{ width: 280 }}>
          <input className="input has-icon" placeholder={`Buscar ${config.singular}`} value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar" />
          <span className="input-icon"><Search size={18} /></span>
        </div>
        <Button icon={Plus} onClick={() => setEditar({})}>Nuevo {config.singular}</Button>
      </div>
      {lista.error ? <ErrorState mensaje={lista.error} onRetry={lista.recargar} /> : lista.loading && !lista.data ? <Loader /> : lista.data.content.length === 0 ? (
        <EmptyState titulo="Sin registros" />
      ) : (
        <>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 480 }}>
              <thead><tr><th>ID</th>{config.campos.map(([k, l]) => <th key={k}>{l}</th>)}<th>Acciones</th></tr></thead>
              <tbody>
                {lista.data.content.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    {config.campos.map(([k]) => <td key={k}>{item[k]}</td>)}
                    <td>
                      <div className="row">
                        <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditar(item)} aria-label="Editar" />
                        <Button variant="danger" size="sm" icon={Trash2} onClick={() => setBorrar(item)} aria-label="Eliminar" />
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

      {editar && <FormCatalogo config={config} item={editar} onClose={() => setEditar(null)} onGuardado={() => { setEditar(null); lista.recargar(); }} />}
      <ConfirmModal abierto={!!borrar} onClose={() => setBorrar(null)} onConfirm={eliminar} loading={procesando} peligro
        titulo={`¿Eliminar ${config.singular}?`} mensaje={`"${borrar?.nombre}" se eliminará. Si hay videojuegos que lo usan, no se permitirá.`} textoConfirmar="Eliminar" />
    </>
  );
}

function FormCatalogo({ config, item, onClose, onGuardado }) {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const reglas = Object.fromEntries(config.campos.map(([k]) => [k, [v.requerido('Este campo es obligatorio'), v.max(60)]]));
  const form = useForm(Object.fromEntries(config.campos.map(([k]) => [k, item[k] || ''])), reglas);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.validar()) return;
    setEnviando(true);
    try {
      await config.guardar(item.id, Object.fromEntries(Object.entries(form.valores).map(([k, val]) => [k, val.trim()])));
      toast('Guardado correctamente');
      onGuardado();
    } catch (err) {
      form.setErroresServidor(erroresCampo(err));
      toast(mensajeError(err), 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal abierto onClose={onClose} titulo={item.id ? `Editar ${config.singular}` : `Nuevo ${config.singular}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button loading={enviando} onClick={guardar}>Guardar</Button></>}>
      <form className="stack" onSubmit={guardar} noValidate>
        {config.campos.map(([k, l]) => (
          <Input key={k} label={l} name={k} required value={form.valores[k]} onChange={form.onChange} error={form.errores[k]} maxLength={60} />
        ))}
      </form>
    </Modal>
  );
}
