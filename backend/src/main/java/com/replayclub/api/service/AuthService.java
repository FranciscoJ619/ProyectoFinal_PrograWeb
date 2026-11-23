package com.replayclub.api.service;

import com.replayclub.api.domain.RolNombre;
import com.replayclub.api.domain.TokenRecuperacion;
import com.replayclub.api.domain.TokenRevocado;
import com.replayclub.api.domain.Usuario;
import com.replayclub.api.dto.AuthDtos.*;
import com.replayclub.api.dto.DtoMapper;
import com.replayclub.api.exception.ReglaNegocioException;
import com.replayclub.api.repository.RolRepository;
import com.replayclub.api.repository.TokenRecuperacionRepository;
import com.replayclub.api.repository.TokenRevocadoRepository;
import com.replayclub.api.repository.UsuarioRepository;
import com.replayclub.api.security.JwtService;
import com.replayclub.api.security.UsuarioPrincipal;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final TokenRevocadoRepository tokenRevocadoRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificacionService notificaciones;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       UsuarioRepository usuarioRepository, RolRepository rolRepository,
                       TokenRevocadoRepository tokenRevocadoRepository,
                       TokenRecuperacionRepository tokenRecuperacionRepository,
                       PasswordEncoder passwordEncoder, NotificacionService notificaciones) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.tokenRevocadoRepository = tokenRevocadoRepository;
        this.tokenRecuperacionRepository = tokenRecuperacionRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificaciones = notificaciones;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().trim(), req.password()));
        UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
        return respuesta(principal);
    }

    @Transactional
    public AuthResponse registro(RegistroRequest req) {
        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw ReglaNegocioException.campo("email", "Ya existe una cuenta con este correo");
        }
        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setTelefono(req.telefono());
        u.setCiudad(req.ciudad());
        u.setRol(rolRepository.findByNombre(RolNombre.JUGADOR).orElseThrow());
        usuarioRepository.save(u);
        notificaciones.bienvenida(u);
        return respuesta(new UsuarioPrincipal(u));
    }

    /** Invalida el token actual agregando su identificador (jti) a la lista negra. */
    @Transactional
    public void logout(Claims claims) {
        if (claims == null) return;
        tokenRevocadoRepository.eliminarExpirados(LocalDateTime.now());
        if (!tokenRevocadoRepository.existsByJti(claims.getId())) {
            LocalDateTime expira = claims.getExpiration().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            tokenRevocadoRepository.save(new TokenRevocado(claims.getId(), expira));
        }
    }

    /** Siempre responde lo mismo para no revelar qué correos están registrados. */
    @Transactional
    public void olvidePassword(OlvidePasswordRequest req) {
        usuarioRepository.findByEmailIgnoreCase(req.email().trim()).filter(Usuario::isActivo).ifPresent(u -> {
            TokenRecuperacion t = new TokenRecuperacion();
            t.setToken(UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().substring(0, 8));
            t.setUsuario(u);
            t.setExpiracion(LocalDateTime.now().plusMinutes(30));
            tokenRecuperacionRepository.save(t);
            notificaciones.recuperacionPassword(u, t.getToken());
        });
    }

    @Transactional
    public void restablecerPassword(RestablecerPasswordRequest req) {
        TokenRecuperacion t = tokenRecuperacionRepository.findByToken(req.token())
                .orElseThrow(() -> new ReglaNegocioException("El enlace de recuperación no es válido"));
        if (t.isUsado() || t.getExpiracion().isBefore(LocalDateTime.now())) {
            throw new ReglaNegocioException("El enlace de recuperación expiró. Solicita uno nuevo");
        }
        Usuario u = t.getUsuario();
        u.setPassword(passwordEncoder.encode(req.password()));
        t.setUsado(true);
        notificaciones.passwordActualizada(u);
    }

    private AuthResponse respuesta(UsuarioPrincipal principal) {
        Usuario u = usuarioRepository.findById(principal.getId()).orElseThrow();
        return new AuthResponse(jwtService.generarToken(principal), "Bearer", jwtService.getExpirationMs(),
                DtoMapper.usuario(u));
    }
}
