package com.replayclub.api.repository;

import com.replayclub.api.domain.RolNombre;
import com.replayclub.api.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByRolNombreAndActivoTrue(RolNombre rol);

    long countByActivoTrue();

    @Query("""
            SELECT u FROM Usuario u JOIN FETCH u.rol r
            WHERE (:q IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:rol IS NULL OR r.nombre = :rol)
              AND (:activo IS NULL OR u.activo = :activo)
            """)
    Page<Usuario> buscar(@Param("q") String q,
                         @Param("rol") RolNombre rol,
                         @Param("activo") Boolean activo,
                         Pageable pageable);
}
