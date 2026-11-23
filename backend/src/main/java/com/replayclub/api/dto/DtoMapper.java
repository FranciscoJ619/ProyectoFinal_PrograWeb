package com.replayclub.api.dto;

import com.replayclub.api.domain.*;
import com.replayclub.api.dto.CatalogoDtos.GeneroDto;
import com.replayclub.api.dto.CatalogoDtos.PlataformaDto;
import com.replayclub.api.dto.ComunDtos.NotificacionDto;
import com.replayclub.api.dto.ForoDtos.*;
import com.replayclub.api.dto.SolicitudDtos.SolicitudDto;
import com.replayclub.api.dto.SolicitudDtos.VideojuegoMiniDto;
import com.replayclub.api.dto.UsuarioDtos.UsuarioDto;
import com.replayclub.api.dto.UsuarioDtos.UsuarioResumenDto;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoCardDto;
import com.replayclub.api.dto.VideojuegoDtos.VideojuegoDetalleDto;

import java.util.Comparator;

/** Convierte entidades JPA en DTOs. Las entidades nunca salen de la capa de servicio. */
public final class DtoMapper {

    private DtoMapper() {
    }

    public static UsuarioDto usuario(Usuario u) {
        return new UsuarioDto(u.getId(), u.getNombre(), u.getEmail(), u.getTelefono(), u.getCiudad(), u.getBio(),
                u.getAvatarUrl(), u.getRol().getNombre(), u.isActivo(), u.getCalificacionPromedio(),
                u.getTotalOpiniones(), u.getTransaccionesCompletadas(), u.getFechaRegistro());
    }

    public static UsuarioResumenDto resumen(Usuario u) {
        if (u == null) return null;
        return new UsuarioResumenDto(u.getId(), u.getNombre(), u.getAvatarUrl(), u.getCiudad(),
                u.getCalificacionPromedio(), u.getTransaccionesCompletadas());
    }

    public static PlataformaDto plataforma(Plataforma p) {
        return new PlataformaDto(p.getId(), p.getNombre(), p.getFabricante());
    }

    public static GeneroDto genero(Genero g) {
        return new GeneroDto(g.getId(), g.getNombre());
    }

    public static VideojuegoCardDto card(Videojuego v) {
        return new VideojuegoCardDto(v.getId(), v.getTitulo(), v.getPlataforma().getNombre(), v.getEstadoFisico(),
                v.getModalidad(), v.getPrecioVenta(), v.getDiasMaxPrestamo(), v.getEstadoPublicacion(),
                v.getCalificacionPromedio(), v.getTotalResenas(), v.getPortadaUrl(), v.getUbicacion(),
                resumen(v.getPropietario()), v.getFechaPublicacion());
    }

    public static VideojuegoDetalleDto detalle(Videojuego v) {
        return new VideojuegoDetalleDto(v.getId(), v.getTitulo(), v.getDescripcion(), v.getAnioLanzamiento(),
                v.getEstadoFisico(), v.getModalidad(), v.getPrecioVenta(), v.getDiasMaxPrestamo(),
                v.getCondicionesPrestamo(), v.getDisponibleDesde(), v.getUbicacion(), v.getEstadoPublicacion(),
                v.getCalificacionPromedio(), v.getTotalResenas(), plataforma(v.getPlataforma()),
                v.getGeneros().stream().sorted(Comparator.comparing(Genero::getNombre)).map(DtoMapper::genero).toList(),
                v.getImagenes().stream().map(ImagenVideojuego::getUrl).toList(),
                resumen(v.getPropietario()), v.getFechaPublicacion());
    }

    public static SolicitudDto solicitud(Solicitud s) {
        Videojuego v = s.getVideojuego();
        VideojuegoMiniDto mini = new VideojuegoMiniDto(v.getId(), v.getTitulo(), v.getPlataforma().getNombre(),
                v.getPortadaUrl(), v.getPrecioVenta());
        return new SolicitudDto(s.getId(), s.getFolio(), s.getTipo(), s.getEstado(), s.getFechaInicio(),
                s.getFechaDevolucion(), s.getMensaje(), s.getRespuesta(), mini, resumen(s.getSolicitante()),
                resumen(v.getPropietario()), s.getFechaSolicitud(), s.getFechaActualizacion());
    }

    public static PublicacionDto publicacion(PublicacionForo p, long totalComentarios) {
        VideojuegoRefDto vj = p.getVideojuego() == null ? null
                : new VideojuegoRefDto(p.getVideojuego().getId(), p.getVideojuego().getTitulo(),
                p.getVideojuego().getPlataforma().getNombre());
        SolicitudRefDto sol = null;
        if (p.getSolicitud() != null) {
            Solicitud s = p.getSolicitud();
            sol = new SolicitudRefDto(s.getId(), s.getFolio(), s.getTipo(), s.getVideojuego().getTitulo());
        }
        return new PublicacionDto(p.getId(), p.getCategoria(), p.getTitulo(), p.getContenido(), p.getEtiqueta(),
                p.getCalificacion(), resumen(p.getAutor()), vj, resumen(p.getUsuarioValorado()), sol,
                totalComentarios, p.getFechaCreacion());
    }

    public static ComentarioDto comentario(ComentarioForo c) {
        return new ComentarioDto(c.getId(), c.getContenido(), resumen(c.getAutor()), c.getFechaCreacion());
    }

    public static NotificacionDto notificacion(Notificacion n) {
        return new NotificacionDto(n.getId(), n.getMensaje(), n.getEnlace(), n.isLeida(), n.getFechaCreacion());
    }
}
