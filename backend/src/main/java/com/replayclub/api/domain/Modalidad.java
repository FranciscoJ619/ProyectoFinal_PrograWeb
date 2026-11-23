package com.replayclub.api.domain;

public enum Modalidad {
    VENTA, PRESTAMO, AMBAS;

    public boolean permiteVenta() {
        return this == VENTA || this == AMBAS;
    }

    public boolean permitePrestamo() {
        return this == PRESTAMO || this == AMBAS;
    }
}
