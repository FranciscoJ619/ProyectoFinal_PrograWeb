package com.replayclub.api.repository;

import com.replayclub.api.domain.TokenRevocado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface TokenRevocadoRepository extends JpaRepository<TokenRevocado, Long> {

    boolean existsByJti(String jti);

    @Modifying
    @Query("DELETE FROM TokenRevocado t WHERE t.expiracion < :ahora")
    int eliminarExpirados(@Param("ahora") LocalDateTime ahora);
}
