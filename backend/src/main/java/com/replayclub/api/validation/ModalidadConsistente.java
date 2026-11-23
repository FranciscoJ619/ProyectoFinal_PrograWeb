package com.replayclub.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Valida que una publicación tenga los campos que exige su modalidad:
 * venta -> precio; préstamo -> duración máxima y condiciones.
 */
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ModalidadConsistenteValidator.class)
public @interface ModalidadConsistente {

    String message() default "Los datos no corresponden con la modalidad elegida";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
