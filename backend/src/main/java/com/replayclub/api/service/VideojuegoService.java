package com.replayclub.api.service;

import com.replayclub.api.domain.*;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.DtoMapper;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoCardDto;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoDetalleDto;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoRequest;
import com.replayclub.api.exception.AccesoDenegadoException;
import com.replayclub.api.exception.RecursoNoEncontradoException;
import com.replayclub.api.exception.ReglaNegocioException;
import com.replayclub.api.repository.*;
import com.replayclub.api.security.UsuarioPrincipal;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;

@Service
public class VideojuegoService {

    private static final EnumSet<EstadoSolicitud> ACTIVAS =
            EnumSet.of(EstadoSolicitud.PENDIENTE, EstadoSolicitud.APROBADO, EstadoSolicitud.EN_CURSO);

    private final VideojuegoRepository videojuegoRepository;
    private final PlataformaRepository plataformaRepository;
    private final GeneroRepository generoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SolicitudRepository solicitudRepository;

    public VideojuegoService(VideojuegoRepository videojuegoRepository, PlataformaRepository plataformaRepository,
                             GeneroRepository generoRepository, UsuarioRepository usuarioRepository,
                             SolicitudRepository solicitudRepository) {
        this.videojuegoRepository = videojuegoRepository;
        this.plataformaRepository = plataformaRepository;
        this.generoRepository = generoRepository;
        this.usuarioRepository = usuarioRepository;
        this.solicitudRepository = solicitudRepository;
    }

    // ------------------------------------------------------------------ consultas

    /** Catálogo con filtros y paginación del lado del servidor. */
    @Transactional(readOnly = true)
    public PageResponse<VideojuegoCardDto> buscar(VideojuegoFiltro filtro, int page, int size, String orden) {
        Pageable pageable = PageRequest.of(page, size, ordenamiento(orden));
        return PageResponse.of(videojuegoRepository.findAll(especificacion(filtro), pageable), DtoMapper::card);
    }

    @Transactional(readOnly = true)
    public VideojuegoDetalleDto detalle(Long id, UsuarioPrincipal yo) {
        Videojuego v = videojuegoRepository.findWithDetalleById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Videojuego", id));
        boolean visible = v.getEstadoPublicacion() != EstadoPublicacion.BORRADOR
                && v.getEstadoPublicacion() != EstadoPublicacion.INACTIVO;
        if (!visible && !yo.esModeradorOAdmin() && !v.getPropietario().getId().equals(yo.getId())) {
            throw new RecursoNoEncontradoException("Videojuego", id);
        }
        return DtoMapper.detalle(v);
    }

    // ------------------------------------------------------------------ escritura

    @Transactional
    public VideojuegoDetalleDto crear(VideojuegoRequest req, UsuarioPrincipal yo) {
        Videojuego v = new Videojuego();
        v.setPropietario(usuarioRepository.findById(yo.getId()).orElseThrow());
        aplicar(v, req);
        v.setEstadoPublicacion(Boolean.TRUE.equals(req.borrador()) ? EstadoPublicacion.BORRADOR : EstadoPublicacion.PUBLICADO);
        return DtoMapper.detalle(videojuegoRepository.save(v));
    }

    @Transactional
    public VideojuegoDetalleDto actualizar(Long id, VideojuegoRequest req, UsuarioPrincipal yo) {
        Videojuego v = buscar(id);
        soloPropietarioOAdmin(v, yo);
        if (v.getEstadoPublicacion() == EstadoPublicacion.VENDIDO) {
            throw new ReglaNegocioException("Este videojuego ya fue vendido y no se puede editar");
        }
        aplicar(v, req);
        boolean borrador = Boolean.TRUE.equals(req.borrador());
        if (borrador && v.getEstadoPublicacion() == EstadoPublicacion.PUBLICADO) {
            if (solicitudRepository.existsByVideojuegoIdAndEstadoIn(id, ACTIVAS)) {
                throw new ReglaNegocioException("No puedes pasarlo a borrador: tiene solicitudes activas");
            }
            v.setEstadoPublicacion(EstadoPublicacion.BORRADOR);
        } else if (!borrador && v.getEstadoPublicacion() == EstadoPublicacion.BORRADOR) {
            v.setEstadoPublicacion(EstadoPublicacion.PUBLICADO);
        }
        return DtoMapper.detalle(v);
    }

    @Transactional
    public void eliminar(Long id, UsuarioPrincipal yo) {
        Videojuego v = buscar(id);
        soloPropietarioOAdmin(v, yo);
        if (solicitudRepository.existsByVideojuegoId(id)) {
            throw new ReglaNegocioException("Este videojuego tiene historial de solicitudes. "
                    + "Puedes pasarlo a borrador o desactivarlo en lugar de eliminarlo");
        }
        videojuegoRepository.delete(v);
    }

    /** Moderación: un moderador o admin puede ocultar (INACTIVO) o reactivar (PUBLICADO) una publicación. */
    @Transactional
    public VideojuegoCardDto moderar(Long id, EstadoPublicacion estado) {
        if (estado != EstadoPublicacion.INACTIVO && estado != EstadoPublicacion.PUBLICADO) {
            throw ReglaNegocioException.campo("estado", "Solo se puede cambiar a PUBLICADO o INACTIVO");
        }
        Videojuego v = buscar(id);
        if (v.getEstadoPublicacion() == EstadoPublicacion.PRESTADO || v.getEstadoPublicacion() == EstadoPublicacion.VENDIDO) {
            throw new ReglaNegocioException("No se puede moderar un videojuego prestado o vendido");
        }
        if (estado == EstadoPublicacion.INACTIVO && solicitudRepository.existsByVideojuegoIdAndEstadoIn(id, ACTIVAS)) {
            throw new ReglaNegocioException("Tiene solicitudes activas; espera a que se resuelvan para ocultarlo");
        }
        v.setEstadoPublicacion(estado);
        return DtoMapper.card(v);
    }

    // ------------------------------------------------------------------ apoyo

    Videojuego buscar(Long id) {
        return videojuegoRepository.findWithDetalleById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Videojuego", id));
    }

    private void soloPropietarioOAdmin(Videojuego v, UsuarioPrincipal yo) {
        if (!yo.esAdmin() && !v.getPropietario().getId().equals(yo.getId())) {
            throw new AccesoDenegadoException("Solo el propietario puede modificar esta publicación");
        }
    }

    private void aplicar(Videojuego v, VideojuegoRequest req) {
        Plataforma plataforma = plataformaRepository.findById(req.plataformaId())
                .orElseThrow(() -> ReglaNegocioException.campo("plataformaId", "La plataforma no existe"));
        List<Genero> generos = generoRepository.findAllById(new HashSet<>(req.generoIds()));
        if (generos.size() != new HashSet<>(req.generoIds()).size()) {
            throw ReglaNegocioException.campo("generoIds", "Alguno de los géneros no existe");
        }
        v.setTitulo(req.titulo().trim());
        v.setDescripcion(req.descripcion().trim());
        v.setAnioLanzamiento(req.anioLanzamiento());
        v.setPlataforma(plataforma);
        v.getGeneros().clear();
        v.getGeneros().addAll(generos);
        v.setEstadoFisico(req.estadoFisico());
        v.setModalidad(req.modalidad());
        v.setUbicacion(req.ubicacion().trim());
        // Solo se guardan los datos que corresponden a la modalidad
        v.setPrecioVenta(req.modalidad().permiteVenta() ? req.precioVenta() : null);
        v.setDiasMaxPrestamo(req.modalidad().permitePrestamo() ? req.diasMaxPrestamo() : null);
        v.setCondicionesPrestamo(req.modalidad().permitePrestamo() ? req.condicionesPrestamo().trim() : null);
        v.setDisponibleDesde(req.modalidad().permitePrestamo() ? req.disponibleDesde() : null);
        v.reemplazarImagenes(req.imagenes());
    }

    private Sort ordenamiento(String orden) {
        if (orden == null) orden = "recientes";
        return switch (orden) {
            case "precio_asc" -> Sort.by(Sort.Order.asc("precioVenta"), Sort.Order.desc("id"));
            case "precio_desc" -> Sort.by(Sort.Order.desc("precioVenta"), Sort.Order.desc("id"));
            case "populares" -> Sort.by(Sort.Order.desc("calificacionPromedio"), Sort.Order.desc("totalResenas"),
                    Sort.Order.desc("id"));
            case "titulo" -> Sort.by(Sort.Order.asc("titulo"));
            default -> Sort.by(Sort.Order.desc("fechaPublicacion"), Sort.Order.desc("id"));
        };
    }

    /** Construye el WHERE dinámico: el filtrado se hace en MySQL, nunca en el cliente. */
    private Specification<Videojuego> especificacion(VideojuegoFiltro f) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (f.estados() != null && !f.estados().isEmpty()) {
                ps.add(root.get("estadoPublicacion").in(f.estados()));
            }
            if (f.q() != null && !f.q().isBlank()) {
                ps.add(cb.like(cb.lower(root.get("titulo")), "%" + f.q().trim().toLowerCase() + "%"));
            }
            if (f.plataformaIds() != null && !f.plataformaIds().isEmpty()) {
                ps.add(root.get("plataforma").get("id").in(f.plataformaIds()));
            }
            if (f.estadosFisicos() != null && !f.estadosFisicos().isEmpty()) {
                ps.add(root.get("estadoFisico").in(f.estadosFisicos()));
            }
            if (f.propietarioId() != null) {
                ps.add(cb.equal(root.get("propietario").get("id"), f.propietarioId()));
            }
            if (f.modalidad() != null) {
                switch (f.modalidad()) {
                    case VENTA -> ps.add(root.get("modalidad").in(Modalidad.VENTA, Modalidad.AMBAS));
                    case PRESTAMO -> ps.add(root.get("modalidad").in(Modalidad.PRESTAMO, Modalidad.AMBAS));
                    case AMBAS -> ps.add(cb.equal(root.get("modalidad"), Modalidad.AMBAS));
                }
            }
            if (f.generoId() != null) {
                // EXISTS sobre la tabla N:M para no duplicar filas en la paginación
                Subquery<Long> sub = query.subquery(Long.class);
                Root<Videojuego> v2 = sub.from(Videojuego.class);
                sub.select(v2.get("id")).where(cb.equal(v2.get("id"), root.get("id")),
                        cb.equal(v2.join("generos").get("id"), f.generoId()));
                ps.add(cb.exists(sub));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
