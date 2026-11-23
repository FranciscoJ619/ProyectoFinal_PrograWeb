package com.replayclub.api.validation;

import com.replayclub.api.domain.TipoSolicitud;
import com.replayclub.api.dto.SolicitudDtos.SolicitudRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RangoFechasValidoValidator implements ConstraintValidator<RangoFechasValido, SolicitudRequest> {

    @Override
    public boolean isValid(SolicitudRequest req, ConstraintValidatorContext ctx) {
        if (req == null || req.tipo() != TipoSolicitud.PRESTAMO) return true;
        ctx.disableDefaultConstraintViolation();
        boolean valido = true;
        if (req.fechaInicio() == null) {
            ctx.buildConstraintViolationWithTemplate("La fecha de inicio es obligatoria")
                    .addPropertyNode("fechaInicio").addConstraintViolation();
            valido = false;
        }
        if (req.fechaDevolucion() == null) {
            ctx.buildConstraintViolationWithTemplate("La fecha de devolución es obligatoria")
                    .addPropertyNode("fechaDevolucion").addConstraintViolation();
            valido = false;
        }
        if (valido && !req.fechaDevolucion().isAfter(req.fechaInicio())) {
            ctx.buildConstraintViolationWithTemplate("La devolución debe ser posterior a la fecha de inicio")
                    .addPropertyNode("fechaDevolucion").addConstraintViolation();
            valido = false;
        }
        return valido;
    }
}
