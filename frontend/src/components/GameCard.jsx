import { Link } from 'react-router-dom';
import { Avatar, GameCover, Rating } from './ui';
import { ESTADO_FISICO, precio } from '../utils/format';

/** Tarjeta de videojuego del catálogo (componente "Catálogo / Tarjeta videojuego" del Figma). */
export default function GameCard({ juego, mostrarPropietario = true, mostrarEstado = true }) {
  const prestamo = juego.modalidad === 'PRESTAMO' || juego.modalidad === 'AMBAS';
  const venta = juego.modalidad === 'VENTA' || juego.modalidad === 'AMBAS';
  const prestado = juego.estadoPublicacion === 'PRESTADO';
  return (
    <article className="card game-card">
      <GameCover titulo={juego.titulo} plataforma={juego.plataforma} src={juego.portadaUrl} />
      <div className="meta">
        {juego.plataforma}
        {mostrarEstado && ` · ${ESTADO_FISICO[juego.estadoFisico]}`}
      </div>
      <h3>{juego.titulo}</h3>
      <div className="price-row">
        <span className="price">{venta ? precio(juego.precioVenta) : 'Solo préstamo'}</span>
        <Rating value={juego.calificacionPromedio} />
      </div>
      {prestado ? (
        <span className="text-danger">No disponible · Prestado</span>
      ) : prestamo ? (
        <span className="text-success">Disponible para préstamo{juego.diasMaxPrestamo ? ` · ${juego.diasMaxPrestamo} días` : ''}</span>
      ) : (
        <span className="muted">Disponible para venta</span>
      )}
      {mostrarPropietario && juego.propietario && (
        <div className="owner">
          <Avatar usuario={juego.propietario} size={28} />
          {juego.propietario.nombre}
        </div>
      )}
      <Link to={`/videojuegos/${juego.id}`} className="btn btn-secondary btn-block" style={{ marginTop: mostrarPropietario ? 0 : 10 }}>
        Ver detalles
      </Link>
    </article>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="card game-card">
      <div className="skeleton" style={{ aspectRatio: '16/9' }} />
      <div className="skeleton" style={{ height: 14, width: '60%', marginTop: 12 }} />
      <div className="skeleton" style={{ height: 18, width: '85%' }} />
      <div className="skeleton" style={{ height: 22, width: '40%' }} />
      <div className="skeleton" style={{ height: 44, marginTop: 8 }} />
    </div>
  );
}
