package com.replayclub.api.repository;

import com.replayclub.api.domain.Rol;
import com.replayclub.api.domain.RolNombre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(RolNombre nombre);
}
