package com.replayclub.api.controller;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

final class Paginacion {

    static final String PAGE_DEFAULT = "0";
    static final String SIZE_DEFAULT = "10";

    private Paginacion() {
    }

    static Pageable de(int page, int size, Sort sort) {
        return PageRequest.of(page, size, sort);
    }
}
