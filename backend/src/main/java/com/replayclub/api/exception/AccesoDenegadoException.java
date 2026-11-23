package com.replayclub.api.exception;

/** 403 - el usuario está autenticado pero no puede operar sobre este recurso. */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
