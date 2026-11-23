package com.replayclub.api.repository;

import com.replayclub.api.domain.TokenRecuperacion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long> {

    @EntityGraph(attributePaths = {"usuario"})
    Optional<TokenRecuperacion> findByToken(String token);
}
