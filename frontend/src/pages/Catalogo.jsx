import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import GameCard, { GameCardSkeleton } from '../components/GameCard';
import { EmptyState, ErrorState, Pagination } from '../components/ui';
import useAsync from '../hooks/useAsync';
import { catalogosApi, videojuegosApi } from '../api/services';
import { ESTADO_FISICO } from '../utils/format';

const MODALIDADES = [
  ['VENTA', 'Venta'],
  ['PRESTAMO', 'Préstamo'],
  ['AMBAS', 'Ambas'],
];
const ORDENES = [
  ['populares', 'Más populares'],
  ['recientes', 'Más recientes'],
  ['precio_asc', 'Precio: menor a mayor'],
  ['precio_desc', 'Precio: mayor a menor'],
];
const TAM = 8;

/**
 * Los filtros viven en la URL (?q=&plataformaIds=&...) y se envían tal cual a la API.
 * El backend filtra y pagina en MySQL; aquí solo se pinta la página recibida.
 */
export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState(params.get('q') || '');

  const filtros = {
    q: params.get('q') || '',
    plataformaIds: params.getAll('plataformaIds'),
    generoId: params.get('generoId') || '',
    modalidad: params.get('modalidad') || '',
    estadosFisicos: params.getAll('estadosFisicos'),
    orden: params.get('orden') || 'populares',
    page: Number(params.get('page') || 0),
  };
  const clave = params.toString();

  const plataformas = useAsync(() => catalogosApi.plataformas(), []);
  const generos = useAsync(() => catalogosApi.generos(), []);
  const juegos = useAsync(() => videojuegosApi.catalogo({ ...filtros, size: TAM }), [clave]);

  // Búsqueda con debounce: la petición sale 400 ms después de dejar de escribir
  useEffect(() => {
    setTexto(params.get('q') || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('q')]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (texto !== (params.get('q') || '')) actualizar({ q: texto });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  function actualizar(cambios, { mantenerPagina = false } = {}) {
    const p = new URLSearchParams(params);
    Object.entries(cambios).forEach(([k, val]) => {
      p.delete(k);
      if (Array.isArray(val)) val.forEach((x) => p.append(k, x));
      else if (val !== '' && val !== null && val !== undefined) p.set(k, val);
    });
    if (!mantenerPagina) p.delete('page');
    setParams(p);
  }

  const alternar = (campo, valor) => {
    const actual = filtros[campo];
    actualizar({ [campo]: actual.includes(valor) ? actual.filter((x) => x !== valor) : [...actual, valor] });
  };

  const limpiar = () => {
    setTexto('');
    setParams(new URLSearchParams(filtros.orden !== 'populares' ? { orden: filtros.orden } : {}));
  };

  const cambiarPagina = (page) => {
    actualizar({ page }, { mantenerPagina: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activos = filtros.plataformaIds.length + filtros.estadosFisicos.length + (filtros.generoId ? 1 : 0) + (filtros.modalidad ? 1 : 0) + (filtros.q ? 1 : 0);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Explora nuestro catálogo</h1>
          <p>Encuentra tu próxima partida. Todos los juegos son ejemplares físicos.</p>
        </div>
        <button className="btn btn-secondary filters-toggle" onClick={() => setAbierto((a) => !a)}>
          <SlidersHorizontal size={18} /> Filtros {activos > 0 && `(${activos})`}
        </button>
      </div>

      <div className="catalog">
        <aside className={`card filters ${abierto ? 'open' : ''}`} aria-label="Filtros">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 18 }}>Filtros</h3>
            <button className="link-arrow" style={{ fontWeight: 500 }} onClick={limpiar}>Limpiar</button>
          </div>

          <h4>Buscar videojuego</h4>
          <div className="input-wrap">
            <input className="input has-icon" placeholder="Nombre del juego" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Nombre del juego" maxLength={100} />
            <span className="input-icon"><Search size={18} /></span>
          </div>

          <h4>Plataforma</h4>
          {plataformas.loading && <div className="skeleton" style={{ height: 120 }} />}
          {plataformas.error && <span className="field-error">{plataformas.error}</span>}
          {plataformas.data?.map((p) => (
            <label key={p.id} className="checkbox">
              <input type="checkbox" checked={filtros.plataformaIds.includes(String(p.id))} onChange={() => alternar('plataformaIds', String(p.id))} />
              {p.nombre}
            </label>
          ))}

          <h4>Género</h4>
          <select className="select" value={filtros.generoId} onChange={(e) => actualizar({ generoId: e.target.value })} aria-label="Género">
            <option value="">Todos los géneros</option>
            {generos.data?.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
          </select>

          <h4>Modalidad</h4>
          {MODALIDADES.map(([val, label]) => (
            <label key={val} className="checkbox">
              <input type="radio" name="modalidad" checked={filtros.modalidad === val} onChange={() => actualizar({ modalidad: val })} onClick={() => filtros.modalidad === val && actualizar({ modalidad: '' })} />
              {label}
            </label>
          ))}

          <h4>Estado físico</h4>
          {Object.entries(ESTADO_FISICO).map(([val, label]) => (
            <label key={val} className="checkbox">
              <input type="checkbox" checked={filtros.estadosFisicos.includes(val)} onChange={() => alternar('estadosFisicos', val)} />
              {label}
            </label>
          ))}
        </aside>

        <section>
          <div className="toolbar">
            <div className="row wrap">
              <strong style={{ fontSize: 16 }}>{juegos.data ? `${juegos.data.totalElements} videojuegos` : 'Buscando...'}</strong>
              {filtros.q && <span className="chip">“{filtros.q}” <button onClick={() => { setTexto(''); actualizar({ q: '' }); }} aria-label="Quitar búsqueda"><X size={14} /></button></span>}
              {filtros.estadosFisicos.length > 0 && <span className="chip">Estado: {filtros.estadosFisicos.length} seleccionados <button onClick={() => actualizar({ estadosFisicos: [] })} aria-label="Quitar filtro de estado"><X size={14} /></button></span>}
              {filtros.plataformaIds.length > 0 && <span className="chip">Plataformas: {filtros.plataformaIds.length} <button onClick={() => actualizar({ plataformaIds: [] })} aria-label="Quitar filtro de plataforma"><X size={14} /></button></span>}
            </div>
            <label className="row">
              <span className="muted">Ordenar por</span>
              <select className="select" style={{ width: 220, height: 44 }} value={filtros.orden} onChange={(e) => actualizar({ orden: e.target.value })}>
                {ORDENES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          {juegos.error ? (
            <ErrorState mensaje={juegos.error} onRetry={juegos.recargar} />
          ) : juegos.loading ? (
            <div className="grid grid-4">{Array.from({ length: TAM }, (_, i) => <GameCardSkeleton key={i} />)}</div>
          ) : juegos.data.content.length === 0 ? (
            <EmptyState titulo="No encontramos videojuegos" texto="Prueba con otros filtros o limpia la búsqueda.">
              <button className="btn btn-secondary" onClick={limpiar}>Limpiar filtros</button>
            </EmptyState>
          ) : (
            <>
              <div className="grid grid-4">
                {juegos.data.content.map((j) => <GameCard key={j.id} juego={j} />)}
              </div>
              <Pagination page={juegos.data.page} totalPages={juegos.data.totalPages} onChange={cambiarPagina} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
