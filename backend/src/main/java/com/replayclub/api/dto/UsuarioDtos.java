package com.replayclub.api.dto;

import com.replayclub.api.domain.RolNombre;
import com.replayclub.api.validation.Patrones;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class UsuarioDtos {

    private UsuarioDtos() {
    }

    /** Datos completos del usuario (para él mismo o para el administrador). */
    public record UsuarioDto(Long id, String nombre, String email, String telefono, String ciudad, String bio,
                             String avatarUrl, RolNombre rol, boolean activo, BigDecimal calificacionPromedio,
                             int totalOpiniones, int transaccionesCompletadas, LocalDateTime fechaRegistro) {
    }

    /** Datos públicos mínimos para tarjetas, tablas y comentarios. */
    public record UsuarioResumenDto(Long id, String nombre, String avatarUrl, String ciudad,
                                    BigDecimal calificacionPromedio, int transaccionesCompletadas) {
    }

    public record PerfilPublicoDto(Long id, String nombre, String avatarUrl, String ciudad, String bio,
                                   RolNombre rol, LocalDateTime fechaRegistro, BigDecimal calificacionPromedio,
                                   int totalOpiniones, int transaccionesCompletadas, long totalVideojuegos,
                                   long totalPublicacionesForo) {
    }

    public record PerfilUpdateRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
            String nombre,

            @NotBlank(message = "El teléfono es obligatorio")
            @Pattern(regexp = Patrones.TELEFONO, message = Patrones.TELEFONO_MSG)
            String telefono,

            @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
            String ciudad,

            @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
            String bio,

            @Size(max = 255, message = "La URL del avatar es demasiado larga")
            String avatarUrl) {
    }

    public record AdminUsuarioCrearRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
            String nombre,

            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Ingresa un correo válido")
            String email,

            @NotBlank(message = "La contraseña es obligatoria")
            @Pattern(regexp = Patrones.PASSWORD, message = Patrones.PASSWORD_MSG)
            String password,

            @Pattern(regexp = Patrones.TELEFONO, message = Patrones.TELEFONO_MSG)
            String telefono,

            @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
            String ciudad,

            @NotNull(message = "Selecciona un rol")
            RolNombre rol) {
    }

    public record AdminUsuarioActualizarRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
            String nombre,

            @NotBlank(message = "El correo es obligatorio")
            @Email(message = "Ingresa un correo válido")
            String email,

            @Pattern(regexp = Patrones.TELEFONO, message = Patrones.TELEFONO_MSG)
            String telefono,

            @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
            String ciudad,

            @NotNull(message = "Selecciona un rol")
            RolNombre rol,

            @NotNull(message = "Indica si el usuario está activo")
            Boolean activo) {
    }

    public record ActivoRequest(@NotNull(message = "Indica el nuevo estado") Boolean activo) {
    }

    public record ContactoRequest(
            @NotBlank(message = "Escribe un mensaje")
            @Size(min = 10, max = 500, message = "El mensaje debe tener entre 10 y 500 caracteres")
            String mensaje,

            Long videojuegoId) {
    }
}
