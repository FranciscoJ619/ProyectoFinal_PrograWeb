package com.replayclub.api.validation;

public final class Patrones {

    /** Mínimo 8 caracteres, una mayúscula, un número y un carácter especial. */
    public static final String PASSWORD = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s]).{8,72}$";
    public static final String PASSWORD_MSG =
            "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial";

    /** Teléfono en formato internacional E.164, ej. +525512345678 */
    public static final String TELEFONO = "^\\+[1-9]\\d{9,14}$";
    public static final String TELEFONO_MSG = "Usa formato internacional, por ejemplo +525512345678";

    private Patrones() {
    }
}
