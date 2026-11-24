import { Disc3 } from 'lucide-react';
import Logo from '../../components/Logo';
import { GameCover } from '../../components/ui';

const ESTANTE = [
  ['Zelda: Tears of the Kingdom', 'Nintendo Switch'],
  ['Halo Infinite', 'Xbox Series X'],
  ['God of War Ragnarök', 'PlayStation 5'],
  ['Super Mario 64', 'Nintendo 64'],
];

/** Pantalla de dos columnas: lado izquierdo azul nocturno + tarjeta blanca a la derecha. */
export default function AuthShell({ children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo to="/login" />
        <h2>Tus juegos merecen una segunda partida</h2>
        <div className="auth-hero">
          <div className="shelf">
            {ESTANTE.map(([t, p]) => (
              <GameCover key={t} titulo={t} plataforma={p} />
            ))}
          </div>
          <span className="tag">
            <Disc3 size={18} color="#F5C542" /> Historias reales. Juegos físicos.
          </span>
        </div>
      </aside>
      <main className="auth-main">
        <div className="card auth-card">{children}</div>
      </main>
    </div>
  );
}
