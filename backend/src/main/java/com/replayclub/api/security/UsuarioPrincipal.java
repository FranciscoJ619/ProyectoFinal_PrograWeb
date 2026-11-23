package com.replayclub.api.security;

import com.replayclub.api.domain.RolNombre;
import com.replayclub.api.domain.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/** Usuario autenticado disponible en los controladores con @AuthenticationPrincipal. */
public class UsuarioPrincipal implements UserDetails {

    private final Long id;
    private final String nombre;
    private final String email;
    private final String password;
    private final RolNombre rol;
    private final boolean activo;

    public UsuarioPrincipal(Usuario u) {
        this.id = u.getId();
        this.nombre = u.getNombre();
        this.email = u.getEmail();
        this.password = u.getPassword();
        this.rol = u.getRol().getNombre();
        this.activo = u.isActivo();
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
    public RolNombre getRol() { return rol; }

    public boolean esAdmin() {
        return rol == RolNombre.ADMIN;
    }

    public boolean esModeradorOAdmin() {
        return rol == RolNombre.ADMIN || rol == RolNombre.MODERADOR;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isEnabled() { return activo; }
}
