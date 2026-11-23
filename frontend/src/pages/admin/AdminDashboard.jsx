import { ClipboardList, Gamepad2, MessagesSquare, Users } from 'lucide-react';
import { AsyncView, Badge } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { adminApi } from '../../api/services';
import { ESTADO_SOLICITUD, tonoSolicitud } from '../../utils/format';

export default function AdminDashboard() {
  const stats = useAsync(() => adminApi.estadisticas(), []);
  const s = stats.data;
  const maxPlat = s ? Math.max(1, ...s.videojuegosPorPlataforma.map((p) => p.total)) : 1;
  return (
    <AsyncView loading={stats.loading} error={stats.error} onRetry={stats.recargar} data={s}>
      {s && (
        <div className="stack" style={{ gap: 24 }}>
          <div className="grid grid-4">
            {[
              [Users, s.usuarios, 'Usuarios', `${s.usuariosActivos} activos`],
              [Gamepad2, s.videojuegos, 'Videojuegos', `${s.publicados} publicados`],
              [ClipboardList, s.solicitudes, 'Solicitudes', 'Préstamos y compras'],
              [MessagesSquare, s.publicacionesForo, 'Publicaciones', 'En la comunidad'],
            ].map(([Icono, valor, titulo, sub]) => (
              <div key={titulo} className="card stat-card">
                <span className="stat-icon"><Icono size={22} /></span>
                <div><strong>{valor}</strong><div>{titulo}</div><div className="muted small">{sub}</div></div>
              </div>
            ))}
          </div>
          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Solicitudes por estado</h3>
              <div className="stack" style={{ gap: 10 }}>
                {Object.entries(s.solicitudesPorEstado).map(([estado, total]) => (
                  <div key={estado} className="row" style={{ justifyContent: 'space-between' }}>
                    <Badge tone={tonoSolicitud[estado]}>{ESTADO_SOLICITUD[estado]}</Badge>
                    <strong>{total}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Videojuegos publicados por plataforma</h3>
              <div className="stack" style={{ gap: 12 }}>
                {s.videojuegosPorPlataforma.map((p) => (
                  <div key={p.plataforma}>
                    <div className="row" style={{ justifyContent: 'space-between' }}><span>{p.plataforma}</span><strong>{p.total}</strong></div>
                    <div className="bar mt-8"><span style={{ width: `${(p.total / maxPlat) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
              <p className="muted small mt-16">{s.plataformas} plataformas · {s.generos} géneros registrados</p>
            </div>
          </div>
        </div>
      )}
    </AsyncView>
  );
}
