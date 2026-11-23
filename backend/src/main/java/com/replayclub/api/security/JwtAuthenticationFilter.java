package com.replayclub.api.security;

import com.replayclub.api.repository.TokenRevocadoRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Lee el header "Authorization: Bearer <token>", valida el JWT, verifica que no esté
 * revocado (logout) y coloca al usuario en el contexto de seguridad.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String ATTR_CLAIMS = "jwt.claims";

    private final JwtService jwtService;
    private final UsuarioDetailsService userDetailsService;
    private final TokenRevocadoRepository tokenRevocadoRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioDetailsService userDetailsService,
                                   TokenRevocadoRepository tokenRevocadoRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenRevocadoRepository = tokenRevocadoRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(7);
            Optional<Claims> claims = jwtService.validar(token);
            if (claims.isPresent() && !tokenRevocadoRepository.existsByJti(claims.get().getId())) {
                try {
                    UsuarioPrincipal usuario = (UsuarioPrincipal) userDetailsService.loadUserByUsername(claims.get().getSubject());
                    if (usuario.isEnabled()) {
                        var auth = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        request.setAttribute(ATTR_CLAIMS, claims.get());
                    }
                } catch (UsernameNotFoundException ignored) {
                    // usuario eliminado: la petición sigue como anónima y termina en 401
                }
            }
        }
        chain.doFilter(request, response);
    }
}
