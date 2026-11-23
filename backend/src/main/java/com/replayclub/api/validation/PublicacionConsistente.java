package com.replayclub.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Reseña de videojuego -> requiere videojuego y calificación.
 * Opinión sobre usuario -> requiere transacción (solicitud) y calificación.
 */
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PublicacionConsistenteValidator.class)
public @interface PublicacionConsistente {

    String message() default "Faltan datos para esta categoría";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
