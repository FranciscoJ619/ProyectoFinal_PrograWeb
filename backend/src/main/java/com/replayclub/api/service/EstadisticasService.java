package com.replayclub.api.service;

import com.replayclub.api.domain.EstadoPublicacion;
import com.replayclub.api.domain.EstadoSolicitud;
import com.replayclub.api.dto.ComunDtos.AdminEstadisticasDto;
import com.replayclub.api.dto.ComunDtos.EstadisticasDto;
import com.replayclub.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EstadisticasService {

    private final VideojuegoRepository videojuegoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SolicitudRepository solicitudRepository;
    private final PublicacionForoRepository publicacionRepository;
    private final PlataformaRepository plataformaRepository;
    private final GeneroRepository generoRepository;
    private final UsuarioService usuarioService;

    public EstadisticasService(VideojuegoRepository videojuegoRepository, UsuarioRepository usuarioRepository,
                               SolicitudRepository solicitudRepository, PublicacionForoRepository publicacionRepository,
                               PlataformaRepository plataformaRepository, GeneroRepository generoRepository,
                               UsuarioService usuarioService) {
        this.videojuegoRepository = videojuegoRepository;
        this.usuarioRepository = usuarioRepository;
        this.solicitudRepository = solicitudRepository;
        this.publicacionRepository = publicacionRepository;
        this.plataformaRepository = plataformaRepository;
        this.generoRepository = generoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public EstadisticasDto generales() {
        return new EstadisticasDto(
                videojuegoRepository.countByEstadoPublicacion(EstadoPublicacion.PUBLICADO),
                videojuegoRepository.countByEstadoPublicacionAndFechaPublicacionAfter(EstadoPublicacion.PUBLICADO,
                        LocalDateTime.now().minusDays(7)),
                usuarioService.contarJugadoresActivos(),
                publicacionRepository.count());
    }

    @Transactional(readOnly = true)
    public AdminEstadisticasDto admin() {
        Map<String, Long> porEstado = new LinkedHashMap<>();
        for (EstadoSolicitud e : EstadoSolicitud.values()) porEstado.put(e.name(), 0L);
        for (Object[] f : solicitudRepository.contarPorEstado()) porEstado.put(((EstadoSolicitud) f[0]).name(), (Long) f[1]);

        List<Map<String, Object>> porPlataforma = videojuegoRepository.contarPorPlataforma().stream()
                .map(f -> Map.<String, Object>of("plataforma", f[0], "total", f[1])).toList();

        return new AdminEstadisticasDto(
                usuarioRepository.count(),
                usuarioRepository.countByActivoTrue(),
                videojuegoRepository.count(),
                videojuegoRepository.countByEstadoPublicacion(EstadoPublicacion.PUBLICADO),
                solicitudRepository.count(),
                porEstado,
                publicacionRepository.count(),
                plataformaRepository.count(),
                generoRepository.count(),
                porPlataforma);
    }
}
