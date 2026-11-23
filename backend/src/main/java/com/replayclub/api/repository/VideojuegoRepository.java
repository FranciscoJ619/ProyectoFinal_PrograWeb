package com.replayclub.api.repository;

import com.replayclub.api.domain.EstadoPublicacion;
import com.replayclub.api.domain.Videojuego;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VideojuegoRepository extends JpaRepository<Videojuego, Long>, JpaSpecificationExecutor<Videojuego> {

    /** Catálogo paginado con filtros dinámicos; plataforma y propietario vienen en el mismo SELECT. */
    @Override
    @EntityGraph(attributePaths = {"plataforma", "propietario"})
    Page<Videojuego> findAll(Specification<Videojuego> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"plataforma", "propietario", "propietario.rol"})
    Optional<Videojuego> findWithDetalleById(Long id);

    long countByEstadoPublicacion(EstadoPublicacion estado);

    long countByEstadoPublicacionAndFechaPublicacionAfter(EstadoPublicacion estado, LocalDateTime desde);

    long countByPlataformaId(Long plataformaId);

    @Query("SELECT COUNT(v) FROM Videojuego v JOIN v.generos g WHERE g.id = :generoId")
    long countByGeneroId(@Param("generoId") Long generoId);

    long countByPropietarioId(Long propietarioId);

    @Query("""
            SELECT v.plataforma.nombre, COUNT(v) FROM Videojuego v
            WHERE v.estadoPublicacion = com.replayclub.api.domain.EstadoPublicacion.PUBLICADO
            GROUP BY v.plataforma.nombre ORDER BY COUNT(v) DESC
            """)
    List<Object[]> contarPorPlataforma();
}
