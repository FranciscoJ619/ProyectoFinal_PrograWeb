package com.replayclub.api.repository;

import com.replayclub.api.domain.CategoriaForo;
import com.replayclub.api.domain.PublicacionForo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PublicacionForoRepository extends JpaRepository<PublicacionForo, Long> {

    @EntityGraph(attributePaths = {"autor", "videojuego", "videojuego.plataforma", "usuarioValorado", "solicitud"})
    @Query(value = """
            SELECT p FROM PublicacionForo p
            WHERE (:categoria IS NULL OR p.categoria = :categoria)
              AND (:q IS NULL OR LOWER(p.titulo) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(p.contenido) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:videojuegoId IS NULL OR p.videojuego.id = :videojuegoId)
              AND (:valoradoId IS NULL OR p.usuarioValorado.id = :valoradoId)
              AND (:autorId IS NULL OR p.autor.id = :autorId)
            """,
            countQuery = """
            SELECT COUNT(p) FROM PublicacionForo p
            WHERE (:categoria IS NULL OR p.categoria = :categoria)
              AND (:q IS NULL OR LOWER(p.titulo) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(p.contenido) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:videojuegoId IS NULL OR p.videojuego.id = :videojuegoId)
              AND (:valoradoId IS NULL OR p.usuarioValorado.id = :valoradoId)
              AND (:autorId IS NULL OR p.autor.id = :autorId)
            """)
    Page<PublicacionForo> buscar(@Param("categoria") CategoriaForo categoria,
                                 @Param("q") String q,
                                 @Param("videojuegoId") Long videojuegoId,
                                 @Param("valoradoId") Long valoradoId,
                                 @Param("autorId") Long autorId,
                                 Pageable pageable);

    @EntityGraph(attributePaths = {"autor", "videojuego", "videojuego.plataforma", "usuarioValorado", "solicitud"})
    Optional<PublicacionForo> findWithDetalleById(Long id);

    @Query("SELECT AVG(p.calificacion), COUNT(p) FROM PublicacionForo p WHERE p.videojuego.id = :id AND p.categoria = com.replayclub.api.domain.CategoriaForo.RESENA_VIDEOJUEGO")
    List<Object[]> promedioVideojuego(@Param("id") Long videojuegoId);

    @Query("SELECT AVG(p.calificacion), COUNT(p) FROM PublicacionForo p WHERE p.usuarioValorado.id = :id AND p.categoria = com.replayclub.api.domain.CategoriaForo.OPINION_USUARIO")
    List<Object[]> promedioUsuario(@Param("id") Long usuarioId);

    @Query("""
            SELECT p.etiqueta, COUNT(p) FROM PublicacionForo p
            WHERE p.etiqueta IS NOT NULL GROUP BY p.etiqueta ORDER BY COUNT(p) DESC
            """)
    List<Object[]> temasPopulares(Pageable pageable);

    boolean existsBySolicitudIdAndAutorId(Long solicitudId, Long autorId);

    boolean existsByAutorId(Long autorId);

    long countByAutorId(Long autorId);

    @Query("SELECT p.id, COUNT(c) FROM ComentarioForo c JOIN c.publicacion p WHERE p.id IN :ids GROUP BY p.id")
    List<Object[]> contarComentarios(@Param("ids") Collection<Long> ids);
}
