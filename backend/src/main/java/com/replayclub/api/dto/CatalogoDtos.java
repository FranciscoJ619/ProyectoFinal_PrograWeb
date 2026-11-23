package com.replayclub.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class CatalogoDtos {

    private CatalogoDtos() {
    }

    public record PlataformaDto(Long id, String nombre, String fabricante) {
    }

    public record GeneroDto(Long id, String nombre) {
    }

    public record PlataformaRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(max = 60, message = "Máximo 60 caracteres")
            String nombre,

            @NotBlank(message = "El fabricante es obligatorio")
            @Size(max = 60, message = "Máximo 60 caracteres")
            String fabricante) {
    }

    public record GeneroRequest(
            @NotBlank(message = "El nombre es obligatorio")
            @Size(max = 60, message = "Máximo 60 caracteres")
            String nombre) {
    }
}
