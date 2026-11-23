package com.replayclub.api.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_revocados")
public class TokenRevocado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String jti;

    @Column(nullable = false)
    private LocalDateTime expiracion;

    protected TokenRevocado() {
    }

    public TokenRevocado(String jti, LocalDateTime expiracion) {
        this.jti = jti;
        this.expiracion = expiracion;
    }

    public Long getId() { return id; }
    public String getJti() { return jti; }
    public LocalDateTime getExpiracion() { return expiracion; }
}
