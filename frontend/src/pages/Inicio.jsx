import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Gamepad2, MessagesSquare, Sparkles, Users } from 'lucide-react';
import GameCard, { GameCardSkeleton } from '../components/GameCard';
import { ErrorState, GameCover } from '../components/ui';
import useAsync from '../hooks/useAsync';
import { generalApi, videojuegosApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { hace, precio } from '../utils/format';

const VITRINA = [
  ['Zelda: Tears of the Kingdom', 'Nintendo Switch'],
  ['Super Mario Bros. Wonder', 'Nintendo Switch'],
  ['God of War Ragnarök', 'PlayStation 5'],
];

export default function Inicio() {
  const { puedeOperar, usuario } = useAuth();
  const stats = useAsync(() => generalApi.estadisticas(), []);
  const destacados = useAsync(() => videojuegosApi.catalogo({ orden: 'populares', size: 4 }), []);
  const recientes = useAsync(() => videojuegosApi.catalogo({ orden: 'recientes', size: 3 }), []);

  const tarjetas = [
    { icon: Gamepad2, valor: stats.data?.videojuegosDisponibles, texto: 'Videojuegos disponibles' },
    { icon: Sparkles, valor: stats.data?.publicacionesRecientes, texto: 'Publicaciones esta semana' },
    { icon: Users, valor: stats.data?.jugadores, texto: 'Comunidad de jugadores' },
  ];

  return (
    <div className="container page">
      <section className="hero">
        <div className="hero-text">
          <span className="kicker">RENTA · PRESTA · VENDE · CONECTA</span>
          <h1>Dale una segunda vida a tus videojuegos</h1>
          <p>Hola, {usuario.nombre.split(' ')[0]}. Renta, comparte y descubre videojuegos físicos con otros jugadores.</p>
          <div className="row wrap mt-8" style={{ gap: 16 }}>
            <Link to="/catalogo" className="btn btn-primary"><ArrowRight size={18} /> Explorar catálogo</Link>
            {puedeOperar && <Link to="/publicar" className="btn btn-secondary">Publicar videojuego</Link>}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          {VITRINA.map(([t, p]) => <GameCover key={t} titulo={t} plataforma={p} />)}
        </div>
      </section>

      <section className="grid grid-3 mt-24">
        {tarjetas.map(({ icon: Icono, valor, texto }) => (
          <div key={texto} className="card stat-card">
            <span className="stat-icon"><Icono size={22} /></span>
            {stats.loading ? <div className="skeleton" style={{ width: 60, height: 28 }} /> : <strong>{valor ?? '—'}</strong>}
            <span>{texto}</span>
          </div>
        ))}
      </section>

      <div className="section-head">
        <h2>Destacados de la semana</h2>
        <Link to="/catalogo?orden=populares" className="link-arrow">Ver todo el catálogo <ArrowRight size={16} /></Link>
      </div>
      {destacados.error ? (
        <ErrorState mensaje={destacados.error} onRetry={destacados.recargar} />
      ) : (
        <div className="grid grid-4">
          {destacados.loading
            ? Array.from({ length: 4 }, (_, i) => <GameCardSkeleton key={i} />)
            : destacados.data.content.map((j) => <GameCard key={j.id} juego={j} mostrarPropietario={false} mostrarEstado={false} />)}
        </div>
      )}

      <div className="section-head">
        <h2>Recién agregados</h2>
        <Link to="/catalogo?orden=recientes" className="link-arrow">Descubrir novedades <ArrowRight size={16} /></Link>
      </div>
      {recientes.error ? (
        <ErrorState mensaje={recientes.error} onRetry={recientes.recargar} />
      ) : (
        <div className="grid grid-3">
          {recientes.loading
            ? Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)
            : recientes.data.content.map((j) => (
                <Link key={j.id} to={`/videojuegos/${j.id}`} className="card mini-card">
                  <GameCover titulo={j.titulo} plataforma={j.plataforma} src={j.portadaUrl} />
                  <div className="grow">
                    <h3>{j.titulo}</h3>
                    <p className="muted">{j.plataforma} · {hace(j.fechaPublicacion)}</p>
                    <strong style={{ color: 'var(--retro)' }}>{j.precioVenta ? precio(j.precioVenta) : 'Solo préstamo'}</strong>
                  </div>
                  <ArrowUpRight size={18} className="muted" />
                </Link>
              ))}
        </div>
      )}

      <div className="banner">
        <span className="row"><MessagesSquare size={22} color="#F5C542" /> Las mejores recomendaciones vienen de otros jugadores.</span>
        <Link to="/comunidad">Únete a la conversación →</Link>
      </div>
    </div>
  );
}
