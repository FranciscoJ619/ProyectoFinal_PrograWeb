package com.replayclub.api.validation;

import com.replayclub.api.dto.ForoDtos.PublicacionRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PublicacionConsistenteValidator implements ConstraintValidator<PublicacionConsistente, PublicacionRequest> {

    @Override
    public boolean isValid(PublicacionRequest req, ConstraintValidatorContext ctx) {
        if (req == null || req.categoria() == null) return true;
        ctx.disableDefaultConstraintViolation();
        boolean valido = true;
        switch (req.categoria()) {
            case RESENA_VIDEOJUEGO -> {
                if (req.videojuegoId() == null) {
                    agregar(ctx, "videojuegoId", "Selecciona el videojuego que reseñas");
                    valido = false;
                }
                if (req.calificacion() == null) {
                    agregar(ctx, "calificacion", "Califica el videojuego de 1 a 5 estrellas");
                    valido = false;
                }
            }
            case OPINION_USUARIO -> {
                if (req.solicitudId() == null) {
                    agregar(ctx, "solicitudId", "Selecciona la transacción completada que quieres valorar");
                    valido = false;
                }
                if (req.calificacion() == null) {
                    agregar(ctx, "calificacion", "Califica al usuario de 1 a 5 estrellas");
                    valido = false;
                }
            }
            case DISCUSION -> {
                if (req.calificacion() != null) {
                    agregar(ctx, "calificacion", "Las discusiones generales no llevan calificación");
                    valido = false;
                }
            }
        }
        return valido;
    }

    private void agregar(ConstraintValidatorContext ctx, String campo, String mensaje) {
        ctx.buildConstraintViolationWithTemplate(mensaje).addPropertyNode(campo).addConstraintViolation();
    }
}
