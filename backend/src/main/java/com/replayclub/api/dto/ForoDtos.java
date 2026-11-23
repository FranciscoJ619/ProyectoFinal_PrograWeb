package com.replayclub.api.dto;

import com.replayclub.api.domain.CategoriaForo;
import com.replayclub.api.domain.TipoSolicitud;
import com.replayclub.api.dto.UsuarioDtos.UsuarioResumenDto;
import com.replayclub.api.validation.PublicacionConsistente;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public final class ForoDtos {

    private ForoDtos() {
    }

    @PublicacionConsistente
    public record PublicacionRequest(
            @NotNull(message = "Selecciona una categoría")
            CategoriaForo categoria,

            @NotBlank(message = "El título es obligatorio")
            @Size(min = 5, max = 150, message = "El título debe tener entre 5 y 150 caracteres")
            String titulo,

            @NotBlank(message = "El contenido es obligatorio")
            @Size(min = 20, max = 3000, message = "El contenido debe tener entre 20 y 3000 caracteres")
            String contenido,

            @Size(max = 60, message = "La etiqueta no puede exceder 60 caracteres")
            String etiqueta,

            @Min(value = 1, message = "La calificación mínima es 1")
            @Max(value = 5, message = "La calificación máxima es 5")
            Integer calificacion,

            Long videojuegoId,

            Long solicitudId) {
    }

    public record ComentarioRequest(
            @NotBlank(message = "El comentario no puede estar vacío")
            @Size(min = 2, max = 800, message = "El comentario debe tener entre 2 y 800 caracteres")
            String contenido) {
    }

    public record VideojuegoRefDto(Long id, String titulo, String plataforma) {
    }

    public record SolicitudRefDto(Long id, String folio, TipoSolicitud tipo, String videojuego) {
    }

    public record PublicacionDto(Long id, CategoriaForo categoria, String titulo, String contenido, String etiqueta,
                                 Integer calificacion, UsuarioResumenDto autor, VideojuegoRefDto videojuego,
                                 UsuarioResumenDto usuarioValorado, SolicitudRefDto solicitud,
                                 long totalComentarios, LocalDateTime fechaCreacion) {
    }

    public record ComentarioDto(Long id, String contenido, UsuarioResumenDto autor, LocalDateTime fechaCreacion) {
    }

    public record TemaPopularDto(String nombre, long total) {
    }
}
