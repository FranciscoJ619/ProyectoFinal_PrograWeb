package com.replayclub.api.service;

import com.replayclub.api.domain.RolNombre;
import com.replayclub.api.domain.Usuario;
import com.replayclub.api.domain.Videojuego;
import com.replayclub.api.dto.AuthDtos.CambiarPasswordRequest;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.DtoMapper;
import com.replayclub.api.dto.UsuarioDtos.*;
import com.replayclub.api.exception.RecursoNoEncontradoException;
import com.replayclub.api.exception.ReglaNegocioException;
import com.replayclub.api.repository.*;
import com.replayclub.api.security.UsuarioPrincipal;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final VideojuegoRepository videojuegoRepository;
    private final SolicitudRepository solicitudRepository;
    private final PublicacionForoRepository publicacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificacionService notificaciones;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                          VideojuegoRepository videojuegoRepository, SolicitudRepository solicitudRepository,
                          PublicacionForoRepository publicacionRepository, PasswordEncoder passwordEncoder,
                          NotificacionService notificaciones) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.videojuegoRepository = videojuegoRepository;
        this.solicitudRepository = solicitudRepository;
        this.publicacionRepository = publicacionRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificaciones = notificaciones;
    }

    public Usuario buscar(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Usuario", id));
    }

    // ------------------------------------------------------------------ mi cuenta

    @Transactional(readOnly = true)
    public UsuarioDto yo(Long id) {
        return DtoMapper.usuario(buscar(id));
    }

    @Transactional
    public UsuarioDto actualizarPerfil(Long id, PerfilUpdateRequest req) {
        Usuario u = buscar(id);
        u.setNombre(req.nombre().trim());
        u.setTelefono(req.telefono());
        u.setCiudad(req.ciudad());
        u.setBio(req.bio());
        u.setAvatarUrl(req.avatarUrl() == null || req.avatarUrl().isBlank() ? null : req.avatarUrl());
        return DtoMapper.usuario(u);
    }

    @Transactional
    public void cambiarPassword(Long id, CambiarPasswordRequest req) {
        Usuario u = buscar(id);
        if (!passwordEncoder.matches(req.actual(), u.getPassword())) {
            throw ReglaNegocioException.campo("actual", "La contraseña actual no es correcta");
        }
        if (passwordEncoder.matches(req.nueva(), u.getPassword())) {
            throw ReglaNegocioException.campo("nueva", "La nueva contraseña debe ser distinta a la actual");
        }
        u.setPassword(passwordEncoder.encode(req.nueva()));
        notificaciones.passwordActualizada(u);
    }

    @Transactional(readOnly = true)
    public PerfilPublicoDto perfilPublico(Long id) {
        Usuario u = buscar(id);
        if (!u.isActivo()) throw new RecursoNoEncontradoException("Usuario", id);
        return new PerfilPublicoDto(u.getId(), u.getNombre(), u.getAvatarUrl(), u.getCiudad(), u.getBio(),
                u.getRol().getNombre(), u.getFechaRegistro(), u.getCalificacionPromedio(), u.getTotalOpiniones(),
                u.getTransaccionesCompletadas(), videojuegoRepository.countByPropietarioId(id),
                publicacionRepository.countByAutorId(id));
    }

    @Transactional
    public void contactar(UsuarioPrincipal yo, Long destinatarioId, ContactoRequest req) {
        if (yo.getId().equals(destinatarioId)) {
            throw new ReglaNegocioException("No puedes enviarte un mensaje a ti mismo");
        }
        Usuario remitente = buscar(yo.getId());
        Usuario destinatario = buscar(destinatarioId);
        if (!destinatario.isActivo()) throw new RecursoNoEncontradoException("Usuario", destinatarioId);
        String juego = null;
        if (req.videojuegoId() != null) {
            Videojuego v = videojuegoRepository.findById(req.videojuegoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Videojuego", req.videojuegoId()));
            juego = v.getTitulo();
        }
        notificaciones.contacto(remitente, destinatario, req.mensaje().trim(), juego);
    }

    // ------------------------------------------------------------------ administración

    @Transactional(readOnly = true)
    public PageResponse<UsuarioDto> listar(String q, RolNombre rol, Boolean activo, Pageable pageable) {
        String filtro = q == null || q.isBlank() ? null : q.trim();
        return PageResponse.of(usuarioRepository.buscar(filtro, rol, activo, pageable), DtoMapper::usuario);
    }

    @Transactional
    public UsuarioDto crear(AdminUsuarioCrearRequest req) {
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
        u.setRol(rolRepository.findByNombre(req.rol()).orElseThrow());
        usuarioRepository.save(u);
        return DtoMapper.usuario(u);
    }

    @Transactional
    public UsuarioDto actualizar(Long id, AdminUsuarioActualizarRequest req, UsuarioPrincipal admin) {
        Usuario u = buscar(id);
        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw ReglaNegocioException.campo("email", "Ya existe otra cuenta con este correo");
        }
        if (admin.getId().equals(id) && (req.rol() != RolNombre.ADMIN || !req.activo())) {
            throw new ReglaNegocioException("No puedes quitarte el rol de administrador ni desactivar tu propia cuenta");
        }
        u.setNombre(req.nombre().trim());
        u.setEmail(email);
        u.setTelefono(req.telefono());
        u.setCiudad(req.ciudad());
        u.setActivo(req.activo());
        u.setRol(rolRepository.findByNombre(req.rol()).orElseThrow());
        return DtoMapper.usuario(u);
    }

    @Transactional
    public UsuarioDto cambiarActivo(Long id, boolean activo, UsuarioPrincipal admin) {
        if (admin.getId().equals(id)) {
            throw new ReglaNegocioException("No puedes desactivar tu propia cuenta");
        }
        Usuario u = buscar(id);
        u.setActivo(activo);
        return DtoMapper.usuario(u);
    }

    @Transactional
    public void eliminar(Long id, UsuarioPrincipal admin) {
        if (admin.getId().equals(id)) {
            throw new ReglaNegocioException("No puedes eliminar tu propia cuenta");
        }
        Usuario u = buscar(id);
        if (videojuegoRepository.countByPropietarioId(id) > 0 || solicitudRepository.existsBySolicitanteId(id)
                || publicacionRepository.existsByAutorId(id)) {
            throw new ReglaNegocioException("El usuario tiene videojuegos, solicitudes o publicaciones. "
                    + "Desactívalo en lugar de eliminarlo para conservar el historial");
        }
        usuarioRepository.delete(u);
    }

    /** Útil para estadísticas: jugadores activos. */
    @Transactional(readOnly = true)
    public long contarJugadoresActivos() {
        return usuarioRepository.countByRolNombreAndActivoTrue(RolNombre.JUGADOR);
    }
}
