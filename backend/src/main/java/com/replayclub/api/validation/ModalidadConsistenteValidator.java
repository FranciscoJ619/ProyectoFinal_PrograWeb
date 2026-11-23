package com.replayclub.api.validation;

import com.replayclub.api.dto.VideojuegoDtos.VideojuegoRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ModalidadConsistenteValidator implements ConstraintValidator<ModalidadConsistente, VideojuegoRequest> {

    @Override
    public boolean isValid(VideojuegoRequest req, ConstraintValidatorContext ctx) {
        if (req == null || req.modalidad() == null) return true; // @NotNull se encarga
        boolean valido = true;
        ctx.disableDefaultConstraintViolation();

        if (req.modalidad().permiteVenta() && req.precioVenta() == null) {
            agregar(ctx, "precioVenta", "El precio es obligatorio para vender");
            valido = false;
        }
        if (req.modalidad().permitePrestamo()) {
            if (req.diasMaxPrestamo() == null) {
                agregar(ctx, "diasMaxPrestamo", "Indica la duración máxima del préstamo");
                valido = false;
            }
            if (req.condicionesPrestamo() == null || req.condicionesPrestamo().isBlank()) {
                agregar(ctx, "condicionesPrestamo", "Describe las condiciones de entrega y devolución");
                valido = false;
            }
            if (req.disponibleDesde() == null) {
                agregar(ctx, "disponibleDesde", "Indica desde cuándo está disponible");
                valido = false;
            }
        }
        return valido;
    }

    private void agregar(ConstraintValidatorContext ctx, String campo, String mensaje) {
        ctx.buildConstraintViolationWithTemplate(mensaje).addPropertyNode(campo).addConstraintViolation();
    }
}
