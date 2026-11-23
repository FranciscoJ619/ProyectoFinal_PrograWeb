package com.replayclub.api.service;

import com.replayclub.api.domain.*;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.DtoMapper;
import com.replayclub.api.dto.SolicitudDtos.*;
import com.replayclub.api.exception.AccesoDenegadoException;
import com.replayclub.api.exception.RecursoNoEncontradoException;
import com.replayclub.api.exception.ReglaNegocioException;
import com.replayclub.api.repository.SolicitudRepository;
import com.replayclub.api.repository.UsuarioRepository;
import com.replayclub.api.repository.VideojuegoRepository;
import com.replayclub.api.security.UsuarioPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

/**
 * Flujo de una solicitud:
 * PRÉSTAMO: PENDIENTE -> APROBADO -> EN_CURSO (entregado) -> FINALIZADO (devuelto)
 * COMPRA:   PENDIENTE -> APROBADO -> FINALIZADO (entregado y pagado en persona)
 * En cualquier momento previo a la entrega: RECHAZADO (propietario) o CANCELADO (solicitante).
 */
@Service
public class SolicitudService {

    private static final EnumSet<EstadoSolicitud> ACTIVAS =
            EnumSet.of(EstadoSolicitud.PENDIENTE, EstadoSolicitud.APROBADO, EstadoSolicitud.EN_CURSO);

    private final SolicitudRepository solicitudRepository;
    private final VideojuegoRepository videojuegoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificaciones;

    public SolicitudService(SolicitudRepository solicitudRepository, VideojuegoRepository videojuegoRepository,
                            UsuarioRepository usuarioRepository, NotificacionService notificaciones) {
        this.solicitudRepository = solicitudRepository;
        this.videojuegoRepository = videojuegoRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificaciones = notificaciones;
    }

    // ------------------------------------------------------------------ consultas

    @Transactional(readOnly = true)
    public PageResponse<SolicitudDto> mias(Long usuarioId, String rol, EstadoSolicitud estado, TipoSolicitud tipo,
                                           Pageable pageable) {
        String r = rol == null ? "TODOS" : rol.toUpperCase();
        if (!List.of("TODOS", "SOLICITANTE", "PROPIETARIO").contains(r)) {
            throw ReglaNegocioException.campo("rol", "El rol debe ser TODOS, SOLICITANTE o PROPIETARIO");
        }
        return PageResponse.of(solicitudRepository.buscarDeUsuario(usuarioId, r, estado, tipo, pageable),
                DtoMapper::solicitud);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudDto> todas(String q, EstadoSolicitud estado, TipoSolicitud tipo, Pageable pageable) {
        String filtro = q == null || q.isBlank() ? null : q.trim();
        return PageResponse.of(solicitudRepository.buscarTodas(filtro, estado, tipo, pageable), DtoMapper::solicitud);
    }

    @Transactional(readOnly = true)
    public SolicitudDto detalle(Long id, UsuarioPrincipal yo) {
        Solicitud s = buscar(id);
        if (!yo.esAdmin() && !participa(s, yo.getId())) {
            throw new AccesoDenegadoException("No participas en esta solicitud");
        }
        return DtoMapper.solicitud(s);
    }

    @Transactional(readOnly = true)
    public ResumenSolicitudesDto resumen(Long usuarioId) {
        Map<EstadoSolicitud, Long> enviadas = conteo(solicitudRepository.contarComoSolicitante(usuarioId));
        Map<EstadoSolicitud, Long> recibidas = conteo(solicitudRepository.contarComoPropietario(usuarioId));
        long totalEnviadas = enviadas.values().stream().mapToLong(Long::longValue).sum();
        long totalRecibidas = recibidas.values().stream().mapToLong(Long::longValue).sum();
        return new ResumenSolicitudesDto(
                enviadas.getOrDefault(EstadoSolicitud.PENDIENTE, 0L),
                recibidas.getOrDefault(EstadoSolicitud.PENDIENTE, 0L),
                enviadas.getOrDefault(EstadoSolicitud.APROBADO, 0L) + recibidas.getOrDefault(EstadoSolicitud.APROBADO, 0L),
                enviadas.getOrDefault(EstadoSolicitud.EN_CURSO, 0L) + recibidas.getOrDefault(EstadoSolicitud.EN_CURSO, 0L),
                enviadas.getOrDefault(EstadoSolicitud.FINALIZADO, 0L) + recibidas.getOrDefault(EstadoSolicitud.FINALIZADO, 0L),
                totalRecibidas, totalEnviadas, totalRecibidas);
    }

    /** Transacciones finalizadas que el usuario todavía no ha valorado. */
    @Transactional(readOnly = true)
    public List<TransaccionOpinableDto> opinables(Long usuarioId) {
        return solicitudRepository.finalizadasSinOpinion(usuarioId).stream().map(s -> {
            Usuario contraparte = s.getSolicitante().getId().equals(usuarioId) ? s.getPropietario() : s.getSolicitante();
            return new TransaccionOpinableDto(s.getId(), s.getFolio(), s.getTipo(), s.getVideojuego().getTitulo(),
                    DtoMapper.resumen(contraparte));
        }).toList();
    }

    // ------------------------------------------------------------------ acciones

    @Transactional
    public SolicitudDto crear(SolicitudRequest req, UsuarioPrincipal yo) {
        Videojuego v = videojuegoRepository.findWithDetalleById(req.videojuegoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Videojuego", req.videojuegoId()));
        if (v.getPropietario().getId().equals(yo.getId())) {
            throw new ReglaNegocioException("No puedes solicitar tu propio videojuego");
        }
        if (v.getEstadoPublicacion() != EstadoPublicacion.PUBLICADO) {
            throw new ReglaNegocioException("Este videojuego no está disponible en este momento");
        }
        if (req.tipo() == TipoSolicitud.PRESTAMO && !v.getModalidad().permitePrestamo()) {
            throw new ReglaNegocioException("Este videojuego no está disponible para préstamo");
        }
        if (req.tipo() == TipoSolicitud.COMPRA && !v.getModalidad().permiteVenta()) {
            throw new ReglaNegocioException("Este videojuego no está a la venta");
        }
        if (solicitudRepository.existsByVideojuegoIdAndSolicitanteIdAndEstadoIn(v.getId(), yo.getId(), ACTIVAS)) {
            throw new ReglaNegocioException("Ya tienes una solicitud activa para este videojuego");
        }

        Solicitud s = new Solicitud();
        s.setVideojuego(v);
        s.setSolicitante(usuarioRepository.findById(yo.getId()).orElseThrow());
        s.setTipo(req.tipo());
        s.setEstado(EstadoSolicitud.PENDIENTE);
        s.setMensaje(req.mensaje());
        if (req.tipo() == TipoSolicitud.PRESTAMO) {
            long dias = ChronoUnit.DAYS.between(req.fechaInicio(), req.fechaDevolucion());
            if (dias > v.getDiasMaxPrestamo()) {
                throw ReglaNegocioException.campo("fechaDevolucion",
                        "El préstamo máximo para este juego es de " + v.getDiasMaxPrestamo() + " días");
            }
            if (v.getDisponibleDesde() != null && req.fechaInicio().isBefore(v.getDisponibleDesde())) {
                throw ReglaNegocioException.campo("fechaInicio",
                        "El juego está disponible a partir del " + v.getDisponibleDesde());
            }
            s.setFechaInicio(req.fechaInicio());
            s.setFechaDevolucion(req.fechaDevolucion());
        }
        solicitudRepository.save(s);
        s.setFolio((s.getTipo() == TipoSolicitud.PRESTAMO ? "P-" : "V-") + (1000 + s.getId()));
        notificaciones.solicitudCreada(s);
        return DtoMapper.solicitud(s);
    }

    @Transactional
    public SolicitudDto aprobar(Long id, RespuestaRequest req, UsuarioPrincipal yo) {
        Solicitud s = buscar(id);
        soloPropietario(s, yo);
        exigirEstado(s, EstadoSolicitud.PENDIENTE);
        if (s.getVideojuego().getEstadoPublicacion() != EstadoPublicacion.PUBLICADO) {
            throw new ReglaNegocioException("El videojuego ya no está disponible (está prestado, vendido u oculto)");
        }
        s.setEstado(EstadoSolicitud.APROBADO);
        s.setRespuesta(respuesta(req));
        notificaciones.solicitudAprobada(s);
        return DtoMapper.solicitud(s);
    }

    @Transactional
    public SolicitudDto rechazar(Long id, RespuestaRequest req, UsuarioPrincipal yo) {
        Solicitud s = buscar(id);
        soloPropietario(s, yo);
        exigirEstado(s, EstadoSolicitud.PENDIENTE);
        s.setEstado(EstadoSolicitud.RECHAZADO);
        s.setRespuesta(respuesta(req));
        notificaciones.solicitudRechazada(s);
        return DtoMapper.solicitud(s);
    }

    @Transactional
    public SolicitudDto cancelar(Long id, UsuarioPrincipal yo) {
        Solicitud s = buscar(id);
        if (!s.getSolicitante().getId().equals(yo.getId())) {
            throw new AccesoDenegadoException("Solo quien hizo la solicitud puede cancelarla");
        }
        if (s.getEstado() != EstadoSolicitud.PENDIENTE && s.getEstado() != EstadoSolicitud.APROBADO) {
            throw new ReglaNegocioException("Solo puedes cancelar solicitudes pendientes o aprobadas");
        }
        s.setEstado(EstadoSolicitud.CANCELADO);
        notificaciones.solicitudCancelada(s);
        return DtoMapper.solicitud(s);
    }

    /** El propietario entrega el juego: préstamo -> EN_CURSO; compra -> FINALIZADO. */
    @Transactional
    public SolicitudDto entregar(Long id, UsuarioPrincipal yo) {
        Solicitud s = buscar(id);
        soloPropietario(s, yo);
        exigirEstado(s, EstadoSolicitud.APROBADO);
        Videojuego v = s.getVideojuego();
        if (v.getEstadoPublicacion() != EstadoPublicacion.PUBLICADO) {
            throw new ReglaNegocioException("El videojuego no está disponible para entregarse");
        }
        if (s.getTipo() == TipoSolicitud.PRESTAMO) {
            s.setEstado(EstadoSolicitud.EN_CURSO);
            v.setEstadoPublicacion(EstadoPublicacion.PRESTADO);
            notificaciones.prestamoEntregado(s);
        } else {
            s.setEstado(EstadoSolicitud.FINALIZADO);
            v.setEstadoPublicacion(EstadoPublicacion.VENDIDO);
            completar(s);
        }
        return DtoMapper.solicitud(s);
    }

    /** El propietario confirma que recibió el juego de vuelta. */
    @Transactional
    public SolicitudDto confirmarDevolucion(Long id, UsuarioPrincipal yo) {
        Solicitud s = buscar(id);
        soloPropietario(s, yo);
        exigirEstado(s, EstadoSolicitud.EN_CURSO);
        s.setEstado(EstadoSolicitud.FINALIZADO);
        s.getVideojuego().setEstadoPublicacion(EstadoPublicacion.PUBLICADO);
        completar(s);
        return DtoMapper.solicitud(s);
    }

    @Transactional
    public void eliminar(Long id) {
        Solicitud s = buscar(id);
        if (s.getEstado() == EstadoSolicitud.EN_CURSO) {
            throw new ReglaNegocioException("No se puede eliminar un préstamo en curso");
        }
        solicitudRepository.delete(s);
    }

    // ------------------------------------------------------------------ apoyo

    private Solicitud buscar(Long id) {
        return solicitudRepository.findWithDetalleById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud", id));
    }

    private void completar(Solicitud s) {
        Usuario a = s.getSolicitante();
        Usuario b = s.getPropietario();
        a.setTransaccionesCompletadas(a.getTransaccionesCompletadas() + 1);
        b.setTransaccionesCompletadas(b.getTransaccionesCompletadas() + 1);
        notificaciones.transaccionFinalizada(s);
    }

    private boolean participa(Solicitud s, Long usuarioId) {
        return s.getSolicitante().getId().equals(usuarioId) || s.getPropietario().getId().equals(usuarioId);
    }

    private void soloPropietario(Solicitud s, UsuarioPrincipal yo) {
        if (!s.getPropietario().getId().equals(yo.getId())) {
            throw new AccesoDenegadoException("Solo el propietario del videojuego puede realizar esta acción");
        }
    }

    private void exigirEstado(Solicitud s, EstadoSolicitud esperado) {
        if (s.getEstado() != esperado) {
            throw new ReglaNegocioException("La solicitud está en estado " + s.getEstado()
                    + " y no admite esta acción");
        }
    }

    private String respuesta(RespuestaRequest req) {
        return req == null || req.respuesta() == null || req.respuesta().isBlank() ? null : req.respuesta().trim();
    }

    private Map<EstadoSolicitud, Long> conteo(List<Object[]> filas) {
        Map<EstadoSolicitud, Long> m = new EnumMap<>(EstadoSolicitud.class);
        for (Object[] f : filas) m.put((EstadoSolicitud) f[0], (Long) f[1]);
        return m;
    }
}
