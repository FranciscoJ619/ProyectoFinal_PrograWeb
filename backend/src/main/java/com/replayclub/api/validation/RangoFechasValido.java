package com.replayclub.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/** En un préstamo, ambas fechas son obligatorias y la devolución debe ser posterior al inicio. */
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = RangoFechasValidoValidator.class)
public @interface RangoFechasValido {

    String message() default "El rango de fechas no es válido";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
