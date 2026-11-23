package com.replayclub.api.dto;

import com.replayclub.api.domain.EstadoSolicitud;
import com.replayclub.api.domain.TipoSolicitud;
import com.replayclub.api.dto.UsuarioDtos.UsuarioResumenDto;
import com.replayclub.api.validation.RangoFechasValido;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class SolicitudDtos {

    private SolicitudDtos() {
    }

    @RangoFechasValido
    public record SolicitudRequest(
            @NotNull(message = "Indica el videojuego")
            Long videojuegoId,

            @NotNull(message = "Indica si es préstamo o compra")
            TipoSolicitud tipo,

            @FutureOrPresent(message = "La fecha de inicio no puede estar en el pasado")
            LocalDate fechaInicio,

            LocalDate fechaDevolucion,

            @Size(max = 400, message = "El mensaje no puede exceder 400 caracteres")
            String mensaje) {
    }

    public record RespuestaRequest(
            @Size(max = 400, message = "La respuesta no puede exceder 400 caracteres")
            String respuesta) {
    }

    public record VideojuegoMiniDto(Long id, String titulo, String plataforma, String portadaUrl,
                                    BigDecimal precioVenta) {
    }

    public record SolicitudDto(Long id, String folio, TipoSolicitud tipo, EstadoSolicitud estado,
                               LocalDate fechaInicio, LocalDate fechaDevolucion, String mensaje, String respuesta,
                               VideojuegoMiniDto videojuego, UsuarioResumenDto solicitante,
                               UsuarioResumenDto propietario, LocalDateTime fechaSolicitud,
                               LocalDateTime fechaActualizacion) {
    }

    public record ResumenSolicitudesDto(long pendientesEnviadas, long pendientesRecibidas, long aprobados,
                                        long enCurso, long finalizados, long recibidasTotales,
                                        long totalComoSolicitante, long totalComoPropietario) {
    }

    /** Transacción completada que el usuario aún puede valorar en la comunidad. */
    public record TransaccionOpinableDto(Long solicitudId, String folio, TipoSolicitud tipo, String videojuego,
                                         UsuarioResumenDto contraparte) {
    }
}
