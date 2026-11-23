package com.replayclub.api.repository;

import com.replayclub.api.domain.ComentarioForo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComentarioForoRepository extends JpaRepository<ComentarioForo, Long> {

    @EntityGraph(attributePaths = {"autor"})
    Page<ComentarioForo> findByPublicacionId(Long publicacionId, Pageable pageable);

    @EntityGraph(attributePaths = {"autor", "publicacion"})
    java.util.Optional<ComentarioForo> findWithAutorById(Long id);

    long countByPublicacionId(Long publicacionId);
}
