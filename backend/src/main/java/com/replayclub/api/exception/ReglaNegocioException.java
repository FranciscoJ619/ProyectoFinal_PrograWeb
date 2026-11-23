package com.replayclub.api.exception;

import java.util.Map;

/** 422 - los datos son válidos en formato, pero violan una regla del negocio. */
public class ReglaNegocioException extends RuntimeException {

    private final Map<String, String> errores;

    public ReglaNegocioException(String mensaje) {
        this(mensaje, null);
    }

    public ReglaNegocioException(String mensaje, Map<String, String> errores) {
        super(mensaje);
        this.errores = errores;
    }

    /** Error asociado a un campo concreto del formulario (se muestra bajo el input). */
    public static ReglaNegocioException campo(String campo, String mensaje) {
        return new ReglaNegocioException(mensaje, Map.of(campo, mensaje));
    }

    public Map<String, String> getErrores() {
        return errores;
    }
}
