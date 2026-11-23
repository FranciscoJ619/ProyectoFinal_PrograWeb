package com.replayclub.api.repository;

import com.replayclub.api.domain.EstadoSolicitud;
import com.replayclub.api.domain.Solicitud;
import com.replayclub.api.domain.TipoSolicitud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    @EntityGraph(attributePaths = {"videojuego", "videojuego.propietario", "videojuego.plataforma", "solicitante"})
    Optional<Solicitud> findWithDetalleById(Long id);

    /**
     * Solicitudes donde el usuario participa.
     * rol: TODOS | SOLICITANTE | PROPIETARIO
     */
    @EntityGraph(attributePaths = {"videojuego", "videojuego.propietario", "videojuego.plataforma", "solicitante"})
    @Query(value = """
            SELECT s FROM Solicitud s
            WHERE ((:rol = 'SOLICITANTE' AND s.solicitante.id = :uid)
                OR (:rol = 'PROPIETARIO' AND s.videojuego.propietario.id = :uid)
                OR (:rol = 'TODOS' AND (s.solicitante.id = :uid OR s.videojuego.propietario.id = :uid)))
              AND (:estado IS NULL OR s.estado = :estado)
              AND (:tipo IS NULL OR s.tipo = :tipo)
            """,
            countQuery = """
            SELECT COUNT(s) FROM Solicitud s
            WHERE ((:rol = 'SOLICITANTE' AND s.solicitante.id = :uid)
                OR (:rol = 'PROPIETARIO' AND s.videojuego.propietario.id = :uid)
                OR (:rol = 'TODOS' AND (s.solicitante.id = :uid OR s.videojuego.propietario.id = :uid)))
              AND (:estado IS NULL OR s.estado = :estado)
              AND (:tipo IS NULL OR s.tipo = :tipo)
            """)
    Page<Solicitud> buscarDeUsuario(@Param("uid") Long usuarioId,
                                    @Param("rol") String rol,
                                    @Param("estado") EstadoSolicitud estado,
                                    @Param("tipo") TipoSolicitud tipo,
                                    Pageable pageable);

    /** Listado general para el administrador. */
    @EntityGraph(attributePaths = {"videojuego", "videojuego.propietario", "videojuego.plataforma", "solicitante"})
    @Query(value = """
            SELECT s FROM Solicitud s
            WHERE (:q IS NULL OR LOWER(s.videojuego.titulo) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(s.solicitante.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(s.folio) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:estado IS NULL OR s.estado = :estado)
              AND (:tipo IS NULL OR s.tipo = :tipo)
            """,
            countQuery = """
            SELECT COUNT(s) FROM Solicitud s
            WHERE (:q IS NULL OR LOWER(s.videojuego.titulo) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(s.solicitante.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(s.folio) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:estado IS NULL OR s.estado = :estado)
              AND (:tipo IS NULL OR s.tipo = :tipo)
            """)
    Page<Solicitud> buscarTodas(@Param("q") String q,
                                @Param("estado") EstadoSolicitud estado,
                                @Param("tipo") TipoSolicitud tipo,
                                Pageable pageable);

    @Query("SELECT s.estado, COUNT(s) FROM Solicitud s WHERE s.solicitante.id = :uid GROUP BY s.estado")
    List<Object[]> contarComoSolicitante(@Param("uid") Long usuarioId);

    @Query("SELECT s.estado, COUNT(s) FROM Solicitud s WHERE s.videojuego.propietario.id = :uid GROUP BY s.estado")
    List<Object[]> contarComoPropietario(@Param("uid") Long usuarioId);

    @Query("SELECT s.estado, COUNT(s) FROM Solicitud s GROUP BY s.estado")
    List<Object[]> contarPorEstado();

    boolean existsByVideojuegoIdAndSolicitanteIdAndEstadoIn(Long videojuegoId, Long solicitanteId, Collection<EstadoSolicitud> estados);

    boolean existsByVideojuegoIdAndEstadoIn(Long videojuegoId, Collection<EstadoSolicitud> estados);

    boolean existsByVideojuegoId(Long videojuegoId);

    boolean existsBySolicitanteId(Long solicitanteId);

    /** Transacciones finalizadas entre dos usuarios que todavía no se han calificado (para opinar). */
    @EntityGraph(attributePaths = {"videojuego", "videojuego.propietario", "solicitante"})
    @Query("""
            SELECT s FROM Solicitud s
            WHERE s.estado = com.replayclub.api.domain.EstadoSolicitud.FINALIZADO
              AND (s.solicitante.id = :uid OR s.videojuego.propietario.id = :uid)
              AND NOT EXISTS (SELECT p FROM PublicacionForo p WHERE p.solicitud = s AND p.autor.id = :uid)
            ORDER BY s.fechaActualizacion DESC
            """)
    List<Solicitud> finalizadasSinOpinion(@Param("uid") Long usuarioId);
}
