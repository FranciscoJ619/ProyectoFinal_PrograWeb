package com.replayclub.api.dto;

import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public final class ComunDtos {

    private ComunDtos() {
    }

    /** Respuesta paginada estándar de la API (paginación real del lado del servidor). */
    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages,
                                  boolean first, boolean last) {

        public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
            return new PageResponse<>(page.getContent().stream().map(mapper).toList(), page.getNumber(),
                    page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
        }

        public static <T> PageResponse<T> of(Page<T> page) {
            return of(page, Function.identity());
        }
    }

    public record ErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path,
                                Map<String, String> errores) {
    }

    public record NotificacionDto(Long id, String mensaje, String enlace, boolean leida, LocalDateTime fechaCreacion) {
    }

    public record ConteoNotificacionesDto(long noLeidas) {
    }

    public record ArchivoDto(String url) {
    }

    public record EstadisticasDto(long videojuegosDisponibles, long publicacionesRecientes, long jugadores,
                                  long publicacionesComunidad) {
    }

    public record AdminEstadisticasDto(long usuarios, long usuariosActivos, long videojuegos, long publicados,
                                       long solicitudes, Map<String, Long> solicitudesPorEstado,
                                       long publicacionesForo, long plataformas, long generos,
                                       List<Map<String, Object>> videojuegosPorPlataforma) {
    }
}
