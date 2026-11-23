package com.replayclub.api.dto;

import com.replayclub.api.domain.EstadoFisico;
import com.replayclub.api.domain.EstadoPublicacion;
import com.replayclub.api.domain.Modalidad;
import com.replayclub.api.dto.CatalogoDtos.GeneroDto;
import com.replayclub.api.dto.CatalogoDtos.PlataformaDto;
import com.replayclub.api.dto.UsuarioDtos.UsuarioResumenDto;
import com.replayclub.api.validation.ModalidadConsistente;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class VideojuegoDtos {

    private VideojuegoDtos() {
    }

    @ModalidadConsistente
    public record VideojuegoRequest(
            @NotBlank(message = "El nombre del videojuego es obligatorio")
            @Size(min = 2, max = 120, message = "El nombre debe tener entre 2 y 120 caracteres")
            String titulo,

            @NotNull(message = "Selecciona una plataforma")
            Long plataformaId,

            @NotEmpty(message = "Selecciona al menos un género")
            @Size(max = 3, message = "Máximo 3 géneros")
            List<@NotNull Long> generoIds,

            @NotBlank(message = "La descripción es obligatoria")
            @Size(min = 20, max = 600, message = "La descripción debe tener entre 20 y 600 caracteres")
            String descripcion,

            @Min(value = 1970, message = "Año no válido")
            @Max(value = 2100, message = "Año no válido")
            Integer anioLanzamiento,

            @NotNull(message = "Selecciona el estado físico")
            EstadoFisico estadoFisico,

            @NotNull(message = "Selecciona una modalidad")
            Modalidad modalidad,

            @DecimalMin(value = "1.00", message = "El precio debe ser mayor a 0")
            @DecimalMax(value = "99999.99", message = "El precio es demasiado alto")
            @Digits(integer = 5, fraction = 2, message = "Máximo 2 decimales")
            BigDecimal precioVenta,

            @Min(value = 1, message = "Mínimo 1 día")
            @Max(value = 30, message = "Máximo 30 días")
            Integer diasMaxPrestamo,

            @Size(max = 400, message = "Máximo 400 caracteres")
            String condicionesPrestamo,

            @FutureOrPresent(message = "La fecha no puede estar en el pasado")
            LocalDate disponibleDesde,

            @NotBlank(message = "Indica la zona de entrega")
            @Size(max = 120, message = "Máximo 120 caracteres")
            String ubicacion,

            @Size(max = 6, message = "Máximo 6 fotografías")
            List<@NotBlank @Size(max = 255) String> imagenes,

            /** true = guardar como borrador, false/null = publicar. */
            Boolean borrador) {
    }

    public record EstadoPublicacionRequest(
            @NotNull(message = "Indica el nuevo estado")
            EstadoPublicacion estado) {
    }

    /** Tarjeta del catálogo. */
    public record VideojuegoCardDto(Long id, String titulo, String plataforma, EstadoFisico estadoFisico,
                                    Modalidad modalidad, BigDecimal precioVenta, Integer diasMaxPrestamo,
                                    EstadoPublicacion estadoPublicacion, BigDecimal calificacionPromedio,
                                    int totalResenas, String portadaUrl, String ubicacion,
                                    UsuarioResumenDto propietario, LocalDateTime fechaPublicacion) {
    }

    /** Ficha completa del ejemplar. */
    public record VideojuegoDetalleDto(Long id, String titulo, String descripcion, Integer anioLanzamiento,
                                       EstadoFisico estadoFisico, Modalidad modalidad, BigDecimal precioVenta,
                                       Integer diasMaxPrestamo, String condicionesPrestamo,
                                       LocalDate disponibleDesde, String ubicacion,
                                       EstadoPublicacion estadoPublicacion, BigDecimal calificacionPromedio,
                                       int totalResenas, PlataformaDto plataforma, List<GeneroDto> generos,
                                       List<String> imagenes, UsuarioResumenDto propietario,
                                       LocalDateTime fechaPublicacion) {
    }
}
