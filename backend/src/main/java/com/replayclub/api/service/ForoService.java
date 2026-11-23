package com.replayclub.api.service;

import com.replayclub.api.domain.*;
import com.replayclub.api.dto.ComunDtos.PageResponse;
import com.replayclub.api.dto.DtoMapper;
import com.replayclub.api.dto.ForoDtos.*;
import com.replayclub.api.exception.AccesoDenegadoException;
import com.replayclub.api.exception.RecursoNoEncontradoException;
import com.replayclub.api.exception.ReglaNegocioException;
import com.replayclub.api.repository.*;
import com.replayclub.api.security.UsuarioPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ForoService {

    private final PublicacionForoRepository publicacionRepository;
    private final ComentarioForoRepository comentarioRepository;
    private final VideojuegoRepository videojuegoRepository;
    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificaciones;

    public ForoService(PublicacionForoRepository publicacionRepository, ComentarioForoRepository comentarioRepository,
                       VideojuegoRepository videojuegoRepository, SolicitudRepository solicitudRepository,
                       UsuarioRepository usuarioRepository, NotificacionService notificaciones) {
        this.publicacionRepository = publicacionRepository;
        this.comentarioRepository = comentarioRepository;
        this.videojuegoRepository = videojuegoRepository;
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificaciones = notificaciones;
    }

    // ------------------------------------------------------------------ publicaciones

    @Transactional(readOnly = true)
    public PageResponse<PublicacionDto> listar(CategoriaForo categoria, String q, Long videojuegoId, Long valoradoId,
                                               Long autorId, Pageable pageable) {
        String filtro = q == null || q.isBlank() ? null : q.trim();
        Page<PublicacionForo> page = publicacionRepository.buscar(categoria, filtro, videojuegoId, valoradoId, autorId, pageable);
        // Conteo de comentarios de toda la página en una sola consulta
        Map<Long, Long> comentarios = new HashMap<>();
        List<Long> ids = page.getContent().stream().map(PublicacionForo::getId).toList();
        if (!ids.isEmpty()) {
            for (Object[] f : publicacionRepository.contarComentarios(ids)) comentarios.put((Long) f[0], (Long) f[1]);
        }
        return PageResponse.of(page, p -> DtoMapper.publicacion(p, comentarios.getOrDefault(p.getId(), 0L)));
    }

    @Transactional(readOnly = true)
    public PublicacionDto detalle(Long id) {
        PublicacionForo p = buscar(id);
        return DtoMapper.publicacion(p, comentarioRepository.countByPublicacionId(id));
    }

    @Transactional
    public PublicacionDto crear(PublicacionRequest req, UsuarioPrincipal yo) {
        Usuario autor = usuarioRepository.findById(yo.getId()).orElseThrow();
        PublicacionForo p = new PublicacionForo();
        p.setAutor(autor);
        p.setCategoria(req.categoria());
        p.setTitulo(req.titulo().trim());
        p.setContenido(req.contenido().trim());
        p.setEtiqueta(req.etiqueta() == null || req.etiqueta().isBlank() ? null : req.etiqueta().trim());

        switch (req.categoria()) {
            case RESENA_VIDEOJUEGO -> {
                Videojuego v = videojuegoRepository.findWithDetalleById(req.videojuegoId())
                        .orElseThrow(() -> ReglaNegocioException.campo("videojuegoId", "El videojuego no existe"));
                p.setVideojuego(v);
                p.setCalificacion(req.calificacion());
                if (p.getEtiqueta() == null) p.setEtiqueta(v.getPlataforma().getNombre());
                publicacionRepository.save(p);
                recalcularVideojuego(v);
            }
            case OPINION_USUARIO -> {
                Solicitud s = solicitudRepository.findWithDetalleById(req.solicitudId())
                        .orElseThrow(() -> ReglaNegocioException.campo("solicitudId", "La transacción no existe"));
                boolean soySolicitante = s.getSolicitante().getId().equals(yo.getId());
                boolean soyPropietario = s.getPropietario().getId().equals(yo.getId());
                if (!soySolicitante && !soyPropietario) {
                    throw new AccesoDenegadoException("Solo puedes opinar sobre transacciones en las que participaste");
                }
                if (s.getEstado() != EstadoSolicitud.FINALIZADO) {
                    throw ReglaNegocioException.campo("solicitudId", "Solo se puede opinar tras una transacción completada");
                }
                if (publicacionRepository.existsBySolicitudIdAndAutorId(s.getId(), yo.getId())) {
                    throw ReglaNegocioException.campo("solicitudId", "Ya opinaste sobre esta transacción");
                }
                Usuario valorado = soySolicitante ? s.getPropietario() : s.getSolicitante();
                p.setSolicitud(s);
                p.setUsuarioValorado(valorado);
                p.setCalificacion(req.calificacion());
                publicacionRepository.save(p);
                recalcularUsuario(valorado);
                notificaciones.crear(valorado, autor.getNombre() + " te dejó una opinión de " + req.calificacion()
                        + " estrellas.", "/perfil/" + valorado.getId());
            }
            case DISCUSION -> publicacionRepository.save(p);
        }
        return DtoMapper.publicacion(p, 0);
    }

    @Transactional
    public void eliminar(Long id, UsuarioPrincipal yo) {
        PublicacionForo p = buscar(id);
        if (!yo.esModeradorOAdmin() && !p.getAutor().getId().equals(yo.getId())) {
            throw new AccesoDenegadoException("Solo el autor o un moderador puede eliminar esta publicación");
        }
        Videojuego v = p.getVideojuego();
        Usuario valorado = p.getUsuarioValorado();
        CategoriaForo cat = p.getCategoria();
        publicacionRepository.delete(p);
        publicacionRepository.flush();
        if (cat == CategoriaForo.RESENA_VIDEOJUEGO && v != null) recalcularVideojuego(v);
        if (cat == CategoriaForo.OPINION_USUARIO && valorado != null) recalcularUsuario(valorado);
        if (!p.getAutor().getId().equals(yo.getId())) {
            notificaciones.crear(p.getAutor(), "Un moderador retiró tu publicación \"" + p.getTitulo()
                    + "\" por no cumplir las normas de la comunidad.", "/comunidad");
        }
    }

    @Transactional(readOnly = true)
    public List<TemaPopularDto> temasPopulares() {
        return publicacionRepository.temasPopulares(PageRequest.of(0, 5)).stream()
                .map(f -> new TemaPopularDto((String) f[0], (Long) f[1])).toList();
    }

    // ------------------------------------------------------------------ comentarios

    @Transactional(readOnly = true)
    public PageResponse<ComentarioDto> comentarios(Long publicacionId, Pageable pageable) {
        if (!publicacionRepository.existsById(publicacionId)) {
            throw new RecursoNoEncontradoException("Publicación", publicacionId);
        }
        return PageResponse.of(comentarioRepository.findByPublicacionId(publicacionId, pageable), DtoMapper::comentario);
    }

    @Transactional
    public ComentarioDto comentar(Long publicacionId, ComentarioRequest req, UsuarioPrincipal yo) {
        PublicacionForo p = buscar(publicacionId);
        Usuario autor = usuarioRepository.findById(yo.getId()).orElseThrow();
        ComentarioForo c = new ComentarioForo();
        c.setPublicacion(p);
        c.setAutor(autor);
        c.setContenido(req.contenido().trim());
        comentarioRepository.save(c);
        if (!p.getAutor().getId().equals(yo.getId())) {
            notificaciones.crear(p.getAutor(), autor.getNombre() + " comentó tu publicación \"" + p.getTitulo() + "\".",
                    "/comunidad/" + p.getId());
        }
        return DtoMapper.comentario(c);
    }

    @Transactional
    public void eliminarComentario(Long id, UsuarioPrincipal yo) {
        ComentarioForo c = comentarioRepository.findWithAutorById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Comentario", id));
        if (!yo.esModeradorOAdmin() && !c.getAutor().getId().equals(yo.getId())) {
            throw new AccesoDenegadoException("Solo el autor o un moderador puede eliminar este comentario");
        }
        comentarioRepository.delete(c);
    }

    // ------------------------------------------------------------------ apoyo

    private PublicacionForo buscar(Long id) {
        return publicacionRepository.findWithDetalleById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Publicación", id));
    }

    private void recalcularVideojuego(Videojuego v) {
        Object[] r = publicacionRepository.promedioVideojuego(v.getId()).get(0);
        v.setCalificacionPromedio(promedio(r[0]));
        v.setTotalResenas(((Long) r[1]).intValue());
    }

    private void recalcularUsuario(Usuario u) {
        Object[] r = publicacionRepository.promedioUsuario(u.getId()).get(0);
        u.setCalificacionPromedio(promedio(r[0]));
        u.setTotalOpiniones(((Long) r[1]).intValue());
    }

    private BigDecimal promedio(Object valor) {
        if (valor == null) return BigDecimal.ZERO;
        return BigDecimal.valueOf(((Number) valor).doubleValue()).setScale(2, RoundingMode.HALF_UP);
    }
}
